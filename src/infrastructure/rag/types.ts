export type KnowledgeType = 'service' | 'product' | 'concern' | 'faq' | 'policy';

export interface KnowledgeFrontmatter {
  title: string;
  type: KnowledgeType | string;
  slug: string;
  reviewedBy: string;
  updatedAt: string;
}

export interface KnowledgeDocument extends KnowledgeFrontmatter {
  content: string;
  filePath: string;
}

export interface KnowledgeChunkData {
  id?: string;
  slug: string;
  title: string;
  type: string;
  headingPath: string;
  text: string;
  embedding?: number[];
  reviewedBy: string;
  updatedAt?: Date;
}

export interface Citation {
  title: string;
  slug: string;
  headingPath?: string;
}

export interface SearchResult extends KnowledgeChunkData {
  score: number;
}

export interface RAGSafetyCheckResult {
  safe: boolean;
  type?: 'RED_FLAG' | 'PROMPT_INJECTION';
  response?: string;
}

export interface RAGResponse {
  answer: string;
  sources: Citation[];
  usedFallback: boolean;
  safetyNotice?: string;
}

export interface AnswerOptions {
  question: string;
  context?: {
    serviceSlug?: string;
    productSlugs?: string[];
    safetyFlags?: string[];
    currentStatus?: string;
  };
}
