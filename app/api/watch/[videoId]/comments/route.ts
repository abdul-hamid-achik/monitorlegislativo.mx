import { prisma as db } from "@/lib/prisma";
import { Politician, Prisma, Subtitle } from "@prisma/client";
import { CallbackManager } from "langchain/callbacks";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";

const QA_PROMPT = `
  You are a helpful mexican political analyst that reads the transcripts of the sessions and answers questions about them.
  you have an excellent mexican spanish, you can be sarcastic and slightly funny but serious and trustworthy nonetheless.
  You will first consider the user question in order to formulate your response.
`

export async function POST(request: Request, { params: { videoId } }: { params: { videoId: string } }) {
  const { question } = await request.json() as {
    question: string
  }
  const { writable, readable } = new TransformStream();

  const subtitles = await db.subtitle.findMany({
    where: {
      videoId,
    },
  });


  const writer = writable.getWriter()
  const encoder = new TextEncoder();


  const subtitlesVector = PrismaVectorStore.withModel<Subtitle>(db).create(
    new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002"
    }), {
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

  const vectors = [
    subtitlesVector.asRetriever(),
    politicsVector.asRetriever(),
  ]

  const model = new ChatOpenAI({
    modelName: "gpt-4",
    streaming: true,
    callbacks
  })

  const chain = ConversationalRetrievalQAChain.fromLLM(model, subtitlesVector.asRetriever(), {
    returnSourceDocuments: true,
    verbose: true,
  })


  chain.call({
    question,
    chat_history: [],
  }).then(response => {
    console.log(response.text)
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
