import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface CreateServiceInput {
  slug: string;
  name: string;
  description: string;
  durationMin: number;
  sessionsRecommended: number;
  priceVnd: number;
  productSlugs?: string[];
}

export async function createService(
  input: CreateServiceInput,
): Promise<Result<{ slug: string }, string>> {
  if (!input.slug || !input.name || !input.description) {
    return err('Vui lòng điền đầy đủ mã slug, tên và mô tả dịch vụ.');
  }

  const existing = await prisma.service.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    return err(`Mã dịch vụ "${input.slug}" đã tồn tại.`);
  }

  try {
    const service = await prisma.service.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        durationMin: input.durationMin || 60,
        sessionsRecommended: input.sessionsRecommended || 6,
        priceVnd: input.priceVnd || 0,
        serviceProducts: input.productSlugs
          ? {
              create: input.productSlugs.map((pSlug) => ({
                productSlug: pSlug,
              })),
            }
          : undefined,
      },
    });

    return ok({ slug: service.slug });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể tạo dịch vụ: ${msg}`);
  }
}

export async function deleteService(slug: string): Promise<Result<{ message: string }, string>> {
  const service = await prisma.service.findUnique({
    where: { slug },
  });
  if (!service) {
    return err('Dịch vụ không tồn tại.');
  }

  // RÀNG BUỘC TOÀN VẸN: Kiểm tra nếu dịch vụ đang có phác đồ hoạt động
  const activePlansCount = await prisma.treatmentPlan.count({
    where: { serviceSlug: slug },
  });

  if (activePlansCount > 0) {
    return err(
      `Không thể xóa dịch vụ "${service.name}" vì đang có ${activePlansCount} phác đồ điều trị hoạt động liên kết.`,
    );
  }

  try {
    await prisma.service.delete({
      where: { slug },
    });
    return ok({ message: `Đã xóa dịch vụ "${service.name}" thành công.` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cơ sở dữ liệu';
    return err(`Không thể xóa dịch vụ: ${msg}`);
  }
}
