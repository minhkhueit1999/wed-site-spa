import { describe, it, expect, vi } from 'vitest';
import { logger } from './logger';

describe('src/lib/logger', () => {
  it('ghi log các cấp độ mà không ném lỗi', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    logger.info('Thông báo thử nghiệm', { userRole: 'CUSTOMER' });
    expect(consoleSpy).toHaveBeenCalled();

    logger.warn('Cảnh báo thử nghiệm');
    expect(warnSpy).toHaveBeenCalled();

    logger.error('Lỗi thử nghiệm');
    expect(errorSpy).toHaveBeenCalled();

    logger.debug('Debug thử nghiệm');
    expect(consoleSpy).toHaveBeenCalledTimes(2);

    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });
});
