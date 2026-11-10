import { QUIZ_BRANCHES } from '@/data/quizzes';
import { scoreQuiz } from '@/domain/quiz/score';
import { transition } from '@/domain/lifecycle/transition';
import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';
import { ConcernScore } from '@/domain/recommendation/types';

export interface SubmitAssessmentInput {
  userId?: string;
  branchId: 'skin' | 'stress-sleep' | 'muscle';
  answers: Record<string, string>;
  consentGiven: boolean;
}

export interface SubmitAssessmentResult {
  assessmentId?: string;
  concernScores: ConcernScore[];
  safetyFlags: string[];
}

export async function submitAssessment(
  input: SubmitAssessmentInput,
): Promise<Result<SubmitAssessmentResult, string>> {
  const branch = QUIZ_BRANCHES[input.branchId];
  if (!branch) {
    return err(`Nhánh khảo sát không tồn tại: ${input.branchId}`);
  }

  // 1. Kiểm tra guard thông qua state machine transition
  const transitionCheck = transition('NEW', 'SUBMIT_ASSESSMENT', {
    actorRole: 'CUSTOMER',
    actorId: input.userId || 'guest',
    consentGiven: input.consentGiven,
  });

  if (!transitionCheck.ok) {
    return err(transitionCheck.error.message);
  }

  // 2. Tính điểm và cờ an toàn thông qua Domain Quiz Scorer
  const { concernScores, safetyFlags } = scoreQuiz(input.answers, branch);

  let assessmentId: string | undefined;

  // 3. Nếu người dùng đã đăng nhập, lưu trữ kết quả và cập nhật profile
  if (input.userId) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: input.userId },
    });

    if (profile) {
      const saved = await prisma.assessment.create({
        data: {
          customerId: profile.id,
          type: input.branchId,
          answers: JSON.stringify(input.answers),
          concernScores: JSON.stringify(concernScores),
        },
      });
      assessmentId = saved.id;

      // Hợp nhất cờ an toàn mới vào profile
      const currentFlags: string[] = JSON.parse(profile.safetyFlags || '[]');
      const mergedFlags = Array.from(new Set([...currentFlags, ...safetyFlags]));

      await prisma.customerProfile.update({
        where: { id: profile.id },
        data: {
          safetyFlags: JSON.stringify(mergedFlags),
          consentAt: profile.consentAt || new Date(),
        },
      });
    }
  }

  return ok({
    assessmentId,
    concernScores,
    safetyFlags,
  });
}
