import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface InventoryItemDTO {
  slug: string;
  name: string;
  unit: string;
  priceVnd: number;
  costPriceVnd: number;
  stockQuantity: number;
  minStockAlert: number;
  isLowStock: boolean;
  imageUrl: string;
  recentTransactionsCount: number;
}

export interface InventoryTransactionItem {
  id: string;
  productSlug: string;
  productName: string;
  type: string;
  quantity: number;
  balanceAfter: number;
  costPriceVnd: number;
  reason: string;
  actorId: string;
  createdAt: string;
}

/**
 * Lấy tình trạng tồn kho tất cả sản phẩm
 */
export async function getInventoryStatus(): Promise<Result<InventoryItemDTO[], string>> {
  try {
    const products = await prisma.product.findMany({
      include: {
        inventoryTransactions: {
          select: { id: true },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    const items: InventoryItemDTO[] = products.map((p) => ({
      slug: p.slug,
      name: p.name,
      unit: p.unit,
      priceVnd: p.priceVnd,
      costPriceVnd: p.costPriceVnd,
      stockQuantity: p.stockQuantity,
      minStockAlert: p.minStockAlert,
      isLowStock: p.stockQuantity <= p.minStockAlert,
      imageUrl: p.imageUrl,
      recentTransactionsCount: p.inventoryTransactions.length,
    }));

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy danh mục kho';
    return err(msg);
  }
}

/**
 * Nhập kho sản phẩm mỹ phẩm
 */
export async function stockInProduct(input: {
  productSlug: string;
  quantity: number;
  costPriceVnd?: number;
  reason: string;
  actorId: string;
}): Promise<Result<{ newStock: number }, string>> {
  if (input.quantity <= 0) return err('Số lượng nhập phải lớn hơn 0.');

  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { slug: input.productSlug },
      });
      if (!product) return err('Sản phẩm không tồn tại.');

      const newStock = product.stockQuantity + input.quantity;
      const updatedCost =
        input.costPriceVnd !== undefined ? input.costPriceVnd : product.costPriceVnd;

      await tx.product.update({
        where: { slug: input.productSlug },
        data: {
          stockQuantity: newStock,
          costPriceVnd: updatedCost,
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          productSlug: input.productSlug,
          type: 'IMPORT',
          quantity: input.quantity,
          balanceAfter: newStock,
          costPriceVnd: updatedCost,
          reason: input.reason || 'Nhập kho bổ sung',
          actorId: input.actorId,
        },
      });

      return ok({ newStock });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi nhập kho';
    return err(msg);
  }
}

/**
 * Xuất kho mỹ phẩm (buồng trị liệu hoặc hủy hỏng)
 */
export async function stockOutProduct(input: {
  productSlug: string;
  quantity: number;
  reason: string;
  actorId: string;
}): Promise<Result<{ newStock: number }, string>> {
  if (input.quantity <= 0) return err('Số lượng xuất phải lớn hơn 0.');

  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { slug: input.productSlug },
      });
      if (!product) return err('Sản phẩm không tồn tại.');

      if (product.stockQuantity < input.quantity) {
        return err(
          `Tồn kho không đủ để xuất (Hiện còn: ${product.stockQuantity} ${product.unit}, yêu cầu xuất: ${input.quantity}).`,
        );
      }

      const newStock = product.stockQuantity - input.quantity;

      await tx.product.update({
        where: { slug: input.productSlug },
        data: { stockQuantity: newStock },
      });

      await tx.inventoryTransaction.create({
        data: {
          productSlug: input.productSlug,
          type: 'EXPORT',
          quantity: -input.quantity,
          balanceAfter: newStock,
          costPriceVnd: product.costPriceVnd,
          reason: input.reason || 'Xuất buồng trị liệu',
          actorId: input.actorId,
        },
      });

      return ok({ newStock });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi xuất kho';
    return err(msg);
  }
}

/**
 * Lịch sử các giao dịch kho gần nhất
 */
export async function getInventoryTransactions(
  productSlug?: string,
): Promise<Result<InventoryTransactionItem[], string>> {
  try {
    const txs = await prisma.inventoryTransaction.findMany({
      where: productSlug ? { productSlug } : undefined,
      include: {
        product: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const items: InventoryTransactionItem[] = txs.map((t) => ({
      id: t.id,
      productSlug: t.productSlug,
      productName: t.product.name,
      type: t.type,
      quantity: t.quantity,
      balanceAfter: t.balanceAfter,
      costPriceVnd: t.costPriceVnd,
      reason: t.reason,
      actorId: t.actorId,
      createdAt: t.createdAt.toISOString(),
    }));

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy lịch sử kho';
    return err(msg);
  }
}
