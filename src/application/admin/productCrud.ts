import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface CreateProductInput {
  slug: string;
  name: string;
  description: string;
  usageGuide: string;
  priceVnd: number;
  imageUrl?: string;
  stockQuantity?: number;
  minStockAlert?: number;
  unit?: string;
  costPriceVnd?: number;
  active?: boolean;
}

export interface UpdateProductInput {
  slug: string;
  name?: string;
  description?: string;
  usageGuide?: string;
  priceVnd?: number;
  imageUrl?: string;
  stockQuantity?: number;
  minStockAlert?: number;
  unit?: string;
  costPriceVnd?: number;
  active?: boolean;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<Result<{ slug: string; name: string }, string>> {
  if (!input.slug?.trim() || !input.name?.trim() || !input.description?.trim()) {
    return err('Vui lòng điền đầy đủ mã slug, tên và mô tả sản phẩm.');
  }

  const slug = input.slug.trim().toLowerCase();

  const existing = await prisma.product.findUnique({
    where: { slug },
  });
  if (existing) {
    return err(`Mã sản phẩm "${slug}" đã tồn tại trong hệ thống.`);
  }

  try {
    const product = await prisma.product.create({
      data: {
        slug,
        name: input.name.trim(),
        description: input.description.trim(),
        usageGuide: input.usageGuide?.trim() || 'Sử dụng theo chỉ định chuyên viên',
        priceVnd: Math.max(0, input.priceVnd || 0),
        costPriceVnd: Math.max(0, input.costPriceVnd || 0),
        stockQuantity: Math.max(0, input.stockQuantity ?? 50),
        minStockAlert: Math.max(0, input.minStockAlert ?? 10),
        unit: input.unit?.trim() || 'chai',
        imageUrl: input.imageUrl?.trim() || '',
        active: input.active !== undefined ? input.active : true,
      },
    });

    return ok({ slug: product.slug, name: product.name });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể tạo sản phẩm: ${msg}`);
  }
}

export async function updateProduct(
  input: UpdateProductInput,
): Promise<Result<{ slug: string; name: string }, string>> {
  if (!input.slug) {
    return err('Mã slug sản phẩm không hợp lệ.');
  }

  const existing = await prisma.product.findUnique({
    where: { slug: input.slug },
  });
  if (!existing) {
    return err(`Không tìm thấy sản phẩm với mã "${input.slug}".`);
  }

  try {
    const updated = await prisma.product.update({
      where: { slug: input.slug },
      data: {
        ...(input.name !== undefined && { name: input.name.trim() }),
        ...(input.description !== undefined && { description: input.description.trim() }),
        ...(input.usageGuide !== undefined && { usageGuide: input.usageGuide.trim() }),
        ...(input.priceVnd !== undefined && { priceVnd: Math.max(0, input.priceVnd) }),
        ...(input.costPriceVnd !== undefined && { costPriceVnd: Math.max(0, input.costPriceVnd) }),
        ...(input.stockQuantity !== undefined && {
          stockQuantity: Math.max(0, input.stockQuantity),
        }),
        ...(input.minStockAlert !== undefined && {
          minStockAlert: Math.max(0, input.minStockAlert),
        }),
        ...(input.unit !== undefined && { unit: input.unit.trim() }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl.trim() }),
        ...(input.active !== undefined && { active: input.active }),
      },
    });

    return ok({ slug: updated.slug, name: updated.name });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cập nhật sản phẩm';
    return err(msg);
  }
}

export async function deleteProduct(slug: string): Promise<Result<{ message: string }, string>> {
  const product = await prisma.product.findUnique({
    where: { slug },
  });
  if (!product) {
    return err('Sản phẩm không tồn tại.');
  }

  // Dọn dẹp liên kết serviceProduct nếu có
  await prisma.serviceProduct.deleteMany({ where: { productSlug: slug } });

  // Kiểm tra nếu sản phẩm đang được kê trong toa
  const prescriptionsCount = await prisma.homeCarePrescription.count({
    where: { productSlug: slug },
  });

  if (prescriptionsCount > 0) {
    await prisma.homeCarePrescription.deleteMany({ where: { productSlug: slug } });
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
