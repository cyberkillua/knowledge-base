export async function getEmbedding(
  text: string,
  model = "nomic-embed-text",
): Promise<number[]> {
  try {
    const response = await fetch("http://localhost:11434/api/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: text,
      }),
    });
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    return [];
  }
}
