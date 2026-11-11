import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface MyLeaveRequestItem {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  swapWithStaffName?: string | null;
  status: string; // PENDING, APPROVED, REJECTED
  reviewNote?: string | null;
  createdAt: string;
}

export interface ColleagueTherapistItem {
  id: string;
  name: string;
}

/**
 * Lấy lịch sử đơn xin nghỉ/đổi ca của chính KTV
 */
export async function getMyLeaveRequests(
  therapistId: string,
): Promise<Result<MyLeaveRequestItem[], string>> {
  try {
    const requests = await prisma.leaveRequest.findMany({
      where: { staffId: therapistId },
      orderBy: { createdAt: 'desc' },
    });

    const swapIds = requests.map((r) => r.swapWithStaffId).filter(Boolean) as string[];
    const swapUsers = await prisma.user.findMany({
      where: { id: { in: swapIds } },
      select: { id: true, name: true },
    });
    const swapMap = new Map(swapUsers.map((u) => [u.id, u.name]));

    const items: MyLeaveRequestItem[] = requests.map((r) => ({
      id: r.id,
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
    const msg = error instanceof Error ? error.message : 'Lỗi lấy danh sách đơn KTV';
    return err(msg);
  }
}

/**
 * Lấy danh sách đồng nghiệp KTV để chọn đổi ca
 */
export async function getColleagueTherapists(
  currentTherapistId: string,
): Promise<Result<ColleagueTherapistItem[], string>> {
  try {
    const therapists = await prisma.user.findMany({
      where: {
        role: 'THERAPIST',
        id: { not: currentTherapistId },
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return ok(therapists);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy danh sách đồng nghiệp';
    return err(msg);
  }
}

/**
 * Gửi đơn xin nghỉ phép hoặc đổi ca trực từ điện thoại
 */
export async function submitLeaveOrSwapRequest(input: {
  therapistId: string;
  type: 'SICK' | 'VACATION' | 'PERSONAL' | 'SWAP_SHIFT';
  startDate: Date;
  endDate: Date;
  reason: string;
  swapWithStaffId?: string;
}): Promise<Result<{ requestId: string; message: string }, string>> {
  if (!input.reason.trim()) {
    return err('Vui lòng ghi rõ lý do nghỉ hoặc đổi ca.');
  }

  try {
    const request = await prisma.leaveRequest.create({
      data: {
        staffId: input.therapistId,
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason.trim(),
        swapWithStaffId: input.swapWithStaffId || null,
        status: 'PENDING',
      },
    });

    return ok({
      requestId: request.id,
      message: 'Đơn yêu cầu của bạn đã được gửi tới Quản trị viên để xét duyệt.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi gửi đơn';
    return err(msg);
  }
}
