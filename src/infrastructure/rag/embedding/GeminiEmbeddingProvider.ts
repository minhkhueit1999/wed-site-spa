import { EmbeddingProvider } from './EmbeddingProvider';

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  public readonly dimensions = 768;
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model || process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error(
        'GeminiEmbeddingProvider yêu cầu GEMINI_API_KEY được thiết lập trong biến môi trường.',
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:batchEmbedContents?key=${this.apiKey}`;

    const requests = texts.map((text) => ({
      model: `models/${this.model}`,
      content: { parts: [{ text }] },
    }));

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Lỗi gọi Gemini Embedding API (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      embeddings?: Array<{ values: number[] }>;
    };

    if (!data.embeddings || data.embeddings.length !== texts.length) {
      throw new Error('Định dạng phản hồi từ Gemini Embedding API không hợp lệ.');
    }

    return data.embeddings.map((e) => e.values);
  }
}
