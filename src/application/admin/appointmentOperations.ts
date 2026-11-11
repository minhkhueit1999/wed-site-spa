import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface CalendarAppointmentItem {
  id: string;
  planId: string;
  serviceSlug: string;
  serviceName: string;
  durationMin: number;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  loyaltyTier: string;
  therapistId: string;
  therapistName: string;
  startAt: string;
  endAt: string;
  room: string;
  status: string;
  notes?: string | null;
  hasSessionLog: boolean;
}

export interface CreateAppointmentInput {
  customerId: string;
  serviceSlug: string;
  therapistId: string;
  startAt: Date;
  room?: string;
  notes?: string;
}

export interface UpdateAppointmentInput {
  id: string;
  therapistId?: string;
  startAt?: Date;
  endAt?: Date;
  room?: string;
  status?: string;
  notes?: string;
}

/**
 * Lấy danh sách lịch hẹn trong khoảng thời gian (dùng cho Dispatch Calendar PC)
 */
export async function getCalendarAppointments(
  startDate: Date,
  endDate: Date,
): Promise<Result<CalendarAppointmentItem[], string>> {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        startAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        therapist: { select: { id: true, name: true } },
        sessionLog: { select: { id: true } },
        plan: {
          include: {
            service: { select: { slug: true, name: true, durationMin: true } },
            customer: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: { startAt: 'asc' },
    });

    const items: CalendarAppointmentItem[] = appointments.map((apt) => ({
      id: apt.id,
      planId: apt.planId,
      serviceSlug: apt.plan.service.slug,
      serviceName: apt.plan.service.name,
      durationMin: apt.plan.service.durationMin,
      customerId: apt.plan.customerId,
      customerName: apt.plan.customer.user.name,
      customerPhone: apt.plan.customer.phone,
      loyaltyTier: apt.plan.customer.loyaltyTier,
      therapistId: apt.therapistId,
      therapistName: apt.therapist.name,
      startAt: apt.startAt.toISOString(),
      endAt: apt.endAt.toISOString(),
      room: apt.room,
      status: apt.status,
      notes: apt.notes,
      hasSessionLog: Boolean(apt.sessionLog),
    }));

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy lịch hẹn calendar';
    return err(msg);
  }
}

/**
 * Tạo lịch hẹn mới với Transaction và xử lý Race Condition (Chống trùng giờ KTV)
 */
export async function createAdminAppointment(
  input: CreateAppointmentInput,
): Promise<Result<CalendarAppointmentItem, string>> {
  try {
    const service = await prisma.service.findUnique({
      where: { slug: input.serviceSlug },
    });
    if (!service) return err('Dịch vụ không tồn tại.');

    const startAt = new Date(input.startAt);
    const endAt = new Date(startAt.getTime() + service.durationMin * 60 * 1000);

    return await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra xung đột lịch của KTV (Race Condition Shield)
      const conflict = await tx.appointment.findFirst({
        where: {
          therapistId: input.therapistId,
          status: { notIn: ['CANCELLED', 'NO_SHOW'] },
          AND: [{ startAt: { lt: endAt } }, { endAt: { gt: startAt } }],
        },
      });

      if (conflict) {
        return err(
          'Kỹ thuật viên đã có lịch trùng trong khung giờ này. Vui lòng chọn giờ hoặc KTV khác.',
        );
      }

      // 2. Tìm hoặc tạo TreatmentPlan phù hợp cho khách hàng
      let plan = await tx.treatmentPlan.findFirst({
        where: {
          customerId: input.customerId,
          serviceSlug: input.serviceSlug,
          state: { in: ['IN_TREATMENT', 'BUNDLE_CONFIRMED', 'RECOMMENDED'] },
        },
      });

      if (!plan) {
        plan = await tx.treatmentPlan.create({
          data: {
            customerId: input.customerId,
            serviceSlug: input.serviceSlug,
            totalSessions: service.sessionsRecommended || 6,
            state: 'IN_TREATMENT',
          },
        });
      }

      // 3. Tạo lịch hẹn
      const newApt = await tx.appointment.create({
        data: {
          planId: plan.id,
          therapistId: input.therapistId,
          startAt,
          endAt,
          room: input.room || 'Phòng VIP Thảo Mộc',
          status: 'SCHEDULED',
          notes: input.notes || null,
        },
        include: {
          therapist: { select: { id: true, name: true } },
          sessionLog: { select: { id: true } },
          plan: {
            include: {
              service: { select: { slug: true, name: true, durationMin: true } },
              customer: {
                include: {
                  user: { select: { name: true, email: true } },
                },
              },
            },
          },
        },
      });

      return ok({
        id: newApt.id,
        planId: newApt.planId,
        serviceSlug: newApt.plan.service.slug,
        serviceName: newApt.plan.service.name,
        durationMin: newApt.plan.service.durationMin,
        customerId: newApt.plan.customerId,
        customerName: newApt.plan.customer.user.name,
        customerPhone: newApt.plan.customer.phone,
        loyaltyTier: newApt.plan.customer.loyaltyTier,
        therapistId: newApt.therapistId,
        therapistName: newApt.therapist.name,
        startAt: newApt.startAt.toISOString(),
        endAt: newApt.endAt.toISOString(),
        room: newApt.room,
        status: newApt.status,
        notes: newApt.notes,
        hasSessionLog: false,
      });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi tạo lịch hẹn';
    return err(msg);
  }
}

