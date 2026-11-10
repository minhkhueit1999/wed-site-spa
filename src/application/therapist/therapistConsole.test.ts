import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { submitSessionLog } from './submitSessionLog';
import { prescribeProduct } from './prescribeProduct';
import { finishSessions } from './finishSessions';
import { getTherapistSchedule, getAppointmentDetail } from './getTherapistSchedule';

describe('Therapist Console Use-Cases', () => {
  let therapistUser: { id: string; email: string };
  let otherTherapist: { id: string; email: string };
  let customerUser: { id: string; email: string };
  let testPlanId: string;
  let testAppointmentId: string;

  beforeAll(async () => {
    therapistUser = await prisma.user.create({
      data: {
        email: `therapist-test-${Date.now()}@spa.vn`,
        name: 'Kỹ Thuật Viên Chính',
        passwordHash: 'hash',
        role: 'THERAPIST',
      },
    });

    otherTherapist = await prisma.user.create({
      data: {
        email: `therapist-other-${Date.now()}@spa.vn`,
        name: 'Kỹ Thuật Viên Khác',
        passwordHash: 'hash',
        role: 'THERAPIST',
      },
    });

    customerUser = await prisma.user.create({
      data: {
        email: `customer-session-${Date.now()}@spa.vn`,
        name: 'Khách Trị Liệu Session',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            // Khách có cờ dị ứng tinh dầu
            safetyFlags: JSON.stringify(['allergy-essential-oil']),
            consentAt: new Date(),
          },
        },
      },
    });

    const profile = await prisma.customerProfile.findUniqueOrThrow({
      where: { userId: customerUser.id },
    });

    // Tạo phác đồ ban đầu ở trạng thái BUNDLE_CONFIRMED
    const plan = await prisma.treatmentPlan.create({
      data: {
        customerId: profile.id,
        serviceSlug: 'thu-gian-sau',
        totalSessions: 2,
        state: 'BUNDLE_CONFIRMED',
      },
    });
    testPlanId = plan.id;

    const apt = await prisma.appointment.create({
      data: {
        planId: plan.id,
        therapistId: therapistUser.id,
        startAt: new Date(Date.now() + 3600000),
        endAt: new Date(Date.now() + 7200000),
        status: 'SCHEDULED',
      },
    });
    testAppointmentId = apt.id;
  });

  afterAll(async () => {
    await prisma.treatmentPlan
      .deleteMany({
        where: { id: testPlanId },
      })
      .catch(() => {});
    await prisma.user
      .deleteMany({
        where: { id: { in: [therapistUser.id, otherTherapist.id, customerUser.id] } },
      })
      .catch(() => {});
  });

  it('từ chối khi ghi chú ngắn hơn 10 ký tự', async () => {
    const res = await submitSessionLog({
      appointmentId: testAppointmentId,
      therapistId: therapistUser.id,
      notes: 'Quá ngắn',
      progressScores: { stress: 4 },
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('ít nhất 10 ký tự');
    }
  });

  it('từ chối khi kỹ thuật viên không được phân công phụ trách buổi hẹn', async () => {
    const res = await submitSessionLog({
      appointmentId: testAppointmentId,
      therapistId: otherTherapist.id, // Kỹ thuật viên khác
      notes: 'Khách đáp ứng tốt thao tác trị liệu giãn cơ.',
      progressScores: { stress: 4 },
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('không được phân công');
    }
  });

  it('ghi nhật ký thành công, cập nhật COMPLETED và chuyển state thành IN_TREATMENT', async () => {
    const res = await submitSessionLog({
      appointmentId: testAppointmentId,
      therapistId: therapistUser.id,
      notes: 'Khách hàng có phản ứng rất tốt với liệu trình bấm huyệt nhẹ. Thư giãn tốt.',
      progressScores: { stress: 3, sleep: 4 },
      adjustments: 'Giảm lực nhấn vùng vai phải',
      nextSessionAdvice: 'Duy trì uống trà thảo mộc trước khi ngủ',
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.planState).toBe('IN_TREATMENT');

      const apt = await prisma.appointment.findUnique({
        where: { id: testAppointmentId },
        include: { sessionLog: true, plan: true },
      });

      expect(apt?.status).toBe('COMPLETED');
      expect(apt?.sessionLog).not.toBeNull();
      expect(apt?.sessionLog?.notes).toContain('phản ứng rất tốt');
      expect(apt?.plan.state).toBe('IN_TREATMENT');

      // Kiểm tra có AuditLog
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: therapistUser.id,
          action: 'UPDATE_SESSION_LOG',
        },
      });
      expect(auditLog).not.toBeNull();
    }
  });

  it('CHẶN NGHIÊM NGẶT khi kê sản phẩm bị chống chỉ định đối với khách hàng', async () => {
    // 'allergy-essential-oil' chặn 'tinh-dau-thu-gian' theo seed
    const res = await prescribeProduct({
      planId: testPlanId,
      therapistId: therapistUser.id,
      productSlug: 'tinh-dau-thu-gian',
      instructions: 'Thoa 2 giọt vào thái dương trước khi ngủ',
      frequency: 'Mỗi tối',
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('CẢNH BÁO AN TOÀN');
      expect(res.error).toContain('chống chỉ định');
    }
  });

  it('cho phép kê sản phẩm an toàn không bị chống chỉ định', async () => {
    // 'tra-thao-moc-toi' an toàn, không bị chặn bởi allergy-essential-oil
    const res = await prescribeProduct({
      planId: testPlanId,
      therapistId: therapistUser.id,
      productSlug: 'tra-thao-moc-toi',
      instructions: 'Pha 1 gói với 200ml nước ấm uống 30 phút trước khi ngủ',
      frequency: 'Mỗi tối',
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      const pres = await prisma.homeCarePrescription.findUnique({
        where: { id: res.value.prescriptionId },
      });
      expect(pres).not.toBeNull();
      expect(pres?.productSlug).toBe('tra-thao-moc-toi');

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          actorId: therapistUser.id,
          action: 'CREATE_PRESCRIPTION',
        },
      });
      expect(auditLog).not.toBeNull();
    }
  });

  it('từ chối kết thúc chuỗi buổi khi chưa hoàn thành đủ số buổi', async () => {
    // Phác đồ yêu cầu totalSessions = 2, mới hoàn thành 1 buổi
    const res = await finishSessions({
      planId: testPlanId,
      therapistId: therapistUser.id,
    });

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('Chưa hoàn thành đủ số buổi');
    }
  });

  it('kết thúc chuỗi buổi thành công khi hoàn thành đủ số buổi (chuyển sang HOME_CARE)', async () => {
    // Tạo thêm buổi thứ 2 và hoàn tất buổi thứ 2
    const apt2 = await prisma.appointment.create({
      data: {
        planId: testPlanId,
        therapistId: therapistUser.id,
        startAt: new Date(Date.now() + 86400000),
        endAt: new Date(Date.now() + 86400000 + 75 * 60000),
        status: 'COMPLETED',
        sessionLog: {
          create: {
            therapistId: therapistUser.id,
            notes: 'Buổi cuối hoàn tất mỹ mãn, thể trạng cải thiện rõ rệt.',
            progressScores: JSON.stringify({ stress: 1, sleep: 5 }),
          },
        },
      },
    });

    const res = await finishSessions({
      planId: testPlanId,
      therapistId: therapistUser.id,
      notes: 'Hoàn tất chuỗi 2 buổi tại spa, chuyển khách sang giai đoạn dưỡng tại nhà.',
    });

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.nextState).toBe('HOME_CARE');

      const updatedPlan = await prisma.treatmentPlan.findUnique({
        where: { id: testPlanId },
      });
      expect(updatedPlan?.state).toBe('HOME_CARE');
    }

    await prisma.appointment.delete({ where: { id: apt2.id } });
  });

  it('lấy danh sách lịch hẹn của kỹ thuật viên', async () => {
    const res = await getTherapistSchedule(therapistUser.id);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.length).toBeGreaterThan(0);
      expect(res.value[0]?.customerName).toBe('Khách Trị Liệu Session');
    }
  });

  it('lấy chi tiết buổi hẹn với cảnh báo chống chỉ định và danh sách sản phẩm', async () => {
    const res = await getAppointmentDetail(testAppointmentId, therapistUser.id);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.customer.name).toBe('Khách Trị Liệu Session');
      expect(res.value.customer.safetyFlags).toContain('allergy-essential-oil');
      expect(res.value.availableProducts.length).toBeGreaterThan(0);

      // Tinh dầu thư giãn phải bị đánh dấu isBlocked = true
      const blockedProduct = res.value.availableProducts.find(
        (p) => p.slug === 'tinh-dau-thu-gian',
      );
      expect(blockedProduct).toBeDefined();
      expect(blockedProduct?.isBlocked).toBe(true);
    }
  });
});
