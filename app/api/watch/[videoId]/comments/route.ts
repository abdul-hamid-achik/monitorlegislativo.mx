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

  const documents = await prisma.subtitle.findMany({
    where: {
      videoId,
    },
  });

  const model = new ChatOpenAI({
    streaming: true,
    temperature: 0.9,
    callbackManager: CallbackManager.fromHandlers({
      async handleLLMNewToken(t) {
        console.log(t)
        token = t
      },
      async handleLLMEnd(done) {
        console.log(done)
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


  const response = await chain.call({
    messages: [
      new SystemChatMessage("You are a political pundit of the mexican republic and you are analyzing legislative sessions in spanish."),
      new HumanChatMessage(query || "Hola, ¿cómo estás?"),
    ],
    query,
  });

  console.log(response, "response")
  return new Response(response.output, {
    headers: {
      'Content-Type': 'application/json',
      "Cache-Control": "no-cache, no-transform",
      Connetion: "keep-alive",
    },
  })
}
