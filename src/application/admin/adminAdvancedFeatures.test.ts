import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { createAdminAppointment } from './appointmentOperations';
import {
  calculateBillPreview,
  refundOrVoidInvoice,
  createAndSettleInvoice,
} from './billingManagement';
import { stockInProduct, stockOutProduct } from './inventoryManagement';
import { resetStaffPassword } from './hrManagement';

describe('Admin Advanced Management Use-Cases (Calendar, Billing, Inventory, CRM)', () => {
  let adminUser: { id: string; email: string };
  let therapistUser: { id: string; email: string };
  let customerUser: { id: string; email: string };
  let customerProfileId: string;
  const testServiceSlug = 'thu-gian-sau';

  beforeAll(async () => {
    adminUser = await prisma.user.create({
      data: {
        email: `admin-adv-${Date.now()}@spawellness.vn`,
        name: 'Quản Trị Viên Test',
        passwordHash: 'hash',
        role: 'ADMIN',
      },
    });

    therapistUser = await prisma.user.create({
      data: {
        email: `therapist-adv-${Date.now()}@spawellness.vn`,
        name: 'KTV Test Nâng Cao',
        passwordHash: 'hash',
        role: 'THERAPIST',
      },
    });

    customerUser = await prisma.user.create({
      data: {
        email: `cust-adv-${Date.now()}@spawellness.vn`,
        name: 'Khách Test Nâng Cao',
        passwordHash: 'hash',
        role: 'CUSTOMER',
        profile: {
          create: {
            loyaltyTier: 'GOLD',
            totalSpentVnd: 16000000,
            prepaidSessions: 3,
            safetyFlags: '[]',
            consentAt: new Date(),
          },
        },
      },
    });

    const p = await prisma.customerProfile.findUniqueOrThrow({
      where: { userId: customerUser.id },
    });
    customerProfileId = p.id;
  });

  afterAll(async () => {
    if (adminUser) {
      await prisma.auditLog.deleteMany({ where: { actorId: adminUser.id } });
    }
    if (customerUser) {
      await prisma.appointment.deleteMany({
        where: { therapistId: therapistUser.id },
      });
      await prisma.invoiceItem.deleteMany({});
      await prisma.invoice.deleteMany({
        where: { customerId: customerProfileId },
      });
      await prisma.treatmentPlan.deleteMany({
        where: { customerId: customerProfileId },
      });
      await prisma.user.delete({ where: { id: customerUser.id } }).catch(() => {});
    }
    if (therapistUser) {
      await prisma.user.delete({ where: { id: therapistUser.id } }).catch(() => {});
    }
    if (adminUser) {
      await prisma.user.delete({ where: { id: adminUser.id } }).catch(() => {});
    }
  });

  it('ngăn chặn xung đột lịch hẹn (Race Condition Shield) khi xếp 2 lịch trùng giờ cho 1 KTV', async () => {
    const slotStart = new Date('2026-11-20T10:00:00.000Z');

    // Lịch 1: Tạo thành công
    const apt1Res = await createAdminAppointment({
      customerId: customerProfileId,
      serviceSlug: testServiceSlug,
      therapistId: therapistUser.id,
      startAt: slotStart,
      room: 'Phòng VIP 01',
    });
    expect(apt1Res.ok).toBe(true);

    // Lịch 2: Trùng giờ (bắt đầu sau 15 phút, nằm trọn trong thời lượng 75 phút của dịch vụ)
    const conflictSlot = new Date('2026-11-20T10:15:00.000Z');
    const apt2Res = await createAdminAppointment({
      customerId: customerProfileId,
      serviceSlug: testServiceSlug,
      therapistId: therapistUser.id,
      startAt: conflictSlot,
      room: 'Phòng VIP 02',
    });

    expect(apt2Res.ok).toBe(false);
    if (!apt2Res.ok) {
      expect(apt2Res.error).toContain('Kỹ thuật viên đã có lịch trùng trong khung giờ này');
    }
  });

  it('thuật toán tính hóa đơn chiết khấu đúng theo hạng thẻ GOLD (10%) và voucher', async () => {
    const previewRes = await calculateBillPreview({
      customerId: customerProfileId,
      serviceSlug: testServiceSlug, // 1.200.000 VND
      productItems: [{ slug: 'tinh-dau-thu-gian', quantity: 1 }], // 320.000 VND
      voucherCode: 'MKSPA50', // Giảm 50.000 VND
    });

    expect(previewRes.ok).toBe(true);
    if (previewRes.ok) {
      const calc = previewRes.value;
      expect(calc.subtotalVnd).toBe(1520000);
      expect(calc.tierDiscountVnd).toBe(120000); // 10% của 1.200.000
      expect(calc.voucherDiscountVnd).toBe(50000);
      expect(calc.totalDiscountVnd).toBe(170000);
      expect(calc.finalVnd).toBe(1350000); // 1.520.000 - 170.000
    }
  });

  it('xử lý trừ lùi buổi cho gói liệu trình trả trước (0đ tiền dịch vụ)', async () => {
    const previewRes = await calculateBillPreview({
      customerId: customerProfileId,
      serviceSlug: testServiceSlug,
      usePrepaidSession: true,
    });

    expect(previewRes.ok).toBe(true);
    if (previewRes.ok) {
      expect(previewRes.value.finalVnd).toBe(0);
      expect(previewRes.value.isPrepaidPackageEligible).toBe(true);
    }
  });

  it('nhập và xuất kho mỹ phẩm với kiểm tra ràng buộc tồn kho không âm', async () => {
    const testProdSlug = 'tinh-dau-thu-gian';

    // Nhập thêm 20 sản phẩm
    const stockInRes = await stockInProduct({
      productSlug: testProdSlug,
      quantity: 20,
      reason: 'Nhập lô hàng kiểm thử',
      actorId: 'admin-test',
    });
    expect(stockInRes.ok).toBe(true);

    // Xuất kho 5 sản phẩm
    const stockOutRes = await stockOutProduct({
      productSlug: testProdSlug,
      quantity: 5,
      reason: 'Xuất sử dụng test',
      actorId: 'admin-test',
    });
    expect(stockOutRes.ok).toBe(true);

    // Xuất quá số lượng tồn kho -> phải báo lỗi
    const overflowRes = await stockOutProduct({
      productSlug: testProdSlug,
      quantity: 999999,
      reason: 'Xuất quá mức',
      actorId: 'admin-test',
    });
    expect(overflowRes.ok).toBe(false);
    if (!overflowRes.ok) {
      expect(overflowRes.error).toContain('Tồn kho không đủ để xuất');
    }
  });

  it('đặt lại mật khẩu tạm thời cho nhân sự và ghi nhận AuditLog bảo mật', async () => {
    const resetRes = await resetStaffPassword(therapistUser.id, adminUser.id);
    expect(resetRes.ok).toBe(true);
    if (resetRes.ok) {
      expect(resetRes.value.tempPassword).toMatch(/^MKSpa#Temp\d{4}$/);
      expect(resetRes.value.staffName).toBe('KTV Test Nâng Cao');

      // Kiểm tra AuditLog đã được ghi
      const log = await prisma.auditLog.findFirst({
        where: {
          targetId: therapistUser.id,
          action: 'RESET_PASSWORD',
        },
      });
      expect(log).toBeDefined();
      expect(log?.actorId).toBe(adminUser.id);
    }
  });

  it('hủy/hoàn tiền hóa đơn: hoàn trả tồn kho, phục hồi buổi liệu trình và đổi trạng thái sang REFUNDED', async () => {
    // 1. Tạo hóa đơn thanh toán bằng PREPAID_PACKAGE có mua kèm sản phẩm
    const invoiceRes = await createAndSettleInvoice({
      customerId: customerProfileId,
      serviceSlug: testServiceSlug,
      paymentMethod: 'PREPAID_PACKAGE',
      productItems: [{ slug: 'tinh-dau-thu-gian', quantity: 2 }],
      paidVnd: 640000,
      notes: 'Hóa đơn test hoàn tiền',
    });
    expect(invoiceRes.ok).toBe(true);
    if (!invoiceRes.ok) return;

    const invoiceId = invoiceRes.value.invoiceId;

    // Lấy tồn kho trước khi hoàn
    const prodBefore = await prisma.product.findUniqueOrThrow({
      where: { slug: 'tinh-dau-thu-gian' },
    });
    const profileBefore = await prisma.customerProfile.findUniqueOrThrow({
      where: { id: customerProfileId },
    });

    // 2. Thực hiện hủy/hoàn hóa đơn
    const refundRes = await refundOrVoidInvoice({
      invoiceId,
      reason: 'Khách yêu cầu dời lịch và đổi dịch vụ',
      actorId: adminUser.id,
    });
    expect(refundRes.ok).toBe(true);
    if (refundRes.ok) {
      expect(refundRes.value.refundedVnd).toBe(640000);
    }

    // 3. Kiểm tra trạng thái hóa đơn
    const refundedInvoice = await prisma.invoice.findUniqueOrThrow({
      where: { id: invoiceId },
    });
    expect(refundedInvoice.status).toBe('REFUNDED');
    expect(refundedInvoice.notes).toContain('[HOÀN TIỀN/HỦY]');

    // 4. Kiểm tra tồn kho đã được hoàn trả (+2)
    const prodAfter = await prisma.product.findUniqueOrThrow({
      where: { slug: 'tinh-dau-thu-gian' },
    });
    expect(prodAfter.stockQuantity).toBe(prodBefore.stockQuantity + 2);

    // 5. Kiểm tra buổi liệu trình trả trước đã được hoàn (+1)
    const profileAfter = await prisma.customerProfile.findUniqueOrThrow({
      where: { id: customerProfileId },
    });
    expect(profileAfter.prepaidSessions).toBe(profileBefore.prepaidSessions + 1);

    // 6. Kiểm tra AuditLog
    const audit = await prisma.auditLog.findFirst({
      where: {
        targetId: invoiceId,
        action: 'REFUND_INVOICE',
      },
    });
    expect(audit).toBeDefined();
    expect(audit?.actorId).toBe(adminUser.id);
  });
});
