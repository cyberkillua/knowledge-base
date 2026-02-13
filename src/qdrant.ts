import { QdrantClient } from "@qdrant/js-client-rest";
import { getEmbedding } from "./embeddings";
import { randomUUID } from "crypto";

const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
const qdrantApiKey = process.env.QDRANT_API_KEY;

const client = new QdrantClient({
  url: qdrantUrl,
  apiKey: qdrantApiKey,
});

const COLLECTION_NAME = "knowledge_base";

export async function initializeCollection() {
  // Get vector size dynamically from a test embedding
  const testEmbedding = await getEmbedding("test");
  const VECTOR_SIZE = testEmbedding.length;

  console.log(`Using vector size: ${VECTOR_SIZE}`);

  // Check if collection exists
  const collections = await client.getCollections();
  const exists = collections.collections.some(
    (col) => col.name === COLLECTION_NAME,
  );

  if (!exists) {
    // Create collection
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });
    console.log(`✅ Created collection: ${COLLECTION_NAME}`);
  } else {
    console.log(`✅ Collection already exists: ${COLLECTION_NAME}`);
  }
}
interface Document {
  id: string;
  text: string;
  metadata: {
    source: string; // "markdown" | "pdf" | "url"
    filename?: string;
    url?: string;
    tags?: string[];
    date?: string;
  };
}

export async function addDocument(doc: Document, embedding: number[]) {
  const point = {
    id: randomUUID(),
    vector: embedding,
    payload: {
      text: doc.text,
      ...doc.metadata,
    },
  };

  console.log("Adding point:", {
    id: point.id,
    vectorLength: point.vector.length,
    payloadKeys: Object.keys(point.payload),
  });

  await client.upsert(COLLECTION_NAME, {
    points: [point],
  });
}

export async function searchDocuments(
  queryEmbedding: number[],
  limit = 5,
  filter?: any,
) {
  const results = await client.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit,
    filter,
  });

  return results;
}

export { client, COLLECTION_NAME };
