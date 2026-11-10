type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter
 * @param key Khóa định danh (ví dụ IP, email, hoặc route)
 * @param limit Số lượng request tối đa trong cửa sổ thời gian
 * @param windowMs Thời gian cửa sổ (miligiây)
 * @returns { success: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  key: string,
  limit: number = 5,
  windowMs: number = 60 * 1000,
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    store.set(key, newRecord);
    return { success: true, remaining: limit - 1, resetAt: newRecord.resetAt };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Xóa bộ nhớ rate limit (dùng cho test)
 */
export function resetRateLimitStore(): void {
  store.clear();
}
