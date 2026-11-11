import { prisma } from '@/infrastructure/db/prisma';
import bcrypt from 'bcryptjs';
import { Result, ok, err } from '@/domain/shared/result';

export interface StaffListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  activeShiftsCount: number;
  completedAppointmentsCount: number;
}

export interface ShiftRosterItem {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
}

export interface LeaveRequestItem {
  id: string;
  staffId: string;
  staffName: string;
  staffEmail: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  swapWithStaffName?: string | null;
  status: string;
  reviewNote?: string | null;
  createdAt: string;
}

export interface PayrollItem {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  tierLevel: string;
  baseSalaryVnd: number;
  completedSessions: number;
  sessionAllowanceVnd: number;
  tipAmountVnd: number;
  upsellCommissionVnd: number;
  bonusVnd: number;
  totalEarningsVnd: number;
  status: string;
  notes?: string | null;
}

/**
 * Lấy danh sách nhân sự (KTV và Admin)
 */
export async function getStaffList(): Promise<Result<StaffListItem[], string>> {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ['THERAPIST', 'ADMIN'] } },
      include: {
        staffShifts: { where: { status: 'SCHEDULED' } },
        appointments: { where: { status: 'COMPLETED' } },
      },
      orderBy: { name: 'asc' },
    });

    const list: StaffListItem[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      activeShiftsCount: u.staffShifts.length,
      completedAppointmentsCount: u.appointments.length,
    }));

    return ok(list);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy danh sách nhân sự';
    return err(msg);
  }
}

/**
 * Tạo tài khoản nhân sự mới
 */
export async function createStaffAccount(input: {
  name: string;
  email: string;
  role: 'THERAPIST' | 'ADMIN';
  password?: string;
}): Promise<Result<{ id: string; name: string }, string>> {
  try {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) return err('Email nhân sự này đã tồn tại trong hệ thống.');

    const rawPassword = input.password || 'SpaDemo2026!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        role: input.role,
        passwordHash,
      },
    });

    return ok({ id: newUser.id, name: newUser.name });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi tạo nhân sự';
    return err(msg);
  }
}

/**
 * Cập nhật vai trò nhân sự
 */
export async function updateStaffRole(
  userId: string,
  newRole: string,
): Promise<Result<{ success: boolean }, string>> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
    return ok({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi đổi quyền';
    return err(msg);
  }
}

/**
 * Lấy bảng phân ca theo khoảng thời gian
 */
export async function getStaffShifts(
  startDate: Date,
  endDate: Date,
): Promise<Result<ShiftRosterItem[], string>> {
  try {
    const shifts = await prisma.staffShift.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        staff: { select: { name: true } },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const items: ShiftRosterItem[] = shifts.map((s) => ({
      id: s.id,
      staffId: s.staffId,
      staffName: s.staff.name,
      date: s.date.toISOString(),
      shiftType: s.shiftType,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      notes: s.notes,
    }));

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy ca làm';
    return err(msg);
  }
}

/**
 * Phân ca trực cho nhân viên
 */
