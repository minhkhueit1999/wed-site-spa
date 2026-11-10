import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SqliteVectorStore } from '@/infrastructure/rag/store/SqliteVectorStore';
import { createEmbeddingProvider } from '@/infrastructure/rag/embedding';
import { HybridRetriever } from '@/infrastructure/rag/retrieval/Retriever';
import { createLlmProvider } from '@/infrastructure/rag/llm';
import { RAGPipeline } from '@/infrastructure/rag/pipeline/answer';
import { checkRateLimit } from '@/lib/rate-limit';

const AssistantInputSchema = z.object({
  question: z
    .string()
    .min(2, 'Câu hỏi quá ngắn, vui lòng nhập ít nhất 2 ký tự.')
    .max(500, 'Câu hỏi không được vượt quá 500 ký tự.'),
  context: z
    .object({
      serviceSlug: z.string().optional(),
      productSlugs: z.array(z.string()).optional(),
      safetyFlags: z.array(z.string()).optional(),
      currentStatus: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Kiểm tra Rate Limit
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`assistant:${ip}`, 15, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau một phút.',
        },
        { status: 429 },
      );
    }

    // 2. Parse & Validate JSON đầu vào
    const body: unknown = await req.json();
    const parseRes = AssistantInputSchema.safeParse(body);
    if (!parseRes.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parseRes.error.errors.map((e) => e.message).join(', '),
        },
        { status: 400 },
      );
    }

    const { question, context } = parseRes.data;

    // 3. Khởi tạo Pipeline RAG
    const vectorStore = new SqliteVectorStore();
    const embeddingProvider = createEmbeddingProvider();
    const retriever = new HybridRetriever(vectorStore, embeddingProvider);
    const llmProvider = createLlmProvider();
    const pipeline = new RAGPipeline(retriever, llmProvider);

    // 4. Sinh câu trả lời có trích nguồn
    const result = await pipeline.answer({
      question,
      context,
    });

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return NextResponse.json(
      {
        ok: false,
        error: `Không thể hoàn tất câu trả lời: ${msg}`,
      },
      { status: 500 },
    );
  }
}