/**
 * Cập nhật thông tin lịch hẹn (Đổi giờ, kéo thả sang KTV khác, đổi trạng thái)
 */
export async function updateAdminAppointment(
  input: UpdateAppointmentInput,
): Promise<Result<{ success: boolean; message: string }, string>> {
  try {
    const existing = await prisma.appointment.findUnique({
      where: { id: input.id },
      include: { plan: { include: { service: true } } },
    });
    if (!existing) return err('Lịch hẹn không tồn tại.');

    const targetTherapistId = input.therapistId || existing.therapistId;
    const targetStartAt = input.startAt ? new Date(input.startAt) : existing.startAt;
    const durationMs = existing.plan.service.durationMin * 60 * 1000;
    const targetEndAt = input.endAt
      ? new Date(input.endAt)
      : new Date(targetStartAt.getTime() + durationMs);

    return await prisma.$transaction(async (tx) => {
      // Kiểm tra trùng lịch nếu có đổi giờ hoặc đổi KTV
      if (input.startAt || input.therapistId) {
        const conflict = await tx.appointment.findFirst({
          where: {
            id: { not: input.id },
            therapistId: targetTherapistId,
            status: { notIn: ['CANCELLED', 'NO_SHOW'] },
            AND: [{ startAt: { lt: targetEndAt } }, { endAt: { gt: targetStartAt } }],
          },
        });

        if (conflict) {
          return err(
            'Kỹ thuật viên đã bận vào khung giờ này. Thao tác điều chuyển không thực hiện được.',
          );
        }
      }

      await tx.appointment.update({
        where: { id: input.id },
        data: {
          therapistId: targetTherapistId,
          startAt: targetStartAt,
          endAt: targetEndAt,
          room: input.room ?? existing.room,
          status: input.status ?? existing.status,
          notes: input.notes !== undefined ? input.notes : existing.notes,
        },
      });

      return ok({ success: true, message: 'Đã cập nhật lịch hẹn thành công.' });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cập nhật lịch hẹn';
    return err(msg);
  }
}

/**
 * Hủy lịch hẹn
 */
export async function cancelAdminAppointment(
  id: string,
  reason: string,
): Promise<Result<{ success: boolean }, string>> {
  try {
    await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: reason ? `[Đã hủy]: ${reason}` : '[Đã hủy bởi quản trị viên]',
      },
    });
    return ok({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hủy lịch hẹn';
    return err(msg);
  }
}
