import { EmbeddingProvider } from './EmbeddingProvider';

/**
 * HashEmbeddingProvider: Bộ tạo embedding giả lập tất định 64 chiều.
 * Sử dụng kỹ thuật băm n-gram (Feature Hashing / Hashing Trick) và chuẩn hóa vector đơn vị L2.
 * Giúp tính cosine similarity chuẩn xác, nhanh chóng, không phụ thuộc mạng hay API key.
 */
export class HashEmbeddingProvider implements EmbeddingProvider {
  public readonly dimensions: number;

  constructor(dimensions = 64) {
    this.dimensions = dimensions;
  }

  // Thuật toán băm chuỗi FNV-1a 32-bit
  private hashString(str: string, seed = 0x811c9dc5): number {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  private embedOne(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    const normalized = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .trim();
    const words = normalized.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      vector[0] = 1;
      return vector;
    }

    // Unigrams
    for (const word of words) {
      const h1 = this.hashString(word);
      const index = h1 % this.dimensions;
      const sign = (h1 & 0x80000000) === 0 ? 1 : -1;
      vector[index] = (vector[index] ?? 0) + sign * 1.0;
    }

    // Bigrams để nắm bắt cụm từ (ví dụ "mất ngủ", "vai gáy", "cấp ẩm")
    for (let i = 0; i < words.length - 1; i++) {
      const w1 = words[i] ?? '';
      const w2 = words[i + 1] ?? '';
      const bigram = `${w1}_${w2}`;
      const h2 = this.hashString(bigram, 0x9e3779b9);
      const index = h2 % this.dimensions;
      const sign = (h2 & 0x80000000) === 0 ? 1 : -1;
      vector[index] = (vector[index] ?? 0) + sign * 2.0; // trọng số cao hơn cho cụm từ
    }

    // Chuẩn hóa vector đơn vị L2 norm
    let sumSq = 0;
    for (let i = 0; i < this.dimensions; i++) {
      const v = vector[i] ?? 0;
      sumSq += v * v;
    }

    const norm = Math.sqrt(sumSq);
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        const v = vector[i] ?? 0;
        vector[i] = Number((v / norm).toFixed(6));
      }
    }

    return vector;
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.embedOne(t));
  }
}
