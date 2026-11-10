export type Severity = 1 | 2 | 3 | 4 | 5;

export interface ConcernScore {
  concernSlug: string;
  severity: Severity;
}

export interface SafetyProfile {
  flags: ReadonlyArray<string>;
}

export interface Rule {
  id: string;
  concernSlug: string;
  minSeverity: Severity;
  serviceSlug: string;
  productSlugs: ReadonlyArray<string>;
  priority: number;
  rationale: string;
  active: boolean;
}

export interface Contraindication {
  flag: string;
  blocksServiceSlugs: ReadonlyArray<string>;
  blocksProductSlugs: ReadonlyArray<string>;
  requiresStaffReview: boolean;
  message: string;
}

export interface RecommendationReason {
  ruleId: string;
  text: string;
}

export interface Recommendation {
  serviceSlug: string;
  productSlugs: string[];
  score: number;
  reasons: RecommendationReason[];
  warnings: string[];
  requiresStaffReview: boolean;
}

export interface RecommendationInput {
  scores: ReadonlyArray<ConcernScore>;
  safety: SafetyProfile;
}

export interface RecommendationCatalog {
  rules: ReadonlyArray<Rule>;
  contraindications: ReadonlyArray<Contraindication>;
  serviceProductMap?: ReadonlyMap<string, ReadonlyArray<string>>;
}

export type RecommendError =
  { code: 'EMPTY_INPUT'; message: string } | { code: 'INVALID_SCORE'; message: string };
