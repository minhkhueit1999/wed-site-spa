import { VectorStore } from '../store/VectorStore';
import { EmbeddingProvider } from '../embedding/EmbeddingProvider';
import { prisma } from '@/infrastructure/db/prisma';
import { SearchResult } from '../types';

export interface RetrieverOptions {
  topK?: number;
  type?: string;
  vectorWeight?: number; // mặc định 0.7
  keywordWeight?: number; // mặc định 0.3
}

export class HybridRetriever {
  constructor(
    private vectorStore: VectorStore,
    private embeddingProvider: EmbeddingProvider,
  ) {}

  // Tính điểm khớp từ khóa (BM25 simplified)
  private computeKeywordScore(query: string, text: string): number {
    const queryTokens = query
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);

    if (queryTokens.length === 0) return 0;

    const lowerText = text.toLowerCase();
    let matches = 0;

    for (const token of queryTokens) {
      if (lowerText.includes(token)) {
        matches++;
      }
    }

    return matches / queryTokens.length;
  }

  async retrieve(query: string, options: RetrieverOptions = {}): Promise<SearchResult[]> {
    const topK = options.topK ?? 5;

    // 1. Vector Search
    const embeddings = await this.embeddingProvider.embed([query]);
    const queryVec = embeddings[0] ?? [];
    const vectorResults = await this.vectorStore.search(queryVec, {
      topK: Math.max(topK * 2, 10),
      type: options.type,
    });

    // 2. Keyword Search trên toàn bộ chunks trong DB (hoặc tập lọc theo type)
    const allChunks = await prisma.knowledgeChunk.findMany({
      where: options.type ? { type: options.type } : undefined,
    });

    const keywordRanked = allChunks
      .map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        type: c.type,
        headingPath: c.headingPath,
        text: c.text,
        reviewedBy: c.reviewedBy,
        updatedAt: c.updatedAt,
        score: this.computeKeywordScore(query, `${c.title} ${c.headingPath} ${c.text}`),
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);

    // 3. Reciprocal Rank Fusion (RRF k = 60)
    const RRF_K = 60;
    const scoresMap = new Map<
      string,
      {
        item: SearchResult;
        rrfScore: number;
        vectorScore: number;
        keywordScore: number;
      }
    >();

    // Rank điểm vector
    vectorResults.forEach((res, rank) => {
      const existing = scoresMap.get(res.headingPath) || {
        item: res,
        rrfScore: 0,
        vectorScore: res.score,
        keywordScore: 0,
      };
      existing.rrfScore += 1 / (RRF_K + rank + 1);
      existing.vectorScore = res.score;
      scoresMap.set(res.headingPath, existing);
    });

    // Rank điểm từ khóa
    keywordRanked.forEach((res, rank) => {
      const existing = scoresMap.get(res.headingPath) || {
        item: { ...res, score: res.score },
        rrfScore: 0,
        vectorScore: 0,
        keywordScore: res.score,
      };
      existing.rrfScore += 1 / (RRF_K + rank + 1);
      existing.keywordScore = res.score;
      scoresMap.set(res.headingPath, existing);
    });

    // Sắp xếp theo điểm RRF và gán lại normalized score
    const combined = Array.from(scoresMap.values()).map(
      ({ item, rrfScore, vectorScore, keywordScore }) => {
        // Kết hợp điểm để phục vụ threshold RAG_MIN_SCORE
        const hybridScore = Math.max(vectorScore * 0.7 + keywordScore * 0.3, rrfScore * 30);
        return {
          ...item,
          score: Number(hybridScore.toFixed(4)),
        };
      },
    );

    combined.sort((a, b) => b.score - a.score);
    return combined.slice(0, topK);
  }
}
