import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { confirmCareBundle } from './confirmCareBundle';

describe('Use-case: confirmCareBundle (Unified Booking)', () => {
  let customerUser: { id: string; email: string };
  let therapistUser: { id: string; email: string };

  beforeAll(async () => {
    // Tạo 1 khách hàng test và 1 kỹ thuật viên test
    customerUser = await prisma.user.create({
      data: {
        email: `test-booking-customer-${Date.now()}@test.com`,
        name: 'Khách Đặt Liệu Trình',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            safetyFlags: '[]',
          },
        },
      },
    });

    therapistUser = await prisma.user.create({
      data: {
        email: `test-booking-therapist-${Date.now()}@test.com`,
        name: 'Kỹ Thuật Viên Test',
        passwordHash: 'hash',
        role: 'THERAPIST',
      },
    });
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test
    if (customerUser) {
      await prisma.user.delete({ where: { id: customerUser.id } }).catch(() => {});
    }
    if (therapistUser) {
      await prisma.user.delete({ where: { id: therapistUser.id } }).catch(() => {});
    }
  });

  it('từ chối khi dịch vụ không tồn tại', async () => {
    const futureDate = new Date(Date.now() + 24 * 3600 * 1000);
    const res = await confirmCareBundle({
      userId: customerUser.id,
      serviceSlug: 'dich-vu-khong-ton-tai',
      startAt: futureDate,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('không tồn tại');
    }
  });

  it('từ chối khi thời gian hẹn ở quá khứ', async () => {
    const pastDate = new Date(Date.now() - 24 * 3600 * 1000);
    const res = await confirmCareBundle({
      userId: customerUser.id,
      serviceSlug: 'thu-gian-sau',
      startAt: pastDate,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('tương lai');
    }
  });

  it('từ chối khi có xung đột trùng lịch của kỹ thuật viên', async () => {
    const slotStart = new Date(Date.now() + 48 * 3600 * 1000);
    const slotEnd = new Date(slotStart.getTime() + 90 * 60 * 1000);

    // Tạo phác đồ và cuộc hẹn giả lập trước
    const profile = await prisma.customerProfile.findUniqueOrThrow({
      where: { userId: customerUser.id },
    });
    const plan = await prisma.treatmentPlan.create({
      data: {
        customerId: profile.id,
        serviceSlug: 'thu-gian-sau',
        state: 'BUNDLE_CONFIRMED',
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        planId: plan.id,
        therapistId: therapistUser.id,
        startAt: slotStart,
        endAt: slotEnd,
        status: 'SCHEDULED',
      },
    });

    // Cố gắng đặt lịch trùng đúng khung giờ đó với cùng kỹ thuật viên
    const res = await confirmCareBundle({
      userId: customerUser.id,
      serviceSlug: 'thu-gian-sau',
      startAt: new Date(slotStart.getTime() + 15 * 60 * 1000), // Lệch 15 phút, nằm trọn trong slot
      therapistId: therapistUser.id,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('trùng lịch');
    }

    // Dọn dẹp appointment test này
    await prisma.appointment.delete({ where: { id: appointment.id } });
    await prisma.treatmentPlan.delete({ where: { id: plan.id } });
  });

  it('từ chối khi dịch vụ bị chống chỉ định nghiêm ngặt', async () => {
    const futureDate = new Date(Date.now() + 72 * 3600 * 1000);

    // 'fever-acute-illness' chặn cả 4 dịch vụ theo seed
    const res = await confirmCareBundle({
      userId: customerUser.id,
      serviceSlug: 'thu-gian-sau',
      startAt: futureDate,
      safetyFlags: ['fever-acute-illness'],
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('chống chỉ định');
    }
  });

  it('xác nhận thành công túi liệu trình chuẩn khi không có cờ cảnh báo', async () => {
    const futureDate = new Date(Date.now() + 96 * 3600 * 1000);

    const res = await confirmCareBundle({
      userId: customerUser.id,
      serviceSlug: 'thu-gian-sau',
      startAt: futureDate,
      therapistId: therapistUser.id,
      safetyFlags: [],
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.status).toBe('CONFIRMED');
      expect(res.value.planState).toBe('BUNDLE_CONFIRMED');
      expect(res.value.requiresReview).toBe(false);
      expect(res.value.homeCareProducts.length).toBeGreaterThan(0);
      expect(res.value.totalVnd).toBeGreaterThan(0);

      // Kiểm tra trong database: TreatmentPlan, Appointment, CareBundle, PlanStateHistory
      const plan = await prisma.treatmentPlan.findUnique({
        where: { id: res.value.planId },
        include: {
          stateHistory: true,
          appointments: true,
          careBundles: true,
          prescriptions: true,
        },
      });

      expect(plan).not.toBeNull();
      expect(plan?.state).toBe('BUNDLE_CONFIRMED');
      expect(plan?.appointments.length).toBe(1);
      expect(plan?.careBundles.length).toBe(1);
      expect(plan?.prescriptions.length).toBeGreaterThan(0);
      expect(plan?.stateHistory[0]?.event).toBe('CONFIRM_BUNDLE');

      // Dọn dẹp sau test
      await prisma.treatmentPlan.delete({ where: { id: res.value.planId } });
    }
  });

  it('đánh dấu PENDING_REVIEW khi có cờ cảnh báo cần chuyên viên duyệt', async () => {
    const futureDate = new Date(Date.now() + 120 * 3600 * 1000);

    // 'allergy-essential-oil' có requiresStaffReview = true trong seed
    const res = await confirmCareBundle({
      userId: customerUser.id,
      serviceSlug: 'cap-am-sang-da',
      startAt: futureDate,
      therapistId: therapistUser.id,
      safetyFlags: ['allergy-essential-oil'],
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.status).toBe('PENDING_REVIEW');
      expect(res.value.planState).toBe('RECOMMENDED');
      expect(res.value.requiresReview).toBe(true);
      expect(res.value.message).toContain('chuyên viên sẽ liên hệ');

      const plan = await prisma.treatmentPlan.findUnique({
        where: { id: res.value.planId },
        include: { careBundles: true, stateHistory: true },
      });

      expect(plan?.state).toBe('RECOMMENDED');
      expect(plan?.careBundles[0]?.status).toBe('PENDING_REVIEW');
      expect(plan?.stateHistory[0]?.event).toBe('SUBMIT_FOR_REVIEW');

      // Dọn dẹp sau test
      await prisma.treatmentPlan.delete({ where: { id: res.value.planId } });
    }
  });

  it('xác nhận thành công cho khách hàng vãng lai (guest)', async () => {
    const futureDate = new Date(Date.now() + 144 * 3600 * 1000);

    const guestEmail = `guest-${Date.now()}@test.com`;
    const res = await confirmCareBundle({
      guestInfo: {
        name: 'Khách Vãng Lai Test',
        email: guestEmail,
        phone: '0901234567',
      },
      serviceSlug: 'phuc-hoi-da-nhay-cam',
      startAt: futureDate,
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.status).toBe('CONFIRMED');

      const guestUser = await prisma.user.findUnique({
        where: { email: guestEmail },
      });
      expect(guestUser).not.toBeNull();
      expect(guestUser?.role).toBe('CUSTOMER');

      // Dọn dẹp guest test
      if (guestUser) {
        await prisma.treatmentPlan.delete({ where: { id: res.value.planId } });
        await prisma.user.delete({ where: { id: guestUser.id } });
      }
    }
  });
});
