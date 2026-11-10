import { LlmProvider, LlmGenerateParams } from './LlmProvider';

export class GeminiLlmProvider implements LlmProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  async generate({ system, context, question }: LlmGenerateParams): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        'GeminiLlmProvider yêu cầu GEMINI_API_KEY được thiết lập trong biến môi trường.',
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const promptText = `TÀI LIỆU THAM KHẢO:\n${context}\n\nCÂU HỎI CỦA KHÁCH HÀNG:\n${question}`;

    const body = {
      system_instruction: {
        parts: [{ text: system }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Lỗi gọi Gemini LLM API (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text: string }>;
        };
      }>;
    };

    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answer) {
      throw new Error('Gemini LLM API không trả về nội dung trả lời.');
    }

    return answer;
  }
}
