import { LlmProvider } from './LlmProvider';
import { MockLlmProvider } from './MockLlmProvider';
import { GeminiLlmProvider } from './GeminiLlmProvider';

export * from './LlmProvider';
export * from './MockLlmProvider';
export * from './GeminiLlmProvider';

export function createLlmProvider(): LlmProvider {
  const provider = process.env.LLM_PROVIDER?.toLowerCase() || 'mock';
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    return new GeminiLlmProvider();
  }
  return new MockLlmProvider();
}
