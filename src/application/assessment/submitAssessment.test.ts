import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { submitAssessment } from './submitAssessment';

describe('Use-case: submitAssessment', () => {
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `assessment-user-${Date.now()}@test.com`,
        name: 'Khách Đánh Giá',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            safetyFlags: '[]',
          },
        },
      },
      include: { profile: true },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } });
    }
  });

  it('từ chối khi chưa có sự đồng ý của người dùng', async () => {
    const res = await submitAssessment({
      branchId: 'stress-sleep',
      answers: { 'sleep-1': 'sl1-2' },
      consentGiven: false,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('đồng ý');
    }
  });

  it('xử lý thành công cho khách vãng lai (chưa đăng nhập)', async () => {
    const res = await submitAssessment({
      branchId: 'stress-sleep',
      answers: {
        'sleep-1': 'sl1-3',
        'sleep-2': 'sl2-2',
        'sleep-safety': 'ss-none',
      },
      consentGiven: true,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.concernScores.length).toBeGreaterThan(0);
      expect(res.value.safetyFlags.length).toBe(0);
      expect(res.value.assessmentId).toBeUndefined();
    }
  });

  it('lưu Assessment vào database và cập nhật safetyFlags khi khách đã đăng nhập', async () => {
    const res = await submitAssessment({
      userId: testUserId,
      branchId: 'skin',
      answers: {
        'skin-1': 's1-2',
        'skin-2': 's2-1',
        'skin-safety': 'sf-pregnant',
      },
      consentGiven: true,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.assessmentId).toBeDefined();
      expect(res.value.safetyFlags).toContain('pregnant');

      // Kiểm tra DB profile đã được cập nhật
      const profile = await prisma.customerProfile.findUnique({
        where: { userId: testUserId },
      });
      expect(profile?.safetyFlags).toContain('pregnant');
    }
  });
});
