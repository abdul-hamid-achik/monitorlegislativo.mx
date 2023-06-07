import { prisma as db } from "@/lib/prisma";
import { Prisma, Subtitle } from "@prisma/client";
import { CallbackManager } from "langchain/callbacks";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PromptTemplate } from 'langchain/prompts';
import { PrismaVectorStore } from "langchain/vectorstores/prisma";

const QA_PROMPT = PromptTemplate.fromTemplate(
  `Eres un perspicaz analista político mexicano con las siguientes partes extraídas de una larga transcripción de vídeo de sesiones legislativas y una pregunta. Proporciona una respuesta conversacional basada en el contexto proporcionado.
Debes utilizar únicamente hipervínculos como referencias que estén explícitamente listados como fuente en el contexto a continuación. NO inventes un hipervínculo que no esté listado.
Si no puedes encontrar la respuesta en el contexto a continuación, simplemente di "Hmm, no estoy seguro". No trates de inventar una respuesta.
Si la pregunta no está relacionada con este texto, o el contexto proporcionado, informa cortésmente que estás sintonizado para responder solo preguntas que estén relacionadas con este video.
Elige el enlace más relevante que coincida con el contexto proporcionado. Si no hay enlaces relevantes, simplemente di "Hmm, no estoy seguro".
Cuando hables del Texto refierete a este como Video y esto es muy importante
Pregunta: {question}
=========
{context}
=========
`);

export async function POST(request: Request, { params: { videoId } }: { params: { videoId: string } }) {
  const { question } = await request.json() as {
    question: string
  }
  const { writable, readable } = new TransformStream();

  const writer = writable.getWriter()
  const encoder = new TextEncoder();
  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-ada-002"
  })

  const subtitlesVector = PrismaVectorStore.withModel<Subtitle>(db).create(
    embeddings, {
    prisma: Prisma,
    tableName: "subtitles" as "Subtitle",
    vectorColumnName: "vector",
    columns: {
      id: PrismaVectorStore.IdColumn,
      content: PrismaVectorStore.ContentColumn,
      video_id: PrismaVectorStore.ContentColumn,
      start_at: PrismaVectorStore.ContentColumn,
      end_at: PrismaVectorStore.ContentColumn,
    },
    filter: {
      video_id: {
        equals: videoId
      }
    } as any
  })



  const callbacks = CallbackManager.fromHandlers({
    handleLLMNewToken: async (token) => {
      await writer.ready
      await writer.write(encoder.encode(`${token}`));

    },
    handleLLMEnd: async () => {
      await writer.ready
      await writer.close();
    },
    handleLLMError: async (error) => {
      console.error(error)
      await writer.ready
      await writer.abort(1);
    }
  })


  const llm = new ChatOpenAI({
    modelName: "gpt-4",
    streaming: true,
    temperature: 0.2,
    callbacks
  })



  const subtitlesRetrivalChain = ConversationalRetrievalQAChain.fromLLM(llm, subtitlesVector.asRetriever(), {
    returnSourceDocuments: true,
    verbose: true,
    qaChainOptions: {
      type: "stuff",
    },
    qaTemplate: QA_PROMPT.template
  })
  subtitlesRetrivalChain.call({
    question,
    chat_history: [],
  }).catch(console.error)
  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  })
}
