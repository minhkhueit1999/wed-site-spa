import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { getCustomerDashboard } from './getCustomerDashboard';
import { exportCustomerData } from './exportCustomerData';
import { deleteCustomerAccount } from './deleteCustomerAccount';

describe('Customer Tracker & Privacy Use-Cases', () => {
  let testCustomer: { id: string; email: string };
  let otherCustomer: { id: string; email: string };
  let therapistUser: { id: string; email: string };
  let testPlanId: string;

  beforeAll(async () => {
    testCustomer = await prisma.user.create({
      data: {
        email: `tracker-cust-${Date.now()}@test.com`,
        name: 'Khách Hàng Tracker',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            safetyFlags: JSON.stringify(['allergy-essential-oil']),
            consentAt: new Date(),
          },
        },
      },
    });

    otherCustomer = await prisma.user.create({
      data: {
        email: `tracker-other-${Date.now()}@test.com`,
        name: 'Khách Hàng Khác',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            safetyFlags: '[]',
            consentAt: new Date(),
          },
        },
      },
    });

    therapistUser = await prisma.user.create({
      data: {
        email: `tracker-therapist-${Date.now()}@test.com`,
        name: 'Kỹ Thuật Viên Tracker',
        passwordHash: 'hash',
        role: 'THERAPIST',
      },
    });

    const profile = await prisma.customerProfile.findUniqueOrThrow({
      where: { userId: testCustomer.id },
    });

    // Tạo phác đồ và nhật ký mẫu cho khách hàng
    const plan = await prisma.treatmentPlan.create({
      data: {
        customerId: profile.id,
        serviceSlug: 'thu-gian-sau',
        totalSessions: 6,
        state: 'IN_TREATMENT',
        stateHistory: {
          create: [
            {
              from: 'RECOMMENDED',
              event: 'CONFIRM_BUNDLE',
              to: 'BUNDLE_CONFIRMED',
              actorId: testCustomer.id,
              reason: 'Xác nhận túi liệu trình',
            },
            {
              from: 'BUNDLE_CONFIRMED',
              event: 'START_TREATMENT',
              to: 'IN_TREATMENT',
              actorId: therapistUser.id,
              reason: 'Bắt đầu buổi 1',
            },
          ],
        },
        appointments: {
          create: [
            {
              therapistId: therapistUser.id,
              startAt: new Date(Date.now() - 86400000),
              endAt: new Date(Date.now() - 86400000 + 75 * 60000),
              status: 'COMPLETED',
              sessionLog: {
                create: {
                  therapistId: therapistUser.id,
                  notes: 'Khách phản ứng tốt với liệu pháp bấm huyệt nhẹ.',
                  progressScores: JSON.stringify({ stress: 3, sleep: 4 }),
                  adjustments: 'Giảm lực vùng gáy',
                  nextSessionAdvice: 'Duy trì uống trà thảo mộc buổi tối',
                },
              },
            },
            {
              therapistId: therapistUser.id,
              startAt: new Date(Date.now() + 86400000),
              endAt: new Date(Date.now() + 86400000 + 75 * 60000),
              status: 'SCHEDULED',
            },
          ],
        },
        prescriptions: {
          create: [
            {
              productSlug: 'tinh-dau-thu-gian',
              instructions: 'Thoa đều 2 giọt vào thái dương trước giờ ngủ.',
              frequency: 'Mỗi tối',
              prescribedBy: therapistUser.id,
            },
          ],
        },
      },
    });

    testPlanId = plan.id;
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu
    await prisma.treatmentPlan
      .deleteMany({
        where: { id: testPlanId },
      })
      .catch(() => {});
    await prisma.user
      .deleteMany({
        where: { id: { in: [testCustomer.id, otherCustomer.id, therapistUser.id] } },
      })
      .catch(() => {});
  });

  it('báo lỗi khi người dùng không tồn tại', async () => {
    const res = await getCustomerDashboard('non-existent-user-id');
    expect(res.ok).toBe(false);
  });

  it('lấy thành công dashboard với đầy đủ dữ liệu tiến triển, toa và timeline', async () => {
    const res = await getCustomerDashboard(testCustomer.id);

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.user.name).toBe('Khách Hàng Tracker');
      expect(res.value.activePlan).not.toBeNull();

      const plan = res.value.activePlan!;
      expect(plan.serviceName.toLowerCase()).toContain('thư giãn sâu');
      expect(plan.completedSessions).toBe(1);
      expect(plan.totalSessions).toBe(6);
      expect(plan.progressPercent).toBe(17); // 1 / 6 = ~17%
      expect(plan.state).toBe('IN_TREATMENT');
      expect(plan.statePresentation.label).toBe('Đang trong liệu trình');

      // Toa chăm sóc tại nhà
      expect(plan.prescriptions.length).toBe(1);
      expect(plan.prescriptions[0]?.productName).toBe('Tinh dầu thư giãn buổi tối');

      // Timeline lịch sử
      expect(plan.stateHistory.length).toBe(2);
      expect(plan.stateHistory[0]?.event).toBe('CONFIRM_BUNDLE');
      expect(plan.stateHistory[1]?.event).toBe('START_TREATMENT');

      // Điểm số tiến triển qua các buổi
      expect(plan.progressMetrics.length).toBe(1);
      expect(plan.progressMetrics[0]?.scores.stress).toBe(3);
    }
  });

  it('xuất dữ liệu cá nhân thành công và ghi AuditLog', async () => {
    const res = await exportCustomerData(testCustomer.id);

    expect(res.ok).toBe(true);
    if (res.ok) {
      const exportJson = res.value as Record<string, unknown>;
      expect(exportJson.id).toBe(testCustomer.id);
      expect(exportJson.name).toBe('Khách Hàng Tracker');

      // Kiểm tra có AuditLog
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: testCustomer.id,
          action: 'EXPORT_CUSTOMER_DATA',
        },
      });
      expect(auditLog).not.toBeNull();
    }
  });

  it('ngăn chặn khách hàng xóa tài khoản của người khác', async () => {
    const res = await deleteCustomerAccount({
      targetUserId: otherCustomer.id,
      actorId: testCustomer.id, // Khách A cố xóa khách B
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('không có quyền');
    }
  });

  it('cho phép khách hàng xóa tài khoản của chính mình kèm cascade dữ liệu', async () => {
    // Tạo 1 tài khoản phụ để test xóa
    const userToDelete = await prisma.user.create({
      data: {
        email: `to-delete-${Date.now()}@test.com`,
        name: 'Người Cần Xóa',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            consentAt: new Date(),
          },
        },
      },
    });

    const res = await deleteCustomerAccount({
      targetUserId: userToDelete.id,
      actorId: userToDelete.id,
    });

    expect(res.ok).toBe(true);

    // Xác nhận không còn trong database
    const checkUser = await prisma.user.findUnique({
      where: { id: userToDelete.id },
    });
    expect(checkUser).toBeNull();
  });
});
