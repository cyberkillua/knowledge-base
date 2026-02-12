import { Hono } from "hono";
import { getEmbedding } from "./src/embeddings";
import { client, COLLECTION_NAME } from "./src/qdrant";

const app = new Hono();

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Search endpoint
app.get("/search", async (c) => {
  const query = c.req.query("q");
  const source = c.req.query("source");
  const tags = c.req.query("tags");

  if (!query) {
    return c.json({ error: "Missing query parameter 'q'" }, 400);
  }

  // Build filter
  let filter = undefined;
  const conditions = [];

  if (source) {
    conditions.push({ key: "source", match: { value: source } });
  }

  if (tags) {
    conditions.push({ key: "tags", match: { any: tags.split(",") } });
  }

  if (conditions.length > 0) {
    filter = { must: conditions };
  }

  // Search
  const queryEmbedding = await getEmbedding(query);
  const results = await client.search(COLLECTION_NAME, {
    vector: queryEmbedding,
    limit: 5,
    filter,
  });

  return c.json({ query, results });
});

export default app;
