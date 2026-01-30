import { client, COLLECTION_NAME } from "../qdrant";
import { getEmbedding } from "../embeddings";

interface SearchFilters {
  source?: string;
  tags?: string[];
}

export async function search(query: string, filters?: SearchFilters) {
  const queryEmbedding = await getEmbedding(query);

  let filter = undefined;

  if (filters) {
    const conditions = [];

    if (filters.source) {
      conditions.push({
        key: "source",
        match: { value: filters.source },
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push({
        key: "tags",
        match: { any: filters.tags },
      });
    }

    if (conditions.length > 0) {
      filter = { must: conditions };
    }
  }

  const results = await client.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: 5,
    filter,
  });

  displayResults(query, results, filters);
}

function displayResults(
  query: string,
  results: any[],
  filters?: SearchFilters,
) {
  console.log(`\n🔍 Results for: "${query}"`);
  if (filters) {
    console.log(`   Filters: ${JSON.stringify(filters)}`);
  }
  console.log("");

  for (const result of results) {
    console.log(`📄 ${result.payload.filename || result.payload.url}`);
    console.log(`   Score: ${result.score.toFixed(3)}`);
    console.log(`   Source: ${result.payload.source}`);
    if (result.payload.tags) {
      console.log(`   Tags: ${result.payload.tags.join(", ")}`);
    }
    console.log(`   ${result.payload.text.slice(0, 200)}...`);
    console.log("");
  }
}
