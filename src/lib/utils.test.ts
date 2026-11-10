import { describe, it, expect } from 'vitest';
import { cn, formatCurrencyVND, formatDateVN, formatDateOnlyVN } from './utils';

describe('src/lib/utils', () => {
  it('cn gộp các class css chính xác', () => {
    expect(cn('px-4', 'py-2', false && 'hidden', 'text-sm')).toBe('px-4 py-2 text-sm');
    expect(cn('px-2', 'px-4')).toBe('px-4'); // twMerge ghi đè đúng
  });

  it('formatCurrencyVND định dạng tiền tệ VND chuẩn xác', () => {
    const formatted = formatCurrencyVND(500000);
    expect(formatted).toContain('500.000');
    expect(formatted).toContain('₫');
  });

  it('formatDateOnlyVN định dạng ngày theo chuẩn Việt Nam', () => {
    const date = new Date('2026-11-10T12:00:00Z');
    const result = formatDateOnlyVN(date);
    expect(result).toBe('10/11/2026');
  });

  it('formatDateVN định dạng ngày và giờ theo chuẩn Việt Nam', () => {
    const date = new Date('2026-11-10T05:30:00Z'); // 12:30 giờ VN
    const result = formatDateVN(date);
    expect(result).toContain('10/11/2026');
    expect(result).toContain('12:30');
  });
});
