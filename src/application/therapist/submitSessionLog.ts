import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';
import { transition } from '@/domain/lifecycle/transition';

export interface SubmitSessionLogInput {
  appointmentId: string;
  therapistId: string;
  notes: string;
  progressScores: Record<string, number>;
  adjustments?: string;
  nextSessionAdvice?: string;
}

export async function submitSessionLog(
  input: SubmitSessionLogInput,
): Promise<Result<{ sessionLogId: string; planState: string }, string>> {
  if (!input.notes || input.notes.trim().length < 10) {
    return err('Ghi chú quan sát trị liệu phải có ít nhất 10 ký tự.');
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: input.appointmentId },
    include: {
      plan: true,
      therapist: true,
    },
  });

  if (!appointment) {
    return err('Không tìm thấy thông tin lịch hẹn.');
  }

  const therapist = await prisma.user.findUnique({
    where: { id: input.therapistId },
  });

  if (!therapist || (therapist.role !== 'THERAPIST' && therapist.role !== 'ADMIN')) {
    return err('Chỉ kỹ thuật viên hoặc quản trị viên mới có quyền ghi nhật ký buổi trị liệu.');
  }

  if (appointment.therapistId !== input.therapistId && therapist.role !== 'ADMIN') {
    return err('Bạn không được phân công phụ trách buổi hẹn này.');
  }

  const currentPlan = appointment.plan;

  // Kiểm tra chuyển trạng thái nếu plan đang ở BUNDLE_CONFIRMED
  let nextPlanState = currentPlan.state;
  let shouldTransition = false;

  if (currentPlan.state === 'BUNDLE_CONFIRMED') {
    const tRes = transition('BUNDLE_CONFIRMED', 'COMPLETE_SESSION', {
      actorRole: 'THERAPIST',
      actorId: input.therapistId,
      hasSessionLog: true,
    });

    if (tRes.ok) {
      nextPlanState = tRes.value.next;
      shouldTransition = true;
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Tạo hoặc cập nhật SessionLog
      const log = await tx.sessionLog.upsert({
        where: { appointmentId: input.appointmentId },
        update: {
          notes: input.notes.trim(),
          progressScores: JSON.stringify(input.progressScores),
          adjustments: input.adjustments?.trim() || null,
          nextSessionAdvice: input.nextSessionAdvice?.trim() || null,
          therapistId: input.therapistId,
        },
        create: {
          appointmentId: input.appointmentId,
          therapistId: input.therapistId,
          notes: input.notes.trim(),
          progressScores: JSON.stringify(input.progressScores),
          adjustments: input.adjustments?.trim() || null,
          nextSessionAdvice: input.nextSessionAdvice?.trim() || null,
        },
      });

      // 2. Đánh dấu Appointment thành COMPLETED
      await tx.appointment.update({
        where: { id: input.appointmentId },
        data: { status: 'COMPLETED' },
      });

      // 3. Cập nhật trạng thái Plan nếu chuyển đổi
      if (shouldTransition && nextPlanState !== currentPlan.state) {
        await tx.treatmentPlan.update({
          where: { id: currentPlan.id },
          data: { state: nextPlanState },
        });

        await tx.planStateHistory.create({
          data: {
            planId: currentPlan.id,
            from: currentPlan.state,
            event: 'COMPLETE_SESSION',
            to: nextPlanState,
            actorId: input.therapistId,
            reason: `Kỹ thuật viên hoàn tất buổi trị liệu và ghi nhận SessionLog.`,
          },
        });
      }

      // 4. Ghi AuditLog
      await tx.auditLog.create({
        data: {
          actorId: input.therapistId,
          action: 'UPDATE_SESSION_LOG',
          targetType: 'SESSION_LOG',
          targetId: log.id,
          metadata: JSON.stringify({ appointmentId: input.appointmentId }),
        },
      });

      return {
        sessionLogId: log.id,
        planState: nextPlanState,
      };
    });

    return ok(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cơ sở dữ liệu';
    return err(`Không thể ghi nhật ký buổi trị liệu: ${msg}`);
  }
}
