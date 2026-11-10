import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface CreateRuleInput {
  id: string; // R-001, R-002...
  concernSlug: string;
  minSeverity: number;
  serviceSlug: string;
  productSlugs: string[];
  priority: number;
  rationale: string;
}

export async function createRule(input: CreateRuleInput): Promise<Result<{ id: string }, string>> {
  if (!input.id || !input.concernSlug || !input.serviceSlug || !input.rationale) {
    return err('Vui lòng điền đầy đủ mã quy tắc, triệu chứng, dịch vụ và giải thích lý do.');
  }

  const existing = await prisma.rule.findUnique({
    where: { id: input.id },
  });
  if (existing) {
    return err(`Mã quy tắc "${input.id}" đã tồn tại.`);
  }

  try {
    const rule = await prisma.rule.create({
      data: {
        id: input.id,
        concernSlug: input.concernSlug,
        minSeverity: input.minSeverity || 2,
        serviceSlug: input.serviceSlug,
        productSlugs: JSON.stringify(input.productSlugs || []),
        priority: input.priority || 1,
        rationale: input.rationale.trim(),
      },
    });

    return ok({ id: rule.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể tạo quy tắc: ${msg}`);
  }
}

export async function deleteRule(id: string): Promise<Result<{ message: string }, string>> {
  try {
    await prisma.rule.delete({ where: { id } });
    return ok({ message: `Đã xóa quy tắc ${id} thành công.` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể xóa quy tắc: ${msg}`);
  }
}
