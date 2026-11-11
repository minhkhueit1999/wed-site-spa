import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface TechnicianEarningsMobileData {
  month: string;
  tierLevel: string;
  baseSalaryVnd: number;
  completedSessionsMonth: number;
  sessionAllowanceVnd: number;
  upsellCommissionVnd: number;
  tipAmountVnd: number;
  bonusVnd: number;
  totalEarningsVnd: number;
  recentCommissions: Array<{
    date: string;
    description: string;
    amountVnd: number;
    type: 'SESSION' | 'UPSELL' | 'TIP';
  }>;
}

/**
 * Lấy bảng thu nhập và ví hoa hồng của KTV theo thời gian thực (Mobile Wallet)
 */
export async function getTechnicianEarnings(
  therapistId: string,
  monthStr?: string,
): Promise<Result<TechnicianEarningsMobileData, string>> {
  try {
    const now = new Date();
    const currentMonth =
      monthStr || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [yearStr, mStr] = currentMonth.split('-');
    const year = parseInt(yearStr || '2026', 10);
    const m = parseInt(mStr || '11', 10) - 1;
    const startOfMonth = new Date(year, m, 1);
    const endOfMonth = new Date(year, m + 1, 0, 23, 59, 59);

    // 1. Lấy thông tin bảng lương cấu hình (nếu có)
    const payroll = await prisma.staffPayroll.findUnique({
      where: { staffId_month: { staffId: therapistId, month: currentMonth } },
    });

    const tierLevel = payroll?.tierLevel || 'SENIOR';
    const baseSalary = payroll?.baseSalaryVnd || 8500000;
    const allowancePerSession = tierLevel === 'MASTER' ? 60000 : 50000;

    // 2. Các buổi hoàn thành thực tế trong tháng
    const completedApts = await prisma.appointment.findMany({
      where: {
        therapistId,
        status: 'COMPLETED',
        startAt: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        plan: { include: { service: { select: { name: true } } } },
      },
      orderBy: { startAt: 'desc' },
    });

    const completedCount = completedApts.length;
    const sessionAllowance = completedCount * allowancePerSession;

    // 3. Các khoản hoa hồng bán chéo trong tháng
    const upsellInvoices = await prisma.invoice.findMany({
      where: {
        upsellTherapistId: therapistId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        items: { where: { itemType: 'PRODUCT' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalUpsellCommission = upsellInvoices.reduce(
      (sum, inv) => sum + (inv.upsellCommissionVnd || 0),
      0,
    );
    const tipAmount = payroll?.tipAmountVnd || 850000;
    const bonus = completedCount >= 30 ? 500000 : 0;
    const totalEarnings = baseSalary + sessionAllowance + totalUpsellCommission + tipAmount + bonus;

    // 4. Danh sách các khoản ghi nhận gần nhất
    const recentCommissions: TechnicianEarningsMobileData['recentCommissions'] = [];

    // Thêm các khoản ca làm
    for (const apt of completedApts.slice(0, 10)) {
      recentCommissions.push({
        date: apt.startAt.toISOString(),
        description: `Thù lao ca: ${apt.plan.service.name}`,
        amountVnd: allowancePerSession,
        type: 'SESSION',
      });
    }

    // Thêm các khoản bán chéo
    for (const inv of upsellInvoices.slice(0, 5)) {
      const productNames = inv.items.map((i) => i.itemName).join(', ');
      recentCommissions.push({
        date: inv.createdAt.toISOString(),
        description: `Hoa hồng 15% bán chéo: ${productNames || 'Sản phẩm spa'}`,
        amountVnd: inv.upsellCommissionVnd,
        type: 'UPSELL',
      });
    }

    // Sắp xếp theo ngày mới nhất
    recentCommissions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return ok({
      month: currentMonth,
      tierLevel,
      baseSalaryVnd: baseSalary,
      completedSessionsMonth: completedCount,
      sessionAllowanceVnd: sessionAllowance,
      upsellCommissionVnd: totalUpsellCommission,
      tipAmountVnd: tipAmount,
      bonusVnd: bonus,
      totalEarningsVnd: totalEarnings,
      recentCommissions: recentCommissions.slice(0, 15),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy thông tin thu nhập KTV';
    return err(msg);
  }
}
