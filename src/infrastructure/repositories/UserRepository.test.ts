import { describe, it, expect, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { userRepository } from './UserRepository';

describe('UserRepository', () => {
  const testEmail = `user-repo-${Date.now()}@test.com`;
  let createdUserId: string;

  afterAll(async () => {
    if (createdUserId) {
      await prisma.user.delete({ where: { id: createdUserId } });
    }
  });

  it('tạo người dùng mới với mật khẩu được băm an toàn và profile tự động', async () => {
    const user = await userRepository.createUser({
      name: 'Nguyễn Khảo Sát',
      email: testEmail,
      password: 'PlainPassword123!',
      role: 'CUSTOMER',
      consent: true,
    });

    createdUserId = user.id;
    expect(user.id).toBeDefined();
    expect(user.email).toBe(testEmail);
    expect(user.passwordHash).not.toBe('PlainPassword123!');
    expect(user.profile).not.toBeNull();
    expect(user.profile?.consentAt).not.toBeNull();
  });

  it('tìm thấy người dùng qua email và id', async () => {
    const byEmail = await userRepository.findByEmail(testEmail);
    expect(byEmail).not.toBeNull();
    expect(byEmail?.id).toBe(createdUserId);

    const byId = await userRepository.findById(createdUserId);
    expect(byId).not.toBeNull();
    expect(byId?.email).toBe(testEmail);
  });

  it('xác thực mật khẩu đúng và sai chính xác', async () => {
    const byEmail = await userRepository.findByEmail(testEmail);
    const valid = await userRepository.verifyPassword('PlainPassword123!', byEmail!.passwordHash);
    expect(valid).toBe(true);

    const invalid = await userRepository.verifyPassword('WrongPass!', byEmail!.passwordHash);
    expect(invalid).toBe(false);
  });
});
