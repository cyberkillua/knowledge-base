import { extractText } from "unpdf";

export async function extractPdf(filepath: string) {
  const buffer = await Bun.file(filepath).arrayBuffer();
  const { text } = await extractText(new Uint8Array(buffer));

  return {
    text: text.join("\n"),
    metadata: {
      source: "pdf" as const,
      filename: filepath.split("/").pop(),
      date: new Date().toISOString(),
    },
  };
}
