import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface CreateProductInput {
  slug: string;
  name: string;
  description: string;
  usageGuide: string;
  priceVnd: number;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Result<{ slug: string }, string>> {
  if (!input.slug || !input.name || !input.description || !input.usageGuide) {
    return err('Vui lòng điền đầy đủ mã slug, tên, mô tả và hướng dẫn sử dụng sản phẩm.');
  }

  const existing = await prisma.product.findUnique({
    where: { slug: input.slug },
  });
  if (existing) {
    return err(`Mã sản phẩm "${input.slug}" đã tồn tại.`);
  }

  try {
    const product = await prisma.product.create({
      data: {
        slug: input.slug,
        name: input.name,
        description: input.description,
        usageGuide: input.usageGuide,
        priceVnd: input.priceVnd || 0,
      },
    });

    return ok({ slug: product.slug });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể tạo sản phẩm: ${msg}`);
  }
}

export async function deleteProduct(slug: string): Promise<Result<{ message: string }, string>> {
  const product = await prisma.product.findUnique({
    where: { slug },
  });
  if (!product) {
    return err('Sản phẩm không tồn tại.');
  }

  // Kiểm tra nếu sản phẩm đang được kê trong toa
  const prescriptionsCount = await prisma.homeCarePrescription.count({
    where: { productSlug: slug },
  });

  if (prescriptionsCount > 0) {
    return err(
      `Không thể xóa sản phẩm "${product.name}" vì đang có ${prescriptionsCount} toa chăm sóc khách hàng đang sử dụng.`,
    );
  }

  try {
    await prisma.product.delete({
      where: { slug },
    });
    return ok({ message: `Đã xóa sản phẩm "${product.name}" thành công.` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cơ sở dữ liệu';
    return err(`Không thể xóa sản phẩm: ${msg}`);
  }
}
