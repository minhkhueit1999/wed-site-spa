import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';
import { recommend } from '@/domain/recommendation/recommend';
import {
  ConcernScore,
  Rule,
  Contraindication,
  Recommendation,
  Severity,
} from '@/domain/recommendation/types';

export interface SimulateRulesInput {
  concernScores: ConcernScore[];
  safetyFlags?: string[];
}

export interface RuleSimulationOutput {
  recommendations: Recommendation[];
  appliedRulesCount: number;
  totalActiveRules: number;
}

export async function simulateRules(
  input: SimulateRulesInput,
): Promise<Result<RuleSimulationOutput, string>> {
  if (!input.concernScores || input.concernScores.length === 0) {
    return err('Cần cung cấp ít nhất một điểm số triệu chứng để mô phỏng luật.');
  }

  try {
    const rawRules = await prisma.rule.findMany({
      where: { active: true },
    });

    const rawContraindications = await prisma.contraindication.findMany();

    const rules: Rule[] = rawRules.map((r) => ({
      id: r.id,
      concernSlug: r.concernSlug,
      minSeverity: r.minSeverity as Severity,
      serviceSlug: r.serviceSlug,
      productSlugs: JSON.parse(r.productSlugs || '[]'),
      priority: r.priority,
      rationale: r.rationale,
      active: r.active,
    }));

    const contraindications: Contraindication[] = rawContraindications.map((c) => ({
      flag: c.flag,
      blocksServiceSlugs: JSON.parse(c.blocksServiceSlugs || '[]'),
      blocksProductSlugs: JSON.parse(c.blocksProductSlugs || '[]'),
      requiresStaffReview: c.requiresStaffReview,
      message: c.message,
    }));

    const recommendationResult = recommend(
      {
        scores: input.concernScores,
        safety: { flags: input.safetyFlags || [] },
      },
      {
        rules,
        contraindications,
      },
    );

    if (!recommendationResult.ok) {
      return ok({
        recommendations: [],
        appliedRulesCount: 0,
        totalActiveRules: rules.length,
      });
    }

    const recommendations = recommendationResult.value;

    return ok({
      recommendations,
      appliedRulesCount: recommendations.length,
      totalActiveRules: rules.length,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Lỗi mô phỏng luật: ${msg}`);
  }
}
