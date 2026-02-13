interface Chunk {
  text: string;
  index: number;
}

// Fixed-size chunking with overlap
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 50,
): Chunk[] {
  const words = text.split(/\s+/);
  const chunks: Chunk[] = [];

  let i = 0;
  let index = 0;

  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push({
      text: chunkWords.join(" "),
      index,
    });
    i += chunkSize - overlap;
    index++;
  }

  return chunks;
}
