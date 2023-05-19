
import { prisma } from "@/lib/prisma";
import { Prisma, Subtitle } from "@prisma/client";
import { loadQAStuffChain } from "langchain/chains";
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";
import convertModelsToDocuments from "./convert_models_to_documents";

async function summarize(videoId: string): Promise<string> {
  const subtitles = await prisma.subtitle.findMany({
    where: {
      videoId,
    },
  })

  console.log(`Found ${subtitles.length} lines in the subtitles for video ${videoId}`)

  const documents = convertModelsToDocuments(subtitles) as Document<Subtitle>[];

  const model = new OpenAI({
    modelName: "gpt-3.5-turbo",
  });

  const vector = await PrismaVectorStore.withModel<Subtitle>(prisma).fromDocuments(documents, new OpenAIEmbeddings({
    modelName: "text-embedding-ada-002"
  }), {
    prisma: Prisma,
    tableName: "subtitles" as "Subtitle",
    vectorColumnName: "vector",
    columns: {
      id: PrismaVectorStore.IdColumn,
      content: PrismaVectorStore.ContentColumn,
    },
  });

  vector.addDocuments(documents);

  const chain = loadQAStuffChain(model)

  const response = await chain.call({
    question: 'what happened during this video which comes from the mexican legislative youtube channels? reply in mexican spanish using maximum 3000 words',
    input_documents: documents,
  });

  return response.text
}



export default summarize
