import { createEnv } from "@t3-oss/env-core"
import { config } from "dotenv"
import { z } from "zod"

config()

export const env = createEnv({
  /*
   * Specify what prefix the client-side variables must have.
   * This is enforced both on type-level and at runtime.
   */
  clientPrefix: "PUBLIC_",
  server: {
    OPENAI_API_KEY: z.string().min(1),
    KV_URL: z.string().url().min(1),
    KV_REST_API_URL: z.string().url().min(1),
    KV_REST_API_TOKEN: z.string().min(1),
    KV_REST_API_READ_ONLY_TOKEN: z.string().min(1),
    POSTGRES_URL: z.string().url().min(1),
    POSTGRES_PRISMA_URL: z.string().url().min(1),
    POSTGRES_URL_NON_POOLING: z.string().url().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_HOST: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),
    POSTGRES_DATABASE: z.string().min(1),
  },
  client: {
    // PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  },
  /**
   * What object holds the environment variables at runtime.
   * Often `process.env` or `import.meta.env`
   */
  runtimeEnv: process.env,
})
