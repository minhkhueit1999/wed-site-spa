import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().default('file:./dev.db'),
  AUTH_SECRET: z.string().min(16).default('spa-wellness-secret-key-development-32charsmin!'),
  APP_URL: z.string().url().default('http://localhost:3000'),
  LLM_PROVIDER: z.enum(['gemini', 'mock']).default('mock'),
  EMBEDDING_PROVIDER: z.enum(['gemini', 'hash']).default('hash'),
  GEMINI_API_KEY: z.string().optional().default(''),
  LLM_MODEL: z.string().optional().default('gemini-1.5-flash'),
  EMBEDDING_MODEL: z.string().optional().default('text-embedding-004'),
  RAG_TOP_K: z.coerce.number().int().positive().default(5),
  RAG_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.35),
  RAG_MAX_QUESTION_CHARS: z.coerce.number().int().positive().default(500),
  ASSISTANT_RATE_LIMIT_PER_MIN: z.coerce.number().int().positive().default(10),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Lỗi cấu hình biến môi trường:', result.error.format());
    throw new Error('Biến môi trường không hợp lệ.');
  }
  return result.data;
}

export const env = parseEnv();
