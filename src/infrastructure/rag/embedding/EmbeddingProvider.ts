export interface EmbeddingProvider {
  dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}
