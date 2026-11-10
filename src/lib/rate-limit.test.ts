import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimitStore } from './rate-limit';

describe('src/lib/rate-limit', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('cho phép request khi chưa vượt quá giới hạn', () => {
    const res1 = checkRateLimit('user-1', 2, 1000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    const res2 = checkRateLimit('user-1', 2, 1000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);
  });

  it('chặn request khi đã chạm ngưỡng giới hạn', () => {
    checkRateLimit('user-blocked', 1, 1000);
    const res = checkRateLimit('user-blocked', 1, 1000);
    expect(res.success).toBe(false);
    expect(res.remaining).toBe(0);
  });
});
