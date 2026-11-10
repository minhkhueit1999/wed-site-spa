import type { Service, Product } from '@prisma/client';
import { prisma } from '@/infrastructure/db/prisma';
import { recommend } from '@/domain/recommendation/recommend';
import {
  ConcernScore,
  Recommendation,
  Rule,
  Contraindication,
  RecommendationCatalog,
  Severity,
} from '@/domain/recommendation/types';
import { Result, ok } from '@/domain/shared/result';

export interface GenerateRecommendationInput {
  scores: ConcernScore[];
  safetyFlags: string[];
}

export interface DetailedRecommendation extends Recommendation {
  service: Service;
  products: Product[];
}

export async function generateRecommendation(
  input: GenerateRecommendationInput,
): Promise<Result<DetailedRecommendation[], string>> {
  // 1. Tải catalog từ cơ sở dữ liệu
  const dbRules = await prisma.rule.findMany({ where: { active: true } });
  const dbContraindications = await prisma.contraindication.findMany();

  const rules: Rule[] = dbRules.map((r) => ({
    id: r.id,
    concernSlug: r.concernSlug,
    minSeverity: r.minSeverity as Severity,
    serviceSlug: r.serviceSlug,
    productSlugs: JSON.parse(r.productSlugs || '[]'),
    priority: r.priority,
    rationale: r.rationale,
    active: r.active,
  }));

  const contraindications: Contraindication[] = dbContraindications.map((c) => ({
    flag: c.flag,
    blocksServiceSlugs: JSON.parse(c.blocksServiceSlugs || '[]'),
    blocksProductSlugs: JSON.parse(c.blocksProductSlugs || '[]'),
    requiresStaffReview: c.requiresStaffReview,
    message: c.message,
  }));

  const catalog: RecommendationCatalog = {
    rules,
    contraindications,
  };

  // 2. Chạy Rule Engine domain
  const recommendationResult = recommend(
    {
      scores: input.scores,
      safety: { flags: input.safetyFlags },
    },
    catalog,
  );

  if (!recommendationResult.ok) {
    return ok([]);
  }

  const rawRecommendations = recommendationResult.value;
  if (rawRecommendations.length === 0) {
    return ok([]);
  }

  // 3. Nạp thông tin chi tiết dịch vụ và sản phẩm để hiển thị UI
  const serviceSlugs = rawRecommendations.map((r) => r.serviceSlug);
  const allProductSlugs = Array.from(new Set(rawRecommendations.flatMap((r) => r.productSlugs)));

  const [services, products] = await Promise.all([
    prisma.service.findMany({ where: { slug: { in: serviceSlugs } } }),
    prisma.product.findMany({ where: { slug: { in: allProductSlugs } } }),
  ]);

  const serviceMap = new Map(services.map((s) => [s.slug, s]));
  const productMap = new Map(products.map((p) => [p.slug, p]));

  const detailed: DetailedRecommendation[] = [];

  for (const rec of rawRecommendations) {
    const s = serviceMap.get(rec.serviceSlug);
    if (!s) continue;

    const prods: Product[] = [];
    for (const ps of rec.productSlugs) {
      const p = productMap.get(ps);
      if (p) prods.push(p);
    }

    detailed.push({
      ...rec,
      service: s,
      products: prods,
    });
  }

  return ok(detailed);
}
