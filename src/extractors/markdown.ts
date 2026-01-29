import matter from "gray-matter";
import fs from "fs/promises";

export async function extractMarkdown(filepath: string) {
  const content = await fs.readFile(filepath, "utf-8");

  // Parse frontmatter and content
  const { data, content: text } = matter(content);

  return {
    text,
    metadata: {
      source: "markdown" as const,
      filename: filepath.split("/").pop(),
      tags: data.tags || [],
      date: data.date || new Date().toISOString(),
      title: data.title,
    },
  };
}
