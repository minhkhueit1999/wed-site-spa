import { prisma } from '@/infrastructure/db/prisma';
import { VectorStore, VectorStoreSearchOptions } from './VectorStore';
import { KnowledgeChunkData, SearchResult } from '../types';

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    dot += ai * bi;
    normA += ai * ai;
    normB += bi * bi;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export class SqliteVectorStore implements VectorStore {
  async upsert(chunks: KnowledgeChunkData[]): Promise<void> {
    for (const chunk of chunks) {
      const embeddingJson = JSON.stringify(chunk.embedding || []);

      const existing = await prisma.knowledgeChunk.findFirst({
        where: {
          slug: chunk.slug,
          headingPath: chunk.headingPath,
        },
      });

      if (existing) {
        await prisma.knowledgeChunk.update({
          where: { id: existing.id },
          data: {
            title: chunk.title,
            type: chunk.type,
            text: chunk.text,
            embedding: embeddingJson,
            reviewedBy: chunk.reviewedBy,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.knowledgeChunk.create({
          data: {
            slug: chunk.slug,
            title: chunk.title,
            type: chunk.type,
            headingPath: chunk.headingPath,
            text: chunk.text,
            embedding: embeddingJson,
            reviewedBy: chunk.reviewedBy,
          },
        });
      }
    }
  }

  async search(
    queryVector: number[],
    options: VectorStoreSearchOptions = {},
  ): Promise<SearchResult[]> {
    const topK = options.topK ?? 5;

    const chunks = await prisma.knowledgeChunk.findMany({
      where: options.type ? { type: options.type } : undefined,
    });

    const scored: SearchResult[] = [];

    for (const chunk of chunks) {
      let vec: number[] = [];
      try {
        vec = JSON.parse(chunk.embedding);
      } catch {
        vec = [];
      }

      const score = cosineSimilarity(queryVector, vec);

      scored.push({
        id: chunk.id,
        slug: chunk.slug,
        title: chunk.title,
        type: chunk.type,
        headingPath: chunk.headingPath,
        text: chunk.text,
        embedding: vec,
        reviewedBy: chunk.reviewedBy,
        updatedAt: chunk.updatedAt,
        score,
      });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async deleteBySlug(slug: string): Promise<void> {
    await prisma.knowledgeChunk.deleteMany({
      where: { slug },
    });
  }

  async count(): Promise<number> {
    return prisma.knowledgeChunk.count();
  }
}
