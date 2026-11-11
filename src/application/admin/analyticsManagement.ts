import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface AnalyticsDashboardData {
  totalRevenueVnd: number;
  monthRevenueVnd: number;
  totalAppointments: number;
  occupancyRatePercent: number;
  totalCustomers: number;
  totalDebtOutstandingVnd: number;
  staffKpis: Array<{
    staffId: string;
    staffName: string;
    role: string;
    completedSessions: number;
    upsellRevenueVnd: number;
    upsellCommissionVnd: number;
  }>;
  topServices: Array<{
    slug: string;
    name: string;
    bookingCount: number;
    revenueVnd: number;
  }>;
  topProducts: Array<{
    slug: string;
    name: string;
    salesCount: number;
    revenueVnd: number;
  }>;
}

/**
 * Lấy báo cáo phân tích kinh doanh, KPI và dịch vụ/sản phẩm bán chạy nhất
 */
export async function getAnalyticsDashboard(): Promise<Result<AnalyticsDashboardData, string>> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Doanh thu tổng và doanh thu tháng
    const allPaidInvoices = await prisma.invoice.findMany({
      where: { status: 'PAID' },
      select: {
        finalVnd: true,
        createdAt: true,
        upsellTherapistId: true,
        upsellCommissionVnd: true,
      },
    });

    const totalRevenueVnd = allPaidInvoices.reduce((sum, inv) => sum + inv.finalVnd, 0);
    const monthRevenueVnd = allPaidInvoices
      .filter((inv) => inv.createdAt >= startOfMonth)
      .reduce((sum, inv) => sum + inv.finalVnd, 0);

    // 2. Lịch hẹn và Tỷ lệ lấp đầy (Occupancy Rate)
    const appointments = await prisma.appointment.findMany({
      select: { id: true, status: true, startAt: true },
    });
    const totalAppointments = appointments.length;
    const completedApts = appointments.filter((a) => a.status === 'COMPLETED').length;
    // Giả định công suất 1 tháng là 200 slots
    const occupancyRatePercent = Math.min(100, Math.round((completedApts / 120) * 100));

    // 3. Khách hàng và Công nợ tồn đọng
    const customerProfiles = await prisma.customerProfile.findMany({
      select: { id: true, debtBalanceVnd: true },
    });
    const totalCustomers = customerProfiles.length;
    const totalDebtOutstandingVnd = customerProfiles.reduce((sum, c) => sum + c.debtBalanceVnd, 0);

    // 4. KPI Nhân sự (KTV)
    const therapists = await prisma.user.findMany({
      where: { role: { in: ['THERAPIST', 'ADMIN'] } },
      include: {
        appointments: { where: { status: 'COMPLETED' } },
      },
    });

    const staffKpis = therapists.map((t) => {
      // Doanh thu bán chéo của KTV này
      const therapistInvoices = allPaidInvoices.filter((inv) => inv.upsellTherapistId === t.id);
      const upsellCommission = therapistInvoices.reduce(
        (sum, inv) => sum + inv.upsellCommissionVnd,
        0,
      );
      // Giả sử doanh thu bán chéo = hoa hồng / 0.15
      const upsellRevenue = Math.round(upsellCommission / 0.15);

      return {
        staffId: t.id,
        staffName: t.name,
        role: t.role,
        completedSessions: t.appointments.length,
        upsellRevenueVnd: upsellRevenue,
        upsellCommissionVnd: upsellCommission,
      };
    });

    // 5. Top Dịch vụ
    const services = await prisma.service.findMany({
      include: {
        treatmentPlans: {
          include: {
            appointments: { where: { status: 'COMPLETED' } },
          },
        },
      },
    });

    const topServices = services
      .map((s) => {
        let count = 0;
        for (const p of s.treatmentPlans) {
          count += p.appointments.length;
        }
        return {
          slug: s.slug,
          name: s.name,
          bookingCount: count,
          revenueVnd: count * s.priceVnd,
        };
      })
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);

    // 6. Top Sản phẩm
    const invoiceItems = await prisma.invoiceItem.findMany({
      where: { itemType: 'PRODUCT' },
    });

    const productSalesMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const it of invoiceItems) {
      const prev = productSalesMap.get(it.itemId) || {
        name: it.itemName,
        count: 0,
        revenue: 0,
      };
      prev.count += it.quantity;
      prev.revenue += it.totalPriceVnd;
      productSalesMap.set(it.itemId, prev);
    }

    const topProducts = Array.from(productSalesMap.entries())
      .map(([slug, data]) => ({
        slug,
        name: data.name,
        salesCount: data.count,
        revenueVnd: data.revenue,
      }))
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);

    return ok({
      totalRevenueVnd,
      monthRevenueVnd,
      totalAppointments,
      occupancyRatePercent,
      totalCustomers,
      totalDebtOutstandingVnd,
      staffKpis,
      topServices,
      topProducts,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy báo cáo analytics';
    return err(msg);
  }
}
