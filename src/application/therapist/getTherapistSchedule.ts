import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';
import { maskEmail } from '@/lib/utils';

export interface TherapistAppointmentItem {
  id: string;
  startAt: string;
  endAt: string;
  status: string;
  customerName: string;
  customerEmail: string;
  serviceName: string;
  planId: string;
  planState: string;
  hasSessionLog: boolean;
  safetyFlagsCount: number;
}

export async function getTherapistSchedule(
  therapistId: string,
): Promise<Result<TherapistAppointmentItem[], string>> {
  const therapist = await prisma.user.findUnique({
    where: { id: therapistId },
  });

  if (!therapist || (therapist.role !== 'THERAPIST' && therapist.role !== 'ADMIN')) {
    return err('Chỉ kỹ thuật viên hoặc quản trị viên mới có quyền truy cập lịch làm việc.');
  }

  const appointments = await prisma.appointment.findMany({
    where: therapist.role === 'ADMIN' ? {} : { therapistId },
    include: {
      plan: {
        include: {
          service: true,
          customer: {
            include: { user: true },
          },
        },
      },
      sessionLog: true,
    },
    orderBy: { startAt: 'asc' },
  });

  return ok(
    appointments.map((apt) => {
      const flags: string[] = JSON.parse(apt.plan.customer.safetyFlags || '[]');
      return {
        id: apt.id,
        startAt: apt.startAt.toISOString(),
        endAt: apt.endAt.toISOString(),
        status: apt.status,
        customerName: apt.plan.customer.user.name,
        customerEmail:
          therapist.role === 'THERAPIST'
            ? maskEmail(apt.plan.customer.user.email)
            : apt.plan.customer.user.email,
        serviceName: apt.plan.service.name,
        planId: apt.plan.id,
        planState: apt.plan.state,
        hasSessionLog: apt.sessionLog !== null,
        safetyFlagsCount: flags.length,
      };
    }),
  );
}

export interface AppointmentDetailData {
  appointment: {
    id: string;
    startAt: string;
    endAt: string;
    status: string;
    sessionLog?: {
      notes: string;
      adjustments: string | null;
      nextSessionAdvice: string | null;
      progressScores: Record<string, number>;
    };
  };
  customer: {
    id: string;
    name: string;
    email: string;
    notes: string | null;
    safetyFlags: string[];
    contraindicationWarnings: string[];
  };
  plan: {
    id: string;
    serviceName: string;
    serviceDescription: string;
    totalSessions: number;
    completedSessions: number;
    state: string;
    prescriptions: Array<{
      id: string;
      productName: string;
      instructions: string;
      frequency: string;
      startDate: string;
    }>;
    pastSessionLogs: Array<{
      id: string;
      date: string;
      notes: string;
      therapistName: string;
    }>;
  };
  availableProducts: Array<{
    slug: string;
    name: string;
    priceVnd: number;
    isBlocked: boolean;
    blockReason?: string;
  }>;
}

export async function getAppointmentDetail(
  appointmentId: string,
  therapistId: string,
): Promise<Result<AppointmentDetailData, string>> {
  const therapist = await prisma.user.findUnique({
    where: { id: therapistId },
  });

  if (!therapist || (therapist.role !== 'THERAPIST' && therapist.role !== 'ADMIN')) {
    return err('Không có quyền truy cập hồ sơ trị liệu.');
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      sessionLog: true,
      plan: {
        include: {
          service: true,
          customer: {
            include: { user: true },
          },
          appointments: {
            include: {
              sessionLog: true,
              therapist: true,
            },
            orderBy: { startAt: 'asc' },
          },
          prescriptions: {
            include: { product: true },
            orderBy: { startDate: 'desc' },
          },
        },
      },
    },
  });

  if (!appointment) {
    return err('Không tìm thấy buổi hẹn trị liệu.');
  }

  const plan = appointment.plan;
  const customerProfile = plan.customer;
  const safetyFlags: string[] = JSON.parse(customerProfile.safetyFlags || '[]');

  // Truy vấn thông tin cảnh báo chống chỉ định đối với khách
  const contraindications = await prisma.contraindication.findMany({
    where: { flag: { in: safetyFlags } },
  });

  const contraindicationWarnings = contraindications.map((c) => c.message);

  const blockedProductsMap = new Map<string, string>();
  for (const c of contraindications) {
    const slugs: string[] = JSON.parse(c.blocksProductSlugs || '[]');
    for (const slug of slugs) {
      blockedProductsMap.set(slug, c.message);
    }
  }

  // Danh sách toàn bộ sản phẩm
  const allProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
  });

  const availableProducts = allProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    priceVnd: p.priceVnd,
    isBlocked: blockedProductsMap.has(p.slug),
    blockReason: blockedProductsMap.get(p.slug),
  }));

  const completedSessions = plan.appointments.filter(
    (a) => a.status === 'COMPLETED' || a.sessionLog !== null,
  ).length;

  let sessionScores: Record<string, number> = {};
  if (appointment.sessionLog?.progressScores) {
    try {
      sessionScores = JSON.parse(appointment.sessionLog.progressScores);
    } catch {
      sessionScores = {};
    }
  }

  return ok({
    appointment: {
      id: appointment.id,
      startAt: appointment.startAt.toISOString(),
      endAt: appointment.endAt.toISOString(),
      status: appointment.status,
      sessionLog: appointment.sessionLog
        ? {
            notes: appointment.sessionLog.notes,
            adjustments: appointment.sessionLog.adjustments,
            nextSessionAdvice: appointment.sessionLog.nextSessionAdvice,
            progressScores: sessionScores,
          }
        : undefined,
    },
    customer: {
      id: customerProfile.id,
      name: customerProfile.user.name,
      email:
        therapist.role === 'THERAPIST'
          ? maskEmail(customerProfile.user.email)
          : customerProfile.user.email,
      notes: customerProfile.notes,
      safetyFlags,
      contraindicationWarnings,
    },
    plan: {
      id: plan.id,
      serviceName: plan.service.name,
      serviceDescription: plan.service.description,
      totalSessions: plan.totalSessions,
      completedSessions,
      state: plan.state,
      prescriptions: plan.prescriptions.map((p) => ({
        id: p.id,
        productName: p.product.name,
        instructions: p.instructions,
        frequency: p.frequency,
        startDate: p.startDate.toISOString(),
      })),
      pastSessionLogs: plan.appointments
        .filter((a) => a.sessionLog && a.id !== appointment.id)
        .map((a) => ({
          id: a.sessionLog!.id,
          date: a.startAt.toISOString(),
          notes: a.sessionLog!.notes,
          therapistName: a.therapist.name,
        })),
    },
    availableProducts,
  });
}
