import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { transitionAppointmentStatus } from './sessionStatusTransitions';
import { addInRoomUpsellToAppointment } from './inRoomUpsell';
import { submitLeaveOrSwapRequest } from './shiftRequests';
import { getTechnicianMobileSchedule } from './technicianScheduleExtended';

describe('Technician Mobile Workflow Use-Cases', () => {
  let therapistUser: { id: string; email: string };
  let otherTherapist: { id: string; email: string };
  let customerUser: { id: string; email: string };
  let customerProfileId: string;
  let testAppointmentId: string;

  beforeAll(async () => {
    therapistUser = await prisma.user.create({
      data: {
        email: `therapist-wf-${Date.now()}@spawellness.vn`,
        name: 'KTV Hoàng Lan',
        passwordHash: 'hash',
        role: 'THERAPIST',
      },
    });

    otherTherapist = await prisma.user.create({
      data: {
        email: `therapist-other-${Date.now()}@spawellness.vn`,
        name: 'KTV Mai Anh',
        passwordHash: 'hash',
        role: 'THERAPIST',
      },
    });

    customerUser = await prisma.user.create({
      data: {
        email: `cust-wf-${Date.now()}@spawellness.vn`,
        name: 'Khách Hoàng Yến',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            phone: '0987654321',
            loyaltyTier: 'SILVER',
            safetyFlags: JSON.stringify(['allergy-essential-oil']),
            medicalNotes: 'Tiền sử hạ huyết áp tư thế',
            consentAt: new Date(),
          },
        },
      },
    });

    const p = await prisma.customerProfile.findUniqueOrThrow({
      where: { userId: customerUser.id },
    });
    customerProfileId = p.id;

    const plan = await prisma.treatmentPlan.create({
      data: {
        customerId: customerProfileId,
        serviceSlug: 'thu-gian-sau',
        totalSessions: 6,
        state: 'IN_TREATMENT',
      },
    });

    const now = new Date();
    const apt = await prisma.appointment.create({
      data: {
        planId: plan.id,
        therapistId: therapistUser.id,
        startAt: now,
        endAt: new Date(now.getTime() + 75 * 60 * 1000),
        status: 'SCHEDULED',
        room: 'Phòng VIP 01',
      },
    });
    testAppointmentId = apt.id;
  });

  afterAll(async () => {
    if (testAppointmentId) {
      await prisma.sessionLog.deleteMany({ where: { appointmentId: testAppointmentId } });
      await prisma.invoiceItem.deleteMany({});
      await prisma.invoice.deleteMany({ where: { appointmentId: testAppointmentId } });
      await prisma.appointment.delete({ where: { id: testAppointmentId } }).catch(() => {});
    }
    if (customerProfileId) {
      await prisma.treatmentPlan.deleteMany({ where: { customerId: customerProfileId } });
    }
    if (customerUser) {
      await prisma.user.delete({ where: { id: customerUser.id } }).catch(() => {});
    }
    if (therapistUser) {
      await prisma.leaveRequest.deleteMany({ where: { staffId: therapistUser.id } });
      await prisma.user.delete({ where: { id: therapistUser.id } }).catch(() => {});
    }
    if (otherTherapist) {
      await prisma.user.delete({ where: { id: otherTherapist.id } }).catch(() => {});
    }
  });

  it('thực hiện tuần tự luồng đổi trạng thái 1 chạm ("Nhận khách" -> "Bắt đầu làm")', async () => {
    // Bước 1: Nhận khách (CHECKED_IN)
    const checkInRes = await transitionAppointmentStatus(
      testAppointmentId,
      therapistUser.id,
      'CHECKED_IN',
      'Đã đón khách tại sảnh',
    );
    expect(checkInRes.ok).toBe(true);
    if (checkInRes.ok) {
      expect(checkInRes.value.newStatus).toBe('CHECKED_IN');
    }

    // Bước 2: Bắt đầu làm (IN_PROGRESS)
    const inProgressRes = await transitionAppointmentStatus(
      testAppointmentId,
      therapistUser.id,
      'IN_PROGRESS',
    );
    expect(inProgressRes.ok).toBe(true);
    if (inProgressRes.ok) {
      expect(inProgressRes.value.newStatus).toBe('IN_PROGRESS');
    }
  });

  it('từ chối KTV khác không có thẩm quyền đổi trạng thái lịch hẹn', async () => {
    const unauthorizedRes = await transitionAppointmentStatus(
      testAppointmentId,
      otherTherapist.id,
      'COMPLETED',
    );

    expect(unauthorizedRes.ok).toBe(false);
    if (!unauthorizedRes.ok) {
      expect(unauthorizedRes.error).toContain(
        'Bạn không phải là kỹ thuật viên phụ trách lịch hẹn này',
      );
    }
  });

  it('bán chéo trong buồng (in-room upsell) tự động tính hoa hồng 15% cho KTV', async () => {
    const upsellRes = await addInRoomUpsellToAppointment({
      appointmentId: testAppointmentId,
      therapistId: therapistUser.id,
      productSlug: 'tinh-dau-thu-gian',
      quantity: 1,
    });

    expect(upsellRes.ok).toBe(true);
    if (upsellRes.ok) {
      expect(upsellRes.value.addedItemName).toBe('Tinh dầu thư giãn buổi tối');
      // Tinh dầu 320.000đ -> hoa hồng 15% = 48.000đ
      expect(upsellRes.value.commissionEarnedVnd).toBe(48000);
    }
  });

  it('gửi đơn xin đổi ca trực cùng đồng nghiệp KTV', async () => {
    const requestRes = await submitLeaveOrSwapRequest({
      therapistId: therapistUser.id,
      type: 'SWAP_SHIFT',
      startDate: new Date(),
      endDate: new Date(),
      reason: 'Đổi ca trực sáng sang chiều',
      swapWithStaffId: otherTherapist.id,
    });

    expect(requestRes.ok).toBe(true);
    if (requestRes.ok) {
      expect(requestRes.value.message).toContain('Đơn yêu cầu của bạn đã được gửi');
    }
  });

  it('lấy lịch làm việc di động chứa thông tin cảnh báo an toàn y khoa và đã che mờ (masking) SĐT khách', async () => {
    const schedRes = await getTechnicianMobileSchedule(therapistUser.id);
    expect(schedRes.ok).toBe(true);
    if (schedRes.ok) {
      const matchApt = schedRes.value.appointments.find((a) => a.id === testAppointmentId);
      expect(matchApt).toBeDefined();
      expect(matchApt?.safetyFlags).toContain('allergy-essential-oil');
      expect(matchApt?.medicalNotes).toBe('Tiền sử hạ huyết áp tư thế');
      expect(matchApt?.customerPhone).toBe('098***321');
    }
  });
});
