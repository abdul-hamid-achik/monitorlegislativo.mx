
import { prisma } from "@/lib/prisma";
import { Prisma, TranscriptionSegment } from "@prisma/client";
import { VectorDBQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PrismaVectorStore } from "langchain/vectorstores/prisma";


async function summarize(videoId: string): Promise<string> {
  try {
    const documents = await prisma.transcriptionSegment.findMany({
      where: {
        transcriptionId: videoId,
      },
    });

    console.log(documents.length, "documents")
    const indexName = videoId.toLowerCase() as string


    const vector = await PrismaVectorStore.withModel<TranscriptionSegment>(prisma).create(new OpenAIEmbeddings(), {
      prisma: Prisma,
      tableName: "TranscriptionSegment",
      vectorColumnName: "vector",
      columns: {
        id: PrismaVectorStore.IdColumn,
        content: PrismaVectorStore.ContentColumn,
      },
    });

    await vector.addModels(documents);


    const model = new OpenAI({
      modelName: "gpt-4",
    });

    const chain = VectorDBQAChain.fromLLM(model, vector, {
      k: 1,
      returnSourceDocuments: true,
    });


    const response = await chain.call({
      query: 'what happened during this legislative session? reply in spanish using maximum 3000 words',
    });

    chain.call({

    })

    console.log(response, "response")
    return response.text
  } catch (error: any) {
    console.error(`Error: ${error?.response?.data?.error?.message || error?.message || error}`)
    throw error
  }
}



export default summarize
