import { Result, ok } from '@/domain/shared/result';
import {
  RecommendationInput,
  RecommendationCatalog,
  Recommendation,
  RecommendError,
  Severity,
} from './types';

export function recommend(
  input: RecommendationInput,
  catalog: RecommendationCatalog,
): Result<Recommendation[], RecommendError> {
  // 1. Chuẩn hóa đầu vào (khử trùng concernSlug, lấy severity cao nhất nếu trùng)
  const normalizedScores = new Map<string, Severity>();
  for (const item of input.scores) {
    const clampedSeverity = Math.max(1, Math.min(5, item.severity)) as Severity;
    const existing = normalizedScores.get(item.concernSlug);
    if (!existing || clampedSeverity > existing) {
      normalizedScores.set(item.concernSlug, clampedSeverity);
    }
  }

  // 2. Thu thập danh sách chống chỉ định từ hồ sơ an toàn
  const userFlags = new Set(input.safety.flags);
  const blockedServices = new Set<string>();
  const blockedProducts = new Set<string>();
  const safetyWarnings: string[] = [];
  let requiresStaffReview = false;

  for (const ci of catalog.contraindications) {
    if (userFlags.has(ci.flag)) {
      ci.blocksServiceSlugs.forEach((s) => blockedServices.add(s));
      ci.blocksProductSlugs.forEach((p) => blockedProducts.add(p));
      if (ci.requiresStaffReview) {
        requiresStaffReview = true;
      }
      safetyWarnings.push(ci.message);
    }
  }

  // 3. Lọc luật active và severity thỏa mãn
  type ServiceAccumulator = {
    serviceSlug: string;
    productSlugs: Set<string>;
    score: number;
    reasons: Array<{ ruleId: string; text: string }>;
  };

  const serviceMap = new Map<string, ServiceAccumulator>();

  for (const rule of catalog.rules) {
    if (!rule.active) continue;

    const userSeverity = normalizedScores.get(rule.concernSlug);
    if (userSeverity === undefined || userSeverity < rule.minSeverity) {
      continue;
    }

    // Nếu dịch vụ bị chống chỉ định chặn hoàn toàn -> bỏ qua
    if (blockedServices.has(rule.serviceSlug)) {
      continue;
    }

    let acc = serviceMap.get(rule.serviceSlug);
    if (!acc) {
      acc = {
        serviceSlug: rule.serviceSlug,
        productSlugs: new Set<string>(),
        score: 0,
        reasons: [],
      };
      serviceMap.set(rule.serviceSlug, acc);
    }

    // Tính điểm: score = priority * 10 + severity * 2
    acc.score += rule.priority * 10 + userSeverity * 2;
    acc.reasons.push({ ruleId: rule.id, text: rule.rationale });

    // Gộp sản phẩm đi kèm, loại bỏ sản phẩm bị chống chỉ định
    for (const prod of rule.productSlugs) {
      if (!blockedProducts.has(prod)) {
        acc.productSlugs.add(prod);
      }
    }
  }

  // 4. Chuyển đổi và sắp xếp kết quả tất định
  const recommendations: Recommendation[] = Array.from(serviceMap.values())
    .map((acc) => ({
      serviceSlug: acc.serviceSlug,
      productSlugs: Array.from(acc.productSlugs).sort(),
      score: acc.score,
      reasons: acc.reasons,
      warnings: safetyWarnings,
      requiresStaffReview,
    }))
    .sort((a, b) => {
      // Ưu tiên điểm cao hơn, nếu bằng điểm sắp xếp theo thứ tự bảng chữ cái slug
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.serviceSlug.localeCompare(b.serviceSlug);
    })
    .slice(0, 3); // Tối đa 3 gợi ý tốt nhất

  return ok(recommendations);
}
