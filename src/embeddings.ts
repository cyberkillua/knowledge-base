const JINA_API_KEY = process.env.JINA_API_KEY;

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("https://api.jina.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${JINA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "jina-embeddings-v3",
        input: [text],
      }),
    });

    const data = await response.json();
    console.log("Jina response:", data.data?.[0]?.embedding?.length);
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    return [];
  }
}
