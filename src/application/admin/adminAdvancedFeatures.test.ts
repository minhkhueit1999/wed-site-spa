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
import { updateProduct } from './productCrud';
import { createUserAccount, updateUserAccount, deleteUserAccount } from './userAccountManagement';
import { useOrderStore } from '@/infrastructure/store/useOrderStore';

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

  it('quản lý tài khoản: thêm, sửa và xóa tài khoản người dùng an toàn', async () => {
    // 1. Thêm tài khoản mới
    const createRes = await createUserAccount(
      {
        name: 'Trần Văn Test',
        email: `tranvantest-${Date.now()}@spawellness.vn`,
        role: 'CUSTOMER',
        phone: '0901234567',
        password: 'Password123!',
      },
      adminUser.id,
    );
    expect(createRes.ok).toBe(true);
    if (!createRes.ok) return;

    const newUserId = createRes.value.id;

    // 2. Sửa thông tin tài khoản
    const updateRes = await updateUserAccount(
      {
        id: newUserId,
        name: 'Trần Văn Test (Đã Sửa)',
        email: `tranvantest-updated-${Date.now()}@spawellness.vn`,
        role: 'THERAPIST',
        phone: '0988888888',
      },
      adminUser.id,
    );
    expect(updateRes.ok).toBe(true);

    const userInDb = await prisma.user.findUniqueOrThrow({
      where: { id: newUserId },
      include: { profile: true },
    });
    expect(userInDb.name).toBe('Trần Văn Test (Đã Sửa)');
    expect(userInDb.role).toBe('THERAPIST');
    expect(userInDb.profile?.phone).toBe('0988888888');

    // 3. Xóa tài khoản
    const deleteRes = await deleteUserAccount(newUserId, adminUser.id);
    expect(deleteRes.ok).toBe(true);

    const deletedUser = await prisma.user.findUnique({
      where: { id: newUserId },
    });
    expect(deletedUser).toBeNull();

    // 4. Kiểm tra ngăn chặn tự xóa tài khoản của chính mình
    const selfDeleteRes = await deleteUserAccount(adminUser.id, adminUser.id);
    expect(selfDeleteRes.ok).toBe(false);
  });

  it('sửa thông tin sản phẩm: cập nhật giá bán, giá vốn, tồn kho và trạng thái active', async () => {
    const testProdSlug = `test-prod-update-${Date.now()}`;
    await prisma.product.create({
      data: {
        slug: testProdSlug,
        name: 'Sản phẩm thử nghiệm',
        description: 'Mô tả ban đầu',
        usageGuide: 'HDSD ban đầu',
        priceVnd: 200000,
        costPriceVnd: 100000,
        stockQuantity: 50,
      },
    });

    const updateRes = await updateProduct({
      slug: testProdSlug,
      name: 'Sản phẩm thử nghiệm (Đã Cập Nhật)',
      priceVnd: 380000,
      costPriceVnd: 180000,
      stockQuantity: 88,
      minStockAlert: 15,
      active: true,
    });

    expect(updateRes.ok).toBe(true);
    if (updateRes.ok) {
      expect(updateRes.value.slug).toBe(testProdSlug);
    }

    const prodInDb = await prisma.product.findUniqueOrThrow({
      where: { slug: testProdSlug },
    });
    expect(prodInDb.name).toBe('Sản phẩm thử nghiệm (Đã Cập Nhật)');
    expect(prodInDb.priceVnd).toBe(380000);
    expect(prodInDb.costPriceVnd).toBe(180000);
    expect(prodInDb.stockQuantity).toBe(88);

    // Dọn dẹp
    await prisma.product.delete({ where: { slug: testProdSlug } });
  });

  it('duyệt đơn hàng của khách hàng: cập nhật trạng thái đơn hàng tuần tự', () => {
    const store = useOrderStore.getState();
    const orderId = 'MKSPA-TEST-APPROVAL';

    // Thêm đơn hàng kiểm thử
    store.addOrder({
      orderId,
      createdAt: new Date().toISOString(),
      items: [],
      subtotal: 500000,
      discountAmount: 0,
      shippingFee: 30000,
      total: 530000,
      customer: {
        name: 'Khách Kiểm Thử Duyệt Đơn',
        phone: '0933333333',
        email: 'khachduyetdon@gmail.com',
        address: '123 Đường Hoa Sen, TP.HCM',
      },
      giftOption: { isGift: false },
      shippingMethod: 'standard',
      paymentMethod: 'vietqr',
      status: 'PREPARING_HERBS',
    });

    // 1. Duyệt sang đóng gói
    store.updateOrderStatus(orderId, 'BAMBOO_PACKAGING');
    expect(useOrderStore.getState().getOrderById(orderId)?.status).toBe('BAMBOO_PACKAGING');

    // 2. Duyệt sang giao hàng
    store.updateOrderStatus(orderId, 'DELIVERING');
    expect(useOrderStore.getState().getOrderById(orderId)?.status).toBe('DELIVERING');

    // 3. Duyệt hoàn thành
    store.updateOrderStatus(orderId, 'COMPLETED');
    expect(useOrderStore.getState().getOrderById(orderId)?.status).toBe('COMPLETED');

    // 4. Hủy đơn hàng
    store.deleteOrder(orderId);
    expect(useOrderStore.getState().getOrderById(orderId)).toBeUndefined();
  });
});