export async function assignStaffShift(input: {
  staffId: string;
  date: Date;
  shiftType: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<Result<{ id: string }, string>> {
  try {
    const shift = await prisma.staffShift.create({
      data: {
        staffId: input.staffId,
        date: new Date(input.date),
        shiftType: input.shiftType,
        startTime: input.startTime,
        endTime: input.endTime,
        notes: input.notes || null,
        status: 'SCHEDULED',
      },
    });
    return ok({ id: shift.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi gán ca làm việc';
    return err(msg);
  }
}

/**
 * Lấy danh sách đơn xin nghỉ phép/đổi ca
 */
export async function getLeaveRequests(): Promise<Result<LeaveRequestItem[], string>> {
  try {
    const requests = await prisma.leaveRequest.findMany({
      include: {
        staff: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Lấy tên người đổi ca nếu có
    const swapIds = requests.map((r) => r.swapWithStaffId).filter(Boolean) as string[];
    const swapUsers = await prisma.user.findMany({
      where: { id: { in: swapIds } },
      select: { id: true, name: true },
    });
    const swapMap = new Map(swapUsers.map((u) => [u.id, u.name]));

    const items: LeaveRequestItem[] = requests.map((r) => ({
      id: r.id,
      staffId: r.staffId,
      staffName: r.staff.name,
      staffEmail: r.staff.email,
      type: r.type,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
      reason: r.reason,
      swapWithStaffName: r.swapWithStaffId ? swapMap.get(r.swapWithStaffId) : null,
      status: r.status,
      reviewNote: r.reviewNote,
      createdAt: r.createdAt.toISOString(),
    }));

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy danh sách nghỉ phép';
    return err(msg);
  }
}

/**
 * Duyệt hoặc từ chối đơn xin nghỉ phép
 */
export async function reviewLeaveRequest(
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  note: string,
  reviewerId: string,
): Promise<Result<{ success: boolean }, string>> {
  try {
    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewNote: note,
        reviewedById: reviewerId,
      },
    });
    return ok({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi duyệt đơn';
    return err(msg);
  }
}

/**
 * Lấy bảng lương & hoa hồng tháng
 */
export async function getStaffPayrolls(month: string): Promise<Result<PayrollItem[], string>> {
  try {
    const payrolls = await prisma.staffPayroll.findMany({
      where: { month },
      include: {
        staff: { select: { name: true } },
      },
      orderBy: { totalEarningsVnd: 'desc' },
    });

    const items: PayrollItem[] = payrolls.map((p) => ({
      id: p.id,
      staffId: p.staffId,
      staffName: p.staff.name,
      month: p.month,
      tierLevel: p.tierLevel,
      baseSalaryVnd: p.baseSalaryVnd,
      completedSessions: p.completedSessions,
      sessionAllowanceVnd: p.sessionAllowanceVnd,
      tipAmountVnd: p.tipAmountVnd,
      upsellCommissionVnd: p.upsellCommissionVnd,
      bonusVnd: p.bonusVnd,
      totalEarningsVnd: p.totalEarningsVnd,
      status: p.status,
      notes: p.notes,
    }));

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy bảng lương';
    return err(msg);
  }
}

/**
 * Engine tính toán lương & hoa hồng tự động theo cấp bậc
 */
export async function recalculateStaffPayroll(
  staffId: string,
  month: string, // "2026-11"
): Promise<Result<PayrollItem, string>> {
  try {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr || '2026', 10);
    const m = parseInt(monthStr || '11', 10) - 1;
    const startOfMonth = new Date(year, m, 1);
    const endOfMonth = new Date(year, m + 1, 0, 23, 59, 59);

    // 1. Đếm số ca hoàn thành trong tháng
    const completedCount = await prisma.appointment.count({
      where: {
        therapistId: staffId,
        status: 'COMPLETED',
        startAt: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    // 2. Tổng hoa hồng bán chéo sản phẩm (upsell) từ các hóa đơn đã thanh toán
    const upsellInvoices = await prisma.invoice.findMany({
      where: {
        upsellTherapistId: staffId,
        status: 'PAID',
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { upsellCommissionVnd: true },
    });

    const totalUpsellCommission = upsellInvoices.reduce(
      (sum, inv) => sum + (inv.upsellCommissionVnd || 0),
      0,
    );

    // 3. Quy chuẩn cấp bậc KTV
    let tierLevel = 'SENIOR';
    let baseSalary = 8500000;
    let allowancePerSession = 50000;

    const existingPayroll = await prisma.staffPayroll.findUnique({
      where: { staffId_month: { staffId, month } },
    });

    if (existingPayroll?.tierLevel) {
      tierLevel = existingPayroll.tierLevel;
      if (tierLevel === 'MASTER') {
        baseSalary = 11000000;
        allowancePerSession = 60000;
      } else if (tierLevel === 'JUNIOR') {
        baseSalary = 6500000;
        allowancePerSession = 40000;
      }
    }

    const sessionAllowance = completedCount * allowancePerSession;
    const tipAmount = existingPayroll?.tipAmountVnd || 0;
    const bonus = completedCount >= 30 ? 500000 : 0;
    const totalEarnings = baseSalary + sessionAllowance + totalUpsellCommission + tipAmount + bonus;

    const updated = await prisma.staffPayroll.upsert({
      where: { staffId_month: { staffId, month } },
      update: {
        completedSessions: completedCount,
        sessionAllowanceVnd: sessionAllowance,
        upsellCommissionVnd: totalUpsellCommission,
        bonusVnd: bonus,
        totalEarningsVnd: totalEarnings,
      },
      create: {
        staffId,
        month,
        tierLevel,
        baseSalaryVnd: baseSalary,
        completedSessions: completedCount,
        sessionAllowanceVnd: sessionAllowance,
        tipAmountVnd: tipAmount,
        upsellCommissionVnd: totalUpsellCommission,
        bonusVnd: bonus,
        totalEarningsVnd: totalEarnings,
        status: 'DRAFT',
      },
      include: { staff: { select: { name: true } } },
    });

    return ok({
      id: updated.id,
      staffId: updated.staffId,
      staffName: updated.staff.name,
      month: updated.month,
      tierLevel: updated.tierLevel,
      baseSalaryVnd: updated.baseSalaryVnd,
      completedSessions: updated.completedSessions,
      sessionAllowanceVnd: updated.sessionAllowanceVnd,
      tipAmountVnd: updated.tipAmountVnd,
      upsellCommissionVnd: updated.upsellCommissionVnd,
      bonusVnd: updated.bonusVnd,
      totalEarningsVnd: updated.totalEarningsVnd,
      status: updated.status,
      notes: updated.notes,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi tính bảng lương';
    return err(msg);
  }
}

/**
 * Đặt lại mật khẩu tạm thời cho nhân sự (Ẩn hoàn toàn mật khẩu gốc, cấp mật khẩu tạm ngẫu nhiên)
 */
export async function resetStaffPassword(
  staffId: string,
  actorId: string,
): Promise<Result<{ tempPassword: string; staffName: string }, string>> {
  try {
    const staff = await prisma.user.findUnique({ where: { id: staffId } });
    if (!staff) return err('Không tìm thấy tài khoản nhân sự cần đặt lại mật khẩu.');

    // Sinh mật khẩu ngẫu nhiên tạm thời: MKSpa#XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const tempPassword = `MKSpa#Temp${randomSuffix}`;

    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id: staffId },
      data: { passwordHash },
    });

    // Ghi nhận AuditLog bảo mật
    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'RESET_PASSWORD',
        targetType: 'USER',
        targetId: staffId,
        metadata: JSON.stringify({
          staffEmail: staff.email,
          resetAt: new Date().toISOString(),
        }),
      },
    });

    return ok({ tempPassword, staffName: staff.name });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi đặt lại mật khẩu nhân viên';
    return err(msg);
  }
}
