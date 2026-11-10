import { EmbeddingProvider } from './EmbeddingProvider';
import { HashEmbeddingProvider } from './HashEmbeddingProvider';
import { GeminiEmbeddingProvider } from './GeminiEmbeddingProvider';

export * from './EmbeddingProvider';
export * from './HashEmbeddingProvider';
export * from './GeminiEmbeddingProvider';

export function createEmbeddingProvider(): EmbeddingProvider {
  const provider = process.env.EMBEDDING_PROVIDER?.toLowerCase() || 'hash';
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    return new GeminiEmbeddingProvider();
  }
  return new HashEmbeddingProvider();
}
