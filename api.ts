import { Hono } from "hono";
import { getEmbedding } from "./src/embeddings";
import { client, COLLECTION_NAME } from "./src/qdrant";
import { randomUUID } from "crypto";
import { initializeCollection, addDocument } from "./src/qdrant";
import { extractUrl } from "./src/extractors/url";
import { extractMarkdown } from "./src/extractors/markdown";
import { extractPdf } from "./src/extractors/pdf";
import path from "path";
import fs from "fs/promises";

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

// Index URL endpoint
app.post("/index/url", async (c) => {
  const body = await c.req.json();
  const { url } = body;

  if (!url) {
    return c.json({ error: "Missing 'url' in request body" }, 400);
  }

  try {
    const { text, metadata } = await extractUrl(url);
    const embedding = await getEmbedding(text);

    await addDocument(
      {
        id: randomUUID(),
        text,
        metadata,
      },
      embedding,
    );

    return c.json({ success: true, url });
  } catch (error) {
    return c.json({ error: `Failed to index URL: ${error}` }, 500);
  }
});

// Index file (markdown or PDF)
app.post("/index/file", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return c.json({ error: "Missing 'file' in form data" }, 400);
  }

  const filename = file.name;
  const ext = path.extname(filename).toLowerCase();

  if (ext !== ".md" && ext !== ".pdf") {
    return c.json({ error: "Only .md and .pdf files supported" }, 400);
  }

  try {
    // Save temp file
    const tempPath = `/tmp/${filename}`;
    const buffer = await file.arrayBuffer();
    await fs.writeFile(tempPath, Buffer.from(buffer));

    // Extract based on type
    let text: string;
    let metadata: any;

    if (ext === ".md") {
      const result = await extractMarkdown(tempPath);
      text = result.text;
      metadata = result.metadata;
    } else {
      const result = await extractPdf(tempPath);
      text = result.text;
      metadata = result.metadata;
    }

    // Generate embedding and store
    const embedding = await getEmbedding(text);
    await addDocument(
      {
        id: randomUUID(),
        text,
        metadata,
      },
      embedding,
    );

    // Cleanup temp file
    await fs.unlink(tempPath);

    return c.json({
      success: true,
      filename,
      source: ext === ".md" ? "markdown" : "pdf",
    });
  } catch (error) {
    return c.json({ error: `Failed to index file: ${error}` }, 500);
  }
});

// Initialize collection on startup
initializeCollection().then(() => {
  console.log("Qdrant collection ready");
});

export default app;
