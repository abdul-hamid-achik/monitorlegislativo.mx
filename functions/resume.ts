import { setupPineconeClient } from '@/lib/ai';
import { VectorDBQAChain } from "langchain/chains";
import { Document } from 'langchain/document';
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import parse from './parse';


const ASK = `
what happened on this session?
Overall assessment of the session's efficiency and effectiveness
Lessons learned from the session that can be applied to future legislative sessions
Recommendations for improving the functioning of the Mexican legislative process
Please ensure that your analysis is based only on the vector sources provided and that it is written in mexican spanish.
`

async function resume(transcription: string, videoUrl: string, happenedAt: string, legislative:
  'senate' | 'congress'): Promise<string> {
  try {
    const videoId = videoUrl.split("v=")[1];
    const documents = parse(transcription).map(({ startAt, endAt, content: text }) => {
      const document = new Document({
        pageContent: text,
        metadata: {
          source: "youtube",
          videoUrl: `${videoUrl}?t=${startAt}`,
          happenedAt,
          legislative,
          startAt,
          endAt,
        },
      });

      return document;
    }) as Document<Record<string, any>>[]; // Remove any undefined entries in case the regex didn't match or the timestamps were invalid

    const pinecone = await setupPineconeClient();

    console.log(documents.length, "documents")
    const indexName = videoId.toLowerCase() as string

    // if (await pinecone.describeIndex({
    //   indexName
    // })) {

    //   await pinecone.deleteIndex({ indexName })
    // }


    // pinecone.createIndex({
    //   createRequest: {
    //     name: videoId.toLowerCase() as string,
    //     dimension: 1536,
    //     metric: 'cosine',
    //     podType: 'p1',
    //   }
    // });

    // await checkStatus(pinecone, indexName)

    const pineconeIndex = pinecone.Index(indexName);
    const vector = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings(), {
      pineconeIndex,
    });

    // const vector = await PineconeStore.fromDocuments(documents, new OpenAIEmbeddings(), {
    //   pineconeIndex,
    // });

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



export default resume
