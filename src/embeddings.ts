import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await cohere.embed({
      texts: [text],
      model: "embed-english-v3.0",
      inputType: "search_document",
    });

    const embeddings = response.embeddings as number[][];
    console.log("Cohere response:", embeddings[0]?.length);
    return embeddings[0];
  } catch (error) {
    console.error("Error getting embedding:", error);
    return [];
  }
}
