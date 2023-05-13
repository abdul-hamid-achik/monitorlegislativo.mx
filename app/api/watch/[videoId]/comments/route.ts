import { prisma } from "@/lib/prisma";
import { Prisma, Subtitle } from "@prisma/client";
import { CallbackManager } from "langchain/callbacks";
import { VectorDBQAChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";



export async function POST(request: Request, { params: { videoId } }: { params: { videoId: string } }) {
  let token: any

  const { query } = await request.json() as {
    query: string
  }
  const { writable, readable } = new TransformStream();

  const documents = await prisma.subtitle.findMany({
    where: {
      videoId,
    },
  });

  const model = new ChatOpenAI({
    streaming: true,
    temperature: 0.9,
    callbackManager: CallbackManager.fromHandlers({
      handleLLMNewToken(t) {
        console.log(t)
        token = t // help me make this stremeable
        writable.getWriter().write(JSON.stringify(t));

      },
      handleLLMEnd(done) {
        console.log(done)
        writable.getWriter().write(null);

      }
    })
  })



  const vector = await PrismaVectorStore.withModel<Subtitle>(prisma).create(new OpenAIEmbeddings(), {
    prisma: Prisma,
    tableName: "Subtitle",
    vectorColumnName: "vector",
    columns: {
      id: PrismaVectorStore.IdColumn,
      content: PrismaVectorStore.ContentColumn,
    },
  });

  await vector.addModels(documents);


  const chain = VectorDBQAChain.fromLLM(model, vector, {
    k: 1,
    returnSourceDocuments: true,
  });


  await chain.call({
    messages: [
      new SystemChatMessage("You are a political pundit of the mexican republic and you are analyzing legislative sessions in spanish."),
      new HumanChatMessage(query || "Hola, ¿cómo estás?"),
    ],

    chat_history: []
  });

  return new Response(readable, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connetion: "keep-alive",
    },
  })
}
