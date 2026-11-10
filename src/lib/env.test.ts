import { describe, it, expect } from 'vitest';
import { env } from './env';

describe('src/lib/env', () => {
  it('đọc đúng các biến môi trường mặc định', () => {
    expect(env.DATABASE_URL).toBeDefined();
    expect(env.AUTH_SECRET).toBeDefined();
    expect(env.LLM_PROVIDER).toBe('mock');
    expect(env.EMBEDDING_PROVIDER).toBe('hash');
    expect(env.RAG_TOP_K).toBe(5);
  });
});
