import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';
import { transition } from '@/domain/lifecycle/transition';
import { PlanState } from '@/domain/lifecycle/types';

export interface FinishSessionsInput {
  planId: string;
  therapistId: string;
  notes?: string;
}

export async function finishSessions(
  input: FinishSessionsInput,
): Promise<Result<{ nextState: string }, string>> {
  const therapist = await prisma.user.findUnique({
    where: { id: input.therapistId },
  });

  if (!therapist || (therapist.role !== 'THERAPIST' && therapist.role !== 'ADMIN')) {
    return err('Chỉ kỹ thuật viên hoặc quản trị viên mới có quyền kết thúc chuỗi buổi trị liệu.');
  }

  const plan = await prisma.treatmentPlan.findUnique({
    where: { id: input.planId },
    include: {
      appointments: {
        include: { sessionLog: true },
      },
      prescriptions: true,
    },
  });

  if (!plan) {
    return err('Không tìm thấy phác đồ điều trị.');
  }

  const completedSessions = plan.appointments.filter(
    (a) => a.status === 'COMPLETED' || a.sessionLog !== null,
  ).length;

  const totalSessions = plan.totalSessions;
  const hasPrescription = plan.prescriptions.length > 0;

  // Gọi domain state machine transition
  const tRes = transition(plan.state as PlanState, 'FINISH_SESSIONS', {
    actorRole: 'THERAPIST',
    actorId: input.therapistId,
    completedSessions,
    totalSessions,
    hasPrescription,
  });

  if (!tRes.ok) {
    return err(tRes.error.message);
  }

  const nextState = tRes.value.next;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.treatmentPlan.update({
        where: { id: plan.id },
        data: { state: nextState },
      });

      await tx.planStateHistory.create({
        data: {
          planId: plan.id,
          from: plan.state,
          event: 'FINISH_SESSIONS',
          to: nextState,
          actorId: input.therapistId,
          reason:
            input.notes?.trim() ||
            'Hoàn tất các buổi trị liệu tại spa; chuyển sang giai đoạn dưỡng tại nhà.',
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: input.therapistId,
          action: 'FINISH_SESSIONS',
          targetType: 'TREATMENT_PLAN',
          targetId: plan.id,
          metadata: JSON.stringify({ completedSessions, totalSessions }),
        },
      });
    });

    return ok({ nextState });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cơ sở dữ liệu';
    return err(`Không thể kết thúc chuỗi buổi trị liệu: ${msg}`);
  }
}
