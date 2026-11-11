import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface UpsellProductItem {
  slug: string;
  name: string;
  priceVnd: number;
  commissionRewardVnd: number; // 15% hoa hồng KTV nhận
  imageUrl: string;
  stockQuantity: number;
  description: string;
}

/**
 * Lấy danh mục sản phẩm gợi ý bán chéo trong phòng cho KTV kèm mức hoa hồng nhận được
 */
export async function getInRoomUpsellCatalog(): Promise<Result<UpsellProductItem[], string>> {
  try {
    const products = await prisma.product.findMany({
      where: { active: true, stockQuantity: { gt: 0 } },
      orderBy: { priceVnd: 'asc' },
    });

    const items: UpsellProductItem[] = products.map((p) => ({
      slug: p.slug,
      name: p.name,
      priceVnd: p.priceVnd,
      commissionRewardVnd: Math.round(p.priceVnd * 0.15),
      imageUrl: p.imageUrl,
      stockQuantity: p.stockQuantity,
      description: p.description,
    }));

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy sản phẩm bán chéo';
    return err(msg);
  }
}

/**
 * Thêm sản phẩm bán chéo vào hóa đơn của khách hàng, tự động gắn hoa hồng cho KTV
 */
export async function addInRoomUpsellToAppointment(input: {
  appointmentId: string;
  therapistId: string;
  productSlug: string;
  quantity?: number;
}): Promise<Result<{ addedItemName: string; commissionEarnedVnd: number }, string>> {
  const qty = input.quantity && input.quantity > 0 ? input.quantity : 1;

  try {
    return await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.findUnique({
        where: { id: input.appointmentId },
        include: {
          plan: { include: { customer: true } },
          invoices: true,
        },
      });

      if (!apt) return err('Không tìm thấy lịch hẹn.');

      if (apt.therapistId !== input.therapistId) {
        const user = await tx.user.findUnique({ where: { id: input.therapistId } });
        if (user?.role !== 'ADMIN') {
          return err('Chỉ KTV phụ trách lịch hẹn này mới được thêm sản phẩm.');
        }
      }

      const product = await tx.product.findUnique({
        where: { slug: input.productSlug },
      });
      if (!product) return err('Sản phẩm không tồn tại.');
      if (product.stockQuantity < qty) {
        return err(`Sản phẩm trong kho chỉ còn ${product.stockQuantity} ${product.unit}.`);
      }

      const commissionEarned = Math.round(product.priceVnd * qty * 0.15);
      const itemTotal = product.priceVnd * qty;

      // Tìm hóa đơn đã có hoặc tạo hóa đơn mới cho lịch hẹn này
      let invoice = apt.invoices[0];
      if (!invoice) {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const code = `HD-${datePart}-${Math.floor(1000 + Math.random() * 9000)}`;

        invoice = await tx.invoice.create({
          data: {
            code,
            customerId: apt.plan.customerId,
            appointmentId: apt.id,
            subtotalVnd: itemTotal,
            discountVnd: 0,
            finalVnd: itemTotal,
            paidVnd: 0,
            debtVnd: itemTotal,
            paymentMethod: 'CASH',
            status: 'DRAFT',
            upsellTherapistId: input.therapistId,
            upsellCommissionVnd: commissionEarned,
            notes: `Bán chéo trong buồng bởi KTV`,
          },
        });
      } else {
        // Cập nhật hóa đơn đã có
        const updatedSubtotal = invoice.subtotalVnd + itemTotal;
        const updatedFinal = Math.max(0, updatedSubtotal - invoice.discountVnd);
        const updatedCommission = invoice.upsellCommissionVnd + commissionEarned;

        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            subtotalVnd: updatedSubtotal,
            finalVnd: updatedFinal,
            debtVnd: Math.max(0, updatedFinal - invoice.paidVnd),
            upsellTherapistId: input.therapistId,
            upsellCommissionVnd: updatedCommission,
          },
        });
      }

      // Thêm InvoiceItem
      await tx.invoiceItem.create({
        data: {
          invoiceId: invoice.id,
          itemType: 'PRODUCT',
          itemId: product.slug,
          itemName: product.name,
          quantity: qty,
          unitPriceVnd: product.priceVnd,
          totalPriceVnd: itemTotal,
        },
      });

      // Trừ kho và ghi giao dịch
      const newStock = product.stockQuantity - qty;
      await tx.product.update({
        where: { slug: product.slug },
        data: { stockQuantity: newStock },
      });

      await tx.inventoryTransaction.create({
        data: {
          productSlug: product.slug,
          type: 'SALE_DEDUCTION',
          quantity: -qty,
          balanceAfter: newStock,
          costPriceVnd: product.costPriceVnd,
          reason: `Bán chéo trong buồng cho khách (HĐ ${invoice.code})`,
          actorId: input.therapistId,
        },
      });

      return ok({
        addedItemName: product.name,
        commissionEarnedVnd: commissionEarned,
      });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi thêm sản phẩm bán chéo';
    return err(msg);
  }
}
