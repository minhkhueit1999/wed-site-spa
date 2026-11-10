import { describe, it, expect } from 'vitest';
import { parseFrontmatter } from './loader';

describe('RAG Ingest: loader', () => {
  it('phân tích thành công frontmatter YAML hợp lệ', () => {
    const raw = `---
title: "Liệu Trình Thư Giãn Sâu"
type: service
slug: thu-gian-sau
reviewedBy: "CHƯA DUYỆT"
updatedAt: "2026-11-10"
---
# Nội dung liệu trình
Chi tiết về liệu trình thư giãn...`;

    const doc = parseFrontmatter(raw, 'test.md');
    expect(doc.title).toBe('Liệu Trình Thư Giãn Sâu');
    expect(doc.slug).toBe('thu-gian-sau');
    expect(doc.type).toBe('service');
    expect(doc.reviewedBy).toBe('CHƯA DUYỆT');
    expect(doc.content).toContain('Chi tiết về liệu trình thư giãn');
  });

  it('báo lỗi rõ ràng khi thiếu khối frontmatter YAML', () => {
    const raw = `# Chỉ có tiêu đề mà không có frontmatter`;
    expect(() => parseFrontmatter(raw, 'invalid.md')).toThrow('thiếu phần frontmatter YAML');
  });

  it('báo lỗi khi thiếu một trong các trường bắt buộc', () => {
    const raw = `---
title: "Thiếu trường slug"
type: service
reviewedBy: "CHƯA DUYỆT"
updatedAt: "2026-11-10"
---
Nội dung...`;

    expect(() => parseFrontmatter(raw, 'missing-slug.md')).toThrow('thiếu trường bắt buộc "slug"');
  });
});
