import { describe, it, expect } from 'vitest';
import { chunkKnowledgeDocument } from './chunker';
import { KnowledgeDocument } from '../types';

describe('RAG Ingest: chunker', () => {
  const sampleDoc: KnowledgeDocument = {
    title: 'Dịch vụ Cấp Ẩm Da',
    type: 'service',
    slug: 'cap-am-da',
    reviewedBy: 'CHƯA DUYỆT',
    updatedAt: '2026-11-10',
    filePath: 'test.md',
    content: `
# Dịch vụ Cấp Ẩm Da

Mô tả mở đầu dịch vụ cấp ẩm.

## Quy trình 5 bước

Bước 1: Làm sạch da.
Bước 2: Tẩy tế bào chết.
Bước 3: Điện di tinh chất HA.

## Chống chỉ định

Không dùng cho da mụn mủ nặng.
`,
  };

  it('cắt đoạn theo các tiêu đề markdown và giữ headingPath làm tiền tố', () => {
    const chunks = chunkKnowledgeDocument(sampleDoc);
    expect(chunks.length).toBeGreaterThanOrEqual(3);

    expect(chunks[0]?.headingPath).toBe('Dịch vụ Cấp Ẩm Da');
    expect(chunks[0]?.text).toContain('[Dịch vụ Cấp Ẩm Da]');

    const procChunk = chunks.find((c) => c.headingPath.includes('Quy trình 5 bước'));
    expect(procChunk).toBeDefined();
    expect(procChunk?.text).toContain('Điện di tinh chất HA');

    const contraChunk = chunks.find((c) => c.headingPath.includes('Chống chỉ định'));
    expect(contraChunk).toBeDefined();
    expect(contraChunk?.text).toContain('mụn mủ nặng');
  });

  it('tự động chia nhỏ khi đoạn văn bản vượt quá maxChars', () => {
    const longText = 'Đây là nội dung rất dài nhằm kiểm tra thuật toán phân đoạn. '.repeat(50);
    const docWithLongSection: KnowledgeDocument = {
      ...sampleDoc,
      content: `## Phần Dài\n${longText}`,
    };

    const chunks = chunkKnowledgeDocument(docWithLongSection, { maxChars: 300, overlapChars: 50 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.headingPath).toContain('Phần Dài');
    }
  });
});
