import { prisma } from "@/lib/prisma";
import { Politician, Prisma, Subtitle } from "@prisma/client";
import { CallbackManager } from "langchain/callbacks";
import { loadSummarizationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";


function createDocumentFromModel(models: Array<Subtitle | Politician>): Document[] {
  const documents: Document[] = []
  for (const model of models) {
    let metadata: Record<string, any> = model
    let pageContent = ""
    if ("name" in model) {
      pageContent = model.name
      metadata = {
        type: "politician",
        ...model
      }
    } else {
      pageContent = model.content
      metadata = {
        type: "subtitle",
        ...model
      }
    }

    documents.push({
      pageContent,
      metadata,
    })
  }

  return documents
}

export async function POST(request: Request, { params: { videoId } }: { params: { videoId: string } }) {
  let token: any

  const { query } = await request.json() as {
    query: string
  }
  const { writable, readable } = new TransformStream();

  const subtitles = await prisma.subtitle.findMany({
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
    // @ts-ignore
    tableName: "subtitles",
    vectorColumnName: "vector",
    columns: {
      id: PrismaVectorStore.IdColumn,
      content: PrismaVectorStore.ContentColumn,
    },
  });

  await vector.addModels(subtitles);


  const chain = loadSummarizationChain(model, {
    type: "map_reduce",
    returnIntermediateSteps: true,
  })


  console.log(`${subtitles.length} using ${vector.constructor.name} with ${model.constructor.name}`)


  const politicianNamesVector = await PrismaVectorStore.withModel<Politician>(prisma).create(new OpenAIEmbeddings(), {
    prisma: Prisma,
    // @ts-ignore
    tableName: "politicians",
    vectorColumnName: "vector",
    columns: {
      id: PrismaVectorStore.IdColumn,
      name: PrismaVectorStore.ContentColumn,
    },
  });

  const politicians = await prisma.politician.findMany();

  await politicianNamesVector.addModels(politicians);

  const response = await chain.call({
    input_documents: [
      ...createDocumentFromModel(politicians),
      ...createDocumentFromModel(subtitles),
    ],
  });


  console.log(response, "response")

  return new Response(readable, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-transform",
      Connetion: "keep-alive",
    },
  })
}
