import { KnowledgeChunkData, SearchResult } from '../types';

export interface VectorStoreSearchOptions {
  topK?: number;
  type?: string;
}

export interface VectorStore {
  upsert(chunks: KnowledgeChunkData[]): Promise<void>;
  search(queryVector: number[], options?: VectorStoreSearchOptions): Promise<SearchResult[]>;
  deleteBySlug(slug: string): Promise<void>;
  count(): Promise<number>;
}
