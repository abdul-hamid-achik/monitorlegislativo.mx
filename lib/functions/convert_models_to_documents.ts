import { Politician, Subtitle } from "@prisma/client"
import { Document } from "langchain/document"

export default function convertModelsToDocuments(models: Array<Subtitle | Politician>): Document<Subtitle | Politician>[] {
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

  return documents as Document<Subtitle | Politician>[]
}
