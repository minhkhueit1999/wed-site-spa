import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireUser, requireRole } from './guards';
import * as authModule from './auth';

vi.mock('./auth', () => ({
  auth: vi.fn(),
}));

describe('Auth Guards (requireUser & requireRole)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ném lỗi UNAUTHORIZED khi chưa đăng nhập', async () => {
    vi.mocked(authModule.auth).mockResolvedValue(null as never);

    await expect(requireUser()).rejects.toThrow('UNAUTHORIZED');
  });

  it('trả về thông tin người dùng hợp lệ khi đã đăng nhập', async () => {
    vi.mocked(authModule.auth).mockResolvedValue({
      user: { id: 'user-1', email: 'khach@spawellness.vn', name: 'Minh An', role: 'CUSTOMER' },
    } as never);

    const user = await requireUser();
    expect(user.id).toBe('user-1');
    expect(user.email).toBe('khach@spawellness.vn');
    expect(user.role).toBe('CUSTOMER');
  });

  it('cho phép khi người dùng có vai trò phù hợp', async () => {
    vi.mocked(authModule.auth).mockResolvedValue({
      user: { id: 'ktv-1', email: 'ktv@spawellness.vn', name: 'Hoàng Yến', role: 'THERAPIST' },
    } as never);

    const user = await requireRole(['THERAPIST', 'ADMIN']);
    expect(user.role).toBe('THERAPIST');
  });

  it('ném lỗi FORBIDDEN khi người dùng không đủ quyền hạn', async () => {
    vi.mocked(authModule.auth).mockResolvedValue({
      user: { id: 'khach-1', email: 'khach@spawellness.vn', name: 'Minh An', role: 'CUSTOMER' },
    } as never);

    await expect(requireRole('ADMIN')).rejects.toThrow('FORBIDDEN');
  });
});
