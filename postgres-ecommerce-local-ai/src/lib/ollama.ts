const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';

export async function generateEmbedding(text: string, prefix?: string): Promise<number[]> {
  const prompt = prefix ? `${prefix}${text}` : text;
  const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.embedding || !Array.isArray(data.embedding)) {
    throw new Error('Invalid embedding response: missing or non-array embedding');
  }

  if (data.embedding.length !== 768) {
    throw new Error(
      `Invalid embedding dimension: expected 768, got ${data.embedding.length}`
    );
  }

  return data.embedding;
}
