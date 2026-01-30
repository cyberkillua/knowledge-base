import { initializeCollection, addDocument } from "../qdrant";
import { getEmbedding } from "../embeddings";
import { extractMarkdown } from "../extractors/markdown";
import { extractPdf } from "../extractors/pdf";
import { extractUrl } from "../extractors/url";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export async function indexFiles() {
  console.log("Initializing Qdrant...");
  await initializeCollection();

  let count = 0;

  // Index markdown files
  const markdownDir = "data/notes";
  const markdownFiles = await fs.readdir(markdownDir);

  for (const file of markdownFiles) {
    if (file.endsWith(".md")) {
      console.log(`Indexing ${file}...`);
      const filepath = path.join(markdownDir, file);

      const { text, metadata } = await extractMarkdown(filepath);
      const embedding = await getEmbedding(text);

      await addDocument(
        {
          id: randomUUID(),
          text,
          metadata,
        },
        embedding,
      );
      count++;
    }
  }

  // Index PDFs
  const pdfDir = "data/pdfs";
  const pdfFiles = await fs.readdir(pdfDir);

  for (const file of pdfFiles) {
    if (file.endsWith(".pdf")) {
      console.log(`Indexing ${file}...`);
      const filepath = path.join(pdfDir, file);

      const { text, metadata } = await extractPdf(filepath);
      const embedding = await getEmbedding(text);

      await addDocument(
        {
          id: randomUUID(),
          text,
          metadata,
        },
        embedding,
      );
      count++;
    }
  }

  console.log(`\n✅ Indexed ${count} documents`);
}

export async function indexUrl(url: string) {
  console.log(`Fetching ${url}...`);

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

  console.log(`✅ Indexed ${url}`);
}
