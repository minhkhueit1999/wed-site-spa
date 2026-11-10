import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next-auth', () => ({
  default: vi.fn(),
  AuthError: class AuthError extends Error {},
}));

vi.mock('@/infrastructure/auth/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

import { loginAction, registerAction } from './actions';
import { userRepository } from '@/infrastructure/repositories/UserRepository';

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginAction', () => {
    it('báo lỗi khi dữ liệu form không hợp lệ', async () => {
      const formData = new FormData();
      formData.append('email', 'invalid-email');
      formData.append('password', '123');

      const res = await loginAction({ success: false }, formData);
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.email).toBeDefined();
      expect(res.fieldErrors?.password).toBeDefined();
    });
  });

  describe('registerAction', () => {
    it('báo lỗi khi chưa tick đồng ý xử lý dữ liệu', async () => {
      const formData = new FormData();
      formData.append('name', 'Lê Khách');
      formData.append('email', 'lekhach@test.com');
      formData.append('password', 'ValidPassword123');

      const res = await registerAction({ success: false }, formData);
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.consent).toBeDefined();
    });

    it('báo lỗi khi email đã tồn tại', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce({
        id: 'existing-id',
        email: 'existed@test.com',
      } as never);

      const formData = new FormData();
      formData.append('name', 'Lê Khách');
      formData.append('email', 'existed@test.com');
      formData.append('password', 'ValidPassword123');
      formData.append('consent', 'true');

      const res = await registerAction({ success: false }, formData);
      expect(res.success).toBe(false);
      expect(res.fieldErrors?.email).toContain('đã được sử dụng');
    });

    it('tạo người dùng thành công khi dữ liệu hợp lệ', async () => {
      vi.spyOn(userRepository, 'findByEmail').mockResolvedValueOnce(null);
      vi.spyOn(userRepository, 'createUser').mockResolvedValueOnce({
        id: 'new-user-id',
        email: 'newuser@test.com',
        name: 'Người Mới',
      } as never);

      const formData = new FormData();
      formData.append('name', 'Người Mới');
      formData.append('email', 'newuser@test.com');
      formData.append('password', 'ValidPassword123');
      formData.append('consent', 'true');

      const res = await registerAction({ success: false }, formData);
      expect(res.success).toBe(true);
      expect(res.message).toContain('thành công');
    });
  });
});
