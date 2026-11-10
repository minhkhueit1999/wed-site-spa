import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { createService, deleteService } from './serviceCrud';
import { createProduct, deleteProduct } from './productCrud';
import { createRule, deleteRule } from './ruleCrud';
import { createContraindication, deleteContraindication } from './contraindicationCrud';
import { simulateRules } from './ruleSimulation';
import { getAdminStats } from './getAdminStats';

describe('Admin Management Use-Cases', () => {
  let customerUser: { id: string; email: string };
  let testPlanId: string;

  beforeAll(async () => {
    customerUser = await prisma.user.create({
      data: {
        email: `admin-test-cust-${Date.now()}@test.com`,
        name: 'Khách Test Quản Trị',
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
  });

  afterAll(async () => {
    if (testPlanId) {
      await prisma.treatmentPlan.delete({ where: { id: testPlanId } }).catch(() => {});
    }
    if (customerUser) {
      await prisma.user.delete({ where: { id: customerUser.id } }).catch(() => {});
    }
  });

  it('tạo dịch vụ mới thành công và chặn xóa khi dịch vụ có phác đồ hoạt động', async () => {
    const testSlug = `dich-vu-test-${Date.now()}`;
    const createRes = await createService({
      slug: testSlug,
      name: 'Dịch Vụ Test Ràng Buộc',
      description: 'Mô tả dịch vụ thử nghiệm ràng buộc toàn vẹn',
      durationMin: 45,
      sessionsRecommended: 4,
      priceVnd: 500000,
    });

    expect(createRes.ok).toBe(true);

    const profile = await prisma.customerProfile.findUniqueOrThrow({
      where: { userId: customerUser.id },
    });

    // Tạo một TreatmentPlan gắn với dịch vụ này
    const plan = await prisma.treatmentPlan.create({
      data: {
        customerId: profile.id,
        serviceSlug: testSlug,
        state: 'IN_TREATMENT',
      },
    });
    testPlanId = plan.id;

    // Cố gắng xóa dịch vụ -> PHẢI BỊ CHẶN
    const deleteBlockedRes = await deleteService(testSlug);
    expect(deleteBlockedRes.ok).toBe(false);
    if (!deleteBlockedRes.ok) {
      expect(deleteBlockedRes.error).toContain('phác đồ điều trị hoạt động');
    }

    // Xóa TreatmentPlan trước
    await prisma.treatmentPlan.delete({ where: { id: plan.id } });
    testPlanId = '';

    // Bây giờ xóa dịch vụ -> PHẢI THÀNH CÔNG
    const deleteSuccessRes = await deleteService(testSlug);
    expect(deleteSuccessRes.ok).toBe(true);
  });

  it('tạo sản phẩm mới và xóa sản phẩm khi không bị ràng buộc', async () => {
    const testSlug = `san-pham-test-${Date.now()}`;
    const createRes = await createProduct({
      slug: testSlug,
      name: 'Sản Phẩm Test Ràng Buộc',
      description: 'Mô tả sản phẩm test',
      usageGuide: 'Thoa 2 lần mỗi ngày',
      priceVnd: 150000,
    });

    expect(createRes.ok).toBe(true);

    const deleteRes = await deleteProduct(testSlug);
    expect(deleteRes.ok).toBe(true);
  });

  it('tạo và xóa quy tắc gợi ý thành công', async () => {
    const ruleId = `R-TEST-${Date.now()}`;
    const createRes = await createRule({
      id: ruleId,
      concernSlug: 'mat-ngu',
      minSeverity: 3,
      serviceSlug: 'thu-gian-sau',
      productSlugs: ['tinh-dau-thu-gian'],
      priority: 99,
      rationale: 'Quy tắc thử nghiệm ưu tiên cao',
    });

    expect(createRes.ok).toBe(true);

    const deleteRes = await deleteRule(ruleId);
    expect(deleteRes.ok).toBe(true);
  });

  it('tạo và xóa cờ chống chỉ định thành công', async () => {
    const flag = `flag-test-${Date.now()}`;
    const createRes = await createContraindication({
      flag,
      message: 'Cảnh báo chống chỉ định test',
      blocksServiceSlugs: ['thu-gian-sau'],
      blocksProductSlugs: [],
      requiresStaffReview: true,
    });

    expect(createRes.ok).toBe(true);

    if (createRes.ok) {
      const deleteRes = await deleteContraindication(createRes.value.id);
      expect(deleteRes.ok).toBe(true);
    }
  });

  it('mô phỏng luật gợi ý (Live Preview) dựa trên dữ liệu database', async () => {
    const simRes = await simulateRules({
      concernScores: [{ concernSlug: 'mat-ngu', severity: 4 }],
      safetyFlags: [],
    });

    expect(simRes.ok).toBe(true);
    if (simRes.ok) {
      expect(simRes.value.recommendations.length).toBeGreaterThan(0);
      expect(simRes.value.recommendations[0]?.serviceSlug).toBe('thu-gian-sau');
      expect(simRes.value.recommendations[0]?.reasons.length).toBeGreaterThan(0);
    }
  });

  it('lấy số liệu thống kê quản trị hệ thống đầy đủ', async () => {
    const statsRes = await getAdminStats();

    expect(statsRes.ok).toBe(true);
    if (statsRes.ok) {
      expect(statsRes.value.counts.services).toBeGreaterThan(0);
      expect(statsRes.value.counts.products).toBeGreaterThan(0);
      expect(statsRes.value.counts.rules).toBeGreaterThan(0);
      expect(statsRes.value.counts.contraindications).toBeGreaterThan(0);
    }
  });
});
