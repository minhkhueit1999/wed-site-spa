import { describe, it, expect } from 'vitest';
import { HashEmbeddingProvider } from '../embedding/HashEmbeddingProvider';
import { HybridRetriever } from './Retriever';
import { VectorStore } from '../store/VectorStore';
import { SearchResult } from '../types';
import { cosineSimilarity } from '../store/SqliteVectorStore';

class InMemoryMockStore implements VectorStore {
  constructor(private docs: SearchResult[]) {}

  async search(): Promise<SearchResult[]> {
    return this.docs;
  }

  async upsert(): Promise<void> {}
  async deleteBySlug(): Promise<void> {}
  async count(): Promise<number> {
    return this.docs.length;
  }
}

describe('RAG Infrastructure Retrieval & Embedding', () => {
  it('cosineSimilarity tính toán độ tương đồng cosine chính xác và an toàn', () => {
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1, 2], [1])).toBe(0);
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
    expect(cosineSimilarity([1, 1], [1, 1])).toBeCloseTo(1.0);
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0);
  });

  it('HashEmbeddingProvider tạo vector 64 chiều đơn vị L2 có tính tất định', async () => {
    const provider = new HashEmbeddingProvider(64);
    const text = 'massage bấm huyệt thư giãn sâu';
    const vectors = await provider.embed([text]);

    expect(vectors).toHaveLength(1);
    expect(vectors[0]).toHaveLength(64);

    // Tính chuẩn L2 ~ 1.0
    const norm = Math.sqrt(vectors[0]!.reduce((acc, v) => acc + v * v, 0));
    expect(norm).toBeCloseTo(1.0, 3);

    // Tính tất định
    const vectors2 = await provider.embed([text]);
    expect(vectors[0]).toEqual(vectors2[0]);
  });

  it('HashEmbeddingProvider xử lý chuỗi rỗng an toàn', async () => {
    const provider = new HashEmbeddingProvider(64);
    const vectors = await provider.embed(['   ']);
    expect(vectors[0]).toHaveLength(64);
    expect(vectors[0]![0]).toBe(1);
  });

  it('HybridRetriever xếp hạng hợp nhất vector search và từ khóa BM25', async () => {
    const provider = new HashEmbeddingProvider(64);
    const mockStore = new InMemoryMockStore([
      {
        slug: 'thu-gian-sau',
        title: 'Liệu trình thư giãn sâu',
        type: 'service',
        headingPath: 'Quy trình',
        text: 'Massage ấn huyệt đầu cổ giúp thư giãn sâu và ngủ ngon tự nhiên.',
        reviewedBy: 'CHƯA DUYỆT',
        score: 0.9,
      },
      {
        slug: 'tinh-dau-oai-huong',
        title: 'Tinh dầu oải hương',
        type: 'product',
        headingPath: 'Thành phần',
        text: 'Tinh dầu hoa oải hương làm dịu thần kinh, hỗ trợ giấc ngủ sâu.',
        reviewedBy: 'CHƯA DUYỆT',
        score: 0.8,
      },
    ]);

    const retriever = new HybridRetriever(mockStore, provider);
    const results = await retriever.retrieve('thư giãn ngủ ngon', {
      topK: 2,
      vectorWeight: 0.6,
      keywordWeight: 0.4,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.title).toBeDefined();
    expect(results[0]?.score).toBeGreaterThan(0);

    // Truy vấn chuỗi ngắn/kí tự đặc biệt
    const emptyResults = await retriever.retrieve('?!', { topK: 1 });
    expect(emptyResults).toBeDefined();
  });
});
