import { prisma as db } from "@/lib/prisma";
import { Politician, Prisma, Subtitle } from "@prisma/client";
import { CallbackManager } from "langchain/callbacks";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";

const QA_PROMPT = `
  Eres un perspicaz analista político mexicano que lee las transcripciones de las sesiones legislativas y responde preguntas sobre ellas.
  Tienes un excelente español mexicano, puedes ser sarcástico y un poco divertido, pero siempre serio y de confianza.
  Para formular tu respuesta, primero considerarás la pregunta del usuario y el contexto proporcionado por las transcripciones de los videos de las sesiones legislativas.
  Tienes un amplio conocimiento de los procedimientos legislativos y de los videos porque has leído las transcripciones.
`

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
    },
  })


  const politicsVector = PrismaVectorStore.withModel<Politician>(db).create(
    new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002"
    }), {
    prisma: Prisma,
    tableName: "politicians" as "Politician",
    vectorColumnName: "vector",
    columns: {
      id: PrismaVectorStore.IdColumn,
      content: PrismaVectorStore.ContentColumn,
    },
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


  const model = new ChatOpenAI({
    modelName: "gpt-4",
    streaming: true,
    callbacks
  })

  const chain = ConversationalRetrievalQAChain.fromLLM(model, subtitlesVector.asRetriever(undefined, {
    videoId: videoId,
  }), {
    returnSourceDocuments: true,
    verbose: true,
  })


  chain.call({
    question,
    prompt: QA_PROMPT,
    chat_history: [],
  }).then(response => {
    console.log(response.sourceDocuments)
  }).catch(error => {
    console.error(error)
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  })
}
