import { QuizBranch } from '@/data/quizzes';
import { ConcernScore, Severity } from '@/domain/recommendation/types';

export interface QuizScoreResult {
  concernScores: ConcernScore[];
  safetyFlags: string[];
}

export function scoreQuiz(answers: Record<string, string>, branch: QuizBranch): QuizScoreResult {
  const accumulatedWeights = new Map<string, number>();
  const safetyFlagsSet = new Set<string>();

  for (const question of branch.questions) {
    const chosenChoiceId = answers[question.id];
    if (!chosenChoiceId) continue;

    const choice = question.choices.find((c) => c.id === chosenChoiceId);
    if (!choice) continue;

    // Tích lũy trọng số triệu chứng
    for (const [slug, weight] of Object.entries(choice.weights)) {
      const current = accumulatedWeights.get(slug) ?? 0;
      accumulatedWeights.set(slug, current + weight);
    }

    // Ghi nhận cờ an toàn
    if (choice.safetyFlags) {
      for (const flag of choice.safetyFlags) {
        if (flag) safetyFlagsSet.add(flag);
      }
    }
  }

  // Chuyển tổng điểm trọng số thành severity 1-5
  const concernScores: ConcernScore[] = Array.from(accumulatedWeights.entries()).map(
    ([slug, totalWeight]) => {
      // Chuẩn hóa điểm: >= 5 điểm -> severity 5; 4 điểm -> 4; 3 điểm -> 3; 2 điểm -> 2; còn lại 1
      let severity: Severity = 1;
      if (totalWeight >= 5) severity = 5;
      else if (totalWeight >= 4) severity = 4;
      else if (totalWeight >= 3) severity = 3;
      else if (totalWeight >= 2) severity = 2;
      else severity = 1;

      return {
        concernSlug: slug,
        severity,
      };
    },
  );

  return {
    concernScores,
    safetyFlags: Array.from(safetyFlagsSet).sort(),
  };
}
