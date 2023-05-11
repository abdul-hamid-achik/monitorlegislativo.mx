import { env } from '@/env.mjs';
import { PineconeClient } from "@pinecone-database/pinecone";

import { Configuration, OpenAIApi } from 'openai';

const pinecone = new PineconeClient();

export const setupPineconeClient = async () => {
  await pinecone.init({
    apiKey: env.PINECONE_API_KEY,
    environment: env.PINECONE_ENVIRONMENT,
  });

  return pinecone
}

export const client = new PineconeClient();


export const configuration = new Configuration({ apiKey: env.OPENAI_API_KEY });
export const openai = new OpenAIApi(configuration);
