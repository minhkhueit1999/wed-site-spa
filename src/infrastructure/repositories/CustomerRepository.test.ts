import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { customerRepository } from './CustomerRepository';

describe('CustomerRepository (Integration & Data Isolation)', () => {
  let customerUserAId: string;
  let customerUserBId: string;
  let planAId: string;
  let planBId: string;

  beforeAll(async () => {
    // Tạo 2 khách hàng độc lập
    const userA = await prisma.user.create({
      data: {
        email: `test-user-a-${Date.now()}@example.com`,
        name: 'Khách Hàng A',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            safetyFlags: '[]',
            consentAt: new Date(),
          },
        },
      },
      include: { profile: true },
    });
    customerUserAId = userA.id;

    const userB = await prisma.user.create({
      data: {
        email: `test-user-b-${Date.now()}@example.com`,
        name: 'Khách Hàng B',
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
    customerUserBId = userB.id;

    // Tạo kế hoạch điều trị cho cả 2
    const planA = await prisma.treatmentPlan.create({
      data: {
        customerId: userA.profile!.id,
        serviceSlug: 'thu-gian-sau',
        state: 'IN_TREATMENT',
        totalSessions: 6,
      },
    });
    planAId = planA.id;

    const planB = await prisma.treatmentPlan.create({
      data: {
        customerId: userB.profile!.id,
        serviceSlug: 'giai-toa-vai-gay',
        state: 'IN_TREATMENT',
        totalSessions: 6,
      },
    });
    planBId = planB.id;
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu kiểm thử nếu còn
    await prisma.user.deleteMany({
      where: {
        id: { in: [customerUserAId, customerUserBId] },
      },
    });
  });

  it('Khách hàng A đọc được đúng kế hoạch điều trị của chính mình', async () => {
    const plan = await customerRepository.getTreatmentPlanById(customerUserAId, planAId);
    expect(plan).not.toBeNull();
    expect(plan?.id).toBe(planAId);
    expect(plan?.serviceSlug).toBe('thu-gian-sau');
  });

  it('Khách hàng A KHÔNG THỂ đọc kế hoạch điều trị của Khách hàng B (cô lập dữ liệu)', async () => {
    const leakAttempt = await customerRepository.getTreatmentPlanById(customerUserAId, planBId);
    expect(leakAttempt).toBeNull();
  });

  it('Khách hàng A chỉ lấy được danh sách kế hoạch thuộc về mình', async () => {
    const plansA = await customerRepository.getTreatmentPlans(customerUserAId);
    expect(plansA.length).toBeGreaterThanOrEqual(1);
    expect(plansA.some((p) => p.id === planAId)).toBe(true);
    expect(plansA.some((p) => p.id === planBId)).toBe(false);
  });

  it('lấy thông tin hồ sơ khách hàng qua getProfile', async () => {
    const profile = await customerRepository.getProfile(customerUserAId);
    expect(profile).not.toBeNull();
    expect(profile?.user.name).toBe('Khách Hàng A');
  });

  it('xuất toàn bộ dữ liệu cá nhân theo quyền riêng tư (exportCustomerData)', async () => {
    const exported = await customerRepository.exportCustomerData(customerUserAId);
    expect(exported).not.toBeNull();
    expect(exported?.id).toBe(customerUserAId);
    expect(exported?.profile?.treatmentPlans.length).toBeGreaterThanOrEqual(1);
  });

  it('cho phép khách hàng xóa vĩnh viễn tài khoản và dữ liệu (deleteCustomerAccountAndData)', async () => {
    // Tạo tài khoản tạm để test xóa
    const tempUser = await prisma.user.create({
      data: {
        email: `temp-delete-${Date.now()}@example.com`,
        name: 'Tạm Xóa',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: { safetyFlags: '[]' },
        },
      },
    });

    await customerRepository.deleteCustomerAccountAndData(tempUser.id);
    const checkDeleted = await prisma.user.findUnique({ where: { id: tempUser.id } });
    expect(checkDeleted).toBeNull();
  });
});
