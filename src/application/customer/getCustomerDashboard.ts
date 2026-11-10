import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';
import { STATE_PRESENTATIONS, StatePresentation } from '@/domain/lifecycle/presentation';
import { PlanState } from '@/domain/lifecycle/types';

export interface ProgressMetricPoint {
  sessionNumber: number;
  date: string;
  notes?: string;
  scores: Record<string, number>;
}

export interface CustomerDashboardData {
  user: {
    id: string;
    name: string;
    email: string;
    consentAt: string | null;
  };
  activePlan: {
    id: string;
    serviceName: string;
    serviceDescription: string;
    totalSessions: number;
    completedSessions: number;
    progressPercent: number;
    state: PlanState;
    statePresentation: StatePresentation;
    nextAction: string;
    prescriptions: Array<{
      id: string;
      productName: string;
      productSlug: string;
      instructions: string;
      frequency: string;
      startDate: string;
    }>;
    stateHistory: Array<{
      id: string;
      from: string;
      to: string;
      event: string;
      reason: string | null;
      at: string;
    }>;
    appointments: Array<{
      id: string;
      therapistName: string;
      startAt: string;
      endAt: string;
      status: string;
      sessionLog?: {
        notes: string;
        adjustments: string | null;
        nextSessionAdvice: string | null;
        progressScores: Record<string, number>;
      };
    }>;
    progressMetrics: ProgressMetricPoint[];
  } | null;
  allPlans: Array<{
    id: string;
    serviceName: string;
    state: PlanState;
    stateLabel: string;
    createdAt: string;
  }>;
}

export async function getCustomerDashboard(
  userId: string,
): Promise<Result<CustomerDashboardData, string>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
    },
  });

  if (!user || !user.profile) {
    return err('Không tìm thấy tài khoản hoặc hồ sơ khách hàng.');
  }

  // Lấy toàn bộ phác đồ của khách hàng, sắp xếp mới nhất lên đầu
  const plans = await prisma.treatmentPlan.findMany({
    where: { customerId: user.profile.id },
    include: {
      service: true,
      stateHistory: {
        orderBy: { at: 'asc' },
      },
      appointments: {
        include: {
          therapist: { select: { id: true, name: true } },
          sessionLog: true,
        },
        orderBy: { startAt: 'asc' },
      },
      prescriptions: {
        include: { product: true },
        orderBy: { startDate: 'desc' },
      },
      careBundles: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const activePlanRecord = plans[0] || null;

  let activePlan: CustomerDashboardData['activePlan'] = null;

  if (activePlanRecord) {
    const completedSessions = activePlanRecord.appointments.filter(
      (a) => a.status === 'COMPLETED' || a.sessionLog !== null,
    ).length;

    const totalSessions = activePlanRecord.totalSessions || 6;
    const progressPercent = Math.min(100, Math.round((completedSessions / totalSessions) * 100));

    const stateKey = (
      STATE_PRESENTATIONS[activePlanRecord.state as PlanState] ? activePlanRecord.state : 'ASSESSED'
    ) as PlanState;

    const statePresentation = STATE_PRESENTATIONS[stateKey];

    // Trích xuất chỉ số tiến triển từ nhật ký các buổi (SessionLog)
    const progressMetrics: ProgressMetricPoint[] = [];
    let sessionIdx = 1;

    for (const apt of activePlanRecord.appointments) {
      if (apt.sessionLog) {
        let scores: Record<string, number> = {};
        try {
          scores = JSON.parse(apt.sessionLog.progressScores || '{}');
        } catch {
          scores = {};
        }

        progressMetrics.push({
          sessionNumber: sessionIdx++,
          date: apt.startAt.toISOString(),
          notes: apt.sessionLog.notes,
          scores,
        });
      }
    }

    activePlan = {
      id: activePlanRecord.id,
      serviceName: activePlanRecord.service.name,
      serviceDescription: activePlanRecord.service.description,
      totalSessions,
      completedSessions,
      progressPercent,
      state: stateKey,
      statePresentation,
      nextAction: statePresentation.nextAction.CUSTOMER,
      prescriptions: activePlanRecord.prescriptions.map((p) => ({
        id: p.id,
        productName: p.product.name,
        productSlug: p.product.slug,
        instructions: p.instructions,
        frequency: p.frequency,
        startDate: p.startDate.toISOString(),
      })),
      stateHistory: activePlanRecord.stateHistory.map((h) => ({
        id: h.id,
        from: h.from,
        to: h.to,
        event: h.event,
        reason: h.reason,
        at: h.at.toISOString(),
      })),
      appointments: activePlanRecord.appointments.map((a) => {
        let parsedScores: Record<string, number> = {};
        if (a.sessionLog?.progressScores) {
          try {
            parsedScores = JSON.parse(a.sessionLog.progressScores);
          } catch {
            parsedScores = {};
          }
        }

        return {
          id: a.id,
          therapistName: a.therapist.name,
          startAt: a.startAt.toISOString(),
          endAt: a.endAt.toISOString(),
          status: a.status,
          sessionLog: a.sessionLog
            ? {
                notes: a.sessionLog.notes,
                adjustments: a.sessionLog.adjustments,
                nextSessionAdvice: a.sessionLog.nextSessionAdvice,
                progressScores: parsedScores,
              }
            : undefined,
        };
      }),
      progressMetrics,
    };
  }

  return ok({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      consentAt: user.profile.consentAt ? user.profile.consentAt.toISOString() : null,
    },
    activePlan,
    allPlans: plans.map((p) => {
      const pState = (
        STATE_PRESENTATIONS[p.state as PlanState] ? p.state : 'ASSESSED'
      ) as PlanState;
      return {
        id: p.id,
        serviceName: p.service.name,
        state: pState,
        stateLabel: STATE_PRESENTATIONS[pState].label,
        createdAt: p.createdAt.toISOString(),
      };
    }),
  });
}
