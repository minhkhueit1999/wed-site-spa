import { describe, it, expect } from 'vitest';
import { generateRecommendation } from './generateRecommendation';

describe('Use-case: generateRecommendation', () => {
  it('tạo gợi ý chi tiết từ database seed cho triệu chứng mất ngủ', async () => {
    const res = await generateRecommendation({
      scores: [{ concernSlug: 'mat-ngu', severity: 3 }],
      safetyFlags: [],
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.length).toBeGreaterThanOrEqual(1);
      const top = res.value[0]!;
      expect(top.service.slug).toBe('thu-gian-sau');
      expect(top.service.name).toContain('thư giãn sâu');
      expect(top.products.length).toBeGreaterThan(0);
      expect(top.reasons.length).toBeGreaterThan(0);
    }
  });

  it('loại trừ dịch vụ bị chống chỉ định khi có cờ mang thai', async () => {
    const res = await generateRecommendation({
      scores: [{ concernSlug: 'mat-ngu', severity: 3 }],
      safetyFlags: ['pregnant'],
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      const hasBlocked = res.value.some((r) => r.service.slug === 'thu-gian-sau');
      expect(hasBlocked).toBe(false);
    }
  });
});
