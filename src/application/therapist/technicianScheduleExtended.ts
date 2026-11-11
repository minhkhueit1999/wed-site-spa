import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface TodayShiftInfo {
  shiftType: string;
  startTime: string;
  endTime: string;
  notes?: string | null;
  status: string;
}

export interface TechnicianMobileAppointment {
  id: string;
  planId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  customerLoyaltyTier: string;
  serviceName: string;
  serviceSlug: string;
  durationMin: number;
  startAt: string;
  endAt: string;
  room: string;
  status: string; // SCHEDULED, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED
  notes?: string | null;
  safetyFlags: string[];
  medicalNotes?: string | null;
  hasSessionLog: boolean;
}

export interface TechnicianScheduleMobileData {
  therapistId: string;
  therapistName: string;
  todayShift: TodayShiftInfo | null;
  appointments: TechnicianMobileAppointment[];
  stats: {
    totalToday: number;
    completedToday: number;
    inProgressId: string | null;
    nextAppointmentTime: string | null;
  };
}

/**
 * Lấy toàn bộ lịch làm việc và danh sách khách hàng trong ngày của KTV (Tối ưu 100% cho Mobile)
 */
export async function getTechnicianMobileSchedule(
  therapistId: string,
): Promise<Result<TechnicianScheduleMobileData, string>> {
  try {
    const therapist = await prisma.user.findUnique({
      where: { id: therapistId },
      select: { id: true, name: true, role: true },
    });
    if (!therapist || (therapist.role !== 'THERAPIST' && therapist.role !== 'ADMIN')) {
      return err('Chỉ kỹ thuật viên mới có quyền truy cập.');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Ca trực hôm nay
    const shift = await prisma.staffShift.findFirst({
      where: {
        staffId: therapistId,
        date: { gte: todayStart, lte: todayEnd },
      },
    });

    const todayShift: TodayShiftInfo | null = shift
      ? {
          shiftType: shift.shiftType,
          startTime: shift.startTime,
          endTime: shift.endTime,
          notes: shift.notes,
          status: shift.status,
        }
      : null;

    // 2. Lịch hẹn của KTV hôm nay
    const appointments = await prisma.appointment.findMany({
      where: {
        therapistId,
        startAt: { gte: todayStart, lte: todayEnd },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      include: {
        sessionLog: { select: { id: true } },
        plan: {
          include: {
            service: { select: { slug: true, name: true, durationMin: true } },
            customer: {
              include: {
                user: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { startAt: 'asc' },
    });

    let inProgressId: string | null = null;
    let nextAppointmentTime: string | null = null;
    const now = new Date();

    const mappedAppointments: TechnicianMobileAppointment[] = appointments.map((apt) => {
      let flags: string[] = [];
      try {
        flags = JSON.parse(apt.plan.customer.safetyFlags);
      } catch {
        flags = [];
      }

      if (apt.status === 'IN_PROGRESS') {
        inProgressId = apt.id;
      }
      if (!nextAppointmentTime && apt.startAt > now && apt.status !== 'COMPLETED') {
        nextAppointmentTime = apt.startAt.toISOString();
      }

      return {
        id: apt.id,
        planId: apt.planId,
        customerId: apt.plan.customerId,
        customerName: apt.plan.customer.user.name,
        customerPhone: apt.plan.customer.phone,
        customerLoyaltyTier: apt.plan.customer.loyaltyTier,
        serviceName: apt.plan.service.name,
        serviceSlug: apt.plan.service.slug,
        durationMin: apt.plan.service.durationMin,
        startAt: apt.startAt.toISOString(),
        endAt: apt.endAt.toISOString(),
        room: apt.room,
        status: apt.status,
        notes: apt.notes,
        safetyFlags: flags,
        medicalNotes: apt.plan.customer.medicalNotes,
        hasSessionLog: Boolean(apt.sessionLog),
      };
    });

    const completedToday = mappedAppointments.filter((a) => a.status === 'COMPLETED').length;

    return ok({
      therapistId: therapist.id,
      therapistName: therapist.name,
      todayShift,
      appointments: mappedAppointments,
      stats: {
        totalToday: mappedAppointments.length,
        completedToday,
        inProgressId,
        nextAppointmentTime,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy lịch KTV mobile';
    return err(msg);
  }
}
