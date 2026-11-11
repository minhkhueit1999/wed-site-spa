import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface BillCalculationResult {
  subtotalVnd: number;
  tierDiscountVnd: number;
  voucherDiscountVnd: number;
  totalDiscountVnd: number;
  finalVnd: number;
  loyaltyTier: string;
  appliedVoucherCode?: string | null;
  isPrepaidPackageEligible: boolean;
}

export interface CreateInvoiceInput {
  customerId: string;
  appointmentId?: string;
  serviceSlug?: string;
  productItems?: Array<{ slug: string; quantity: number }>;
  voucherCode?: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD' | 'PREPAID_PACKAGE';
  paidVnd: number;
  upsellTherapistId?: string;
  notes?: string;
}

export interface InvoiceListItem {
  id: string;
  code: string;
  customerName: string;
  customerPhone?: string | null;
  loyaltyTier: string;
  subtotalVnd: number;
  discountVnd: number;
  finalVnd: number;
  paidVnd: number;
  debtVnd: number;
  paymentMethod: string;
  status: string;
  upsellTherapistName?: string | null;
  upsellCommissionVnd: number;
  createdAt: string;
  items: Array<{
    itemType: string;
    itemName: string;
    quantity: number;
    unitPriceVnd: number;
    totalPriceVnd: number;
  }>;
}

/**
 * Thuật toán tính toán hóa đơn tự động (Chiết khấu thẻ thành viên, voucher, trừ gói)
 */
export async function calculateBillPreview(input: {
  customerId: string;
  serviceSlug?: string;
  productItems?: Array<{ slug: string; quantity: number }>;
  voucherCode?: string;
  usePrepaidSession?: boolean;
}): Promise<Result<BillCalculationResult, string>> {
  try {
    const customer = await prisma.customerProfile.findUnique({
      where: { id: input.customerId },
    });
    if (!customer) return err('Không tìm thấy khách hàng.');

    let serviceCost = 0;
    if (input.serviceSlug) {
      const s = await prisma.service.findUnique({ where: { slug: input.serviceSlug } });
      if (s) serviceCost = s.priceVnd;
    }

    let productsCost = 0;
    if (input.productItems && input.productItems.length > 0) {
      const slugs = input.productItems.map((p) => p.slug);
      const dbProducts = await prisma.product.findMany({ where: { slug: { in: slugs } } });
      const priceMap = new Map(dbProducts.map((p) => [p.slug, p.priceVnd]));

      for (const item of input.productItems) {
        const unitPrice = priceMap.get(item.slug) || 0;
        productsCost += unitPrice * item.quantity;
      }
    }

    // Nếu dùng buổi trong gói trả trước thì tiền dịch vụ = 0
    const isPrepaidEligible = customer.prepaidSessions > 0;
    if (input.usePrepaidSession && isPrepaidEligible) {
      serviceCost = 0;
    }

    const subtotal = serviceCost + productsCost;

    // Chiết khấu theo hạng thẻ VIP
    let tierPercent = 0;
    if (customer.loyaltyTier === 'SILVER') tierPercent = 0.05;
    else if (customer.loyaltyTier === 'GOLD') tierPercent = 0.1;
    else if (customer.loyaltyTier === 'DIAMOND') tierPercent = 0.15;

    const tierDiscount = Math.round(serviceCost * tierPercent); // Giảm giá dịch vụ cho hội viên

    // Chiết khấu Voucher
    let voucherDiscount = 0;
    let validVoucherCode: string | null = null;

    if (input.voucherCode) {
      const v = await prisma.voucher.findUnique({ where: { code: input.voucherCode } });
      if (v && v.active && v.expiresAt > new Date() && v.usedCount < v.usageLimit) {
        if (subtotal >= v.minOrderVnd) {
          validVoucherCode = v.code;
          if (v.discountType === 'PERCENT') {
            const rawDiscount = Math.round((subtotal * v.discountValue) / 100);
            voucherDiscount = Math.min(rawDiscount, v.maxDiscountVnd);
          } else {
            voucherDiscount = Math.min(v.discountValue, subtotal);
          }
        }
      }
    }

    const totalDiscount = tierDiscount + voucherDiscount;
    const finalVnd = Math.max(0, subtotal - totalDiscount);

    return ok({
      subtotalVnd: subtotal,
      tierDiscountVnd: tierDiscount,
      voucherDiscountVnd: voucherDiscount,
      totalDiscountVnd: totalDiscount,
      finalVnd,
      loyaltyTier: customer.loyaltyTier,
      appliedVoucherCode: validVoucherCode,
      isPrepaidPackageEligible: isPrepaidEligible,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi tính tiền hóa đơn';
    return err(msg);
  }
}

/**
 * Tạo và chốt hóa đơn thanh toán (Transaction an toàn, trừ buổi gói, trừ kho, tính hoa hồng)
 */
export async function createAndSettleInvoice(
  input: CreateInvoiceInput,
): Promise<Result<{ invoiceId: string; code: string; debtVnd: number }, string>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const customer = await tx.customerProfile.findUnique({
        where: { id: input.customerId },
        include: { user: true },
      });
      if (!customer) return err('Không tìm thấy thông tin khách hàng.');

      const calcRes = await calculateBillPreview({
        customerId: input.customerId,
        serviceSlug: input.serviceSlug,
        productItems: input.productItems,
        voucherCode: input.voucherCode,
        usePrepaidSession: input.paymentMethod === 'PREPAID_PACKAGE',
      });
      if (!calcRes.ok) return err(calcRes.error);

      const { subtotalVnd, totalDiscountVnd, finalVnd, appliedVoucherCode } = calcRes.value;

      const paidVnd = Math.max(0, input.paidVnd);
      const debtVnd = Math.max(0, finalVnd - paidVnd);

      // Mã hóa đơn duy nhất: HD-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Math.floor(1000 + Math.random() * 9000);
      const code = `HD-${datePart}-${randPart}`;

      // Tính hoa hồng bán chéo cho KTV nếu có
      let upsellCommissionVnd = 0;
      let totalProductSales = 0;

      const invoice = await tx.invoice.create({
        data: {
          code,
          customerId: input.customerId,
          appointmentId: input.appointmentId || null,
          subtotalVnd,
          discountVnd: totalDiscountVnd,
          voucherCode: appliedVoucherCode,
          finalVnd,
          paidVnd,
          debtVnd,
          paymentMethod: input.paymentMethod,
          status: debtVnd > 0 ? 'PARTIALLY_PAID' : 'PAID',
          upsellTherapistId: input.upsellTherapistId || null,
          notes: input.notes || null,
        },
      });

      // Tạo InvoiceItem cho Dịch vụ
      if (input.serviceSlug) {
        const s = await tx.service.findUnique({ where: { slug: input.serviceSlug } });
        if (s) {
          const isPrepaid = input.paymentMethod === 'PREPAID_PACKAGE';
          await tx.invoiceItem.create({
            data: {
              invoiceId: invoice.id,
              itemType: 'SERVICE',
              itemId: s.slug,
              itemName: s.name,
              quantity: 1,
              unitPriceVnd: isPrepaid ? 0 : s.priceVnd,
              totalPriceVnd: isPrepaid ? 0 : s.priceVnd,
            },
          });
        }
      }

      // Tạo InvoiceItem & trừ tồn kho cho Sản phẩm mua thêm
      if (input.productItems && input.productItems.length > 0) {
        for (const item of input.productItems) {
          const p = await tx.product.findUnique({ where: { slug: item.slug } });
          if (p) {
            const itemTotal = p.priceVnd * item.quantity;
            totalProductSales += itemTotal;

            await tx.invoiceItem.create({
              data: {
                invoiceId: invoice.id,
                itemType: 'PRODUCT',
                itemId: p.slug,
                itemName: p.name,
                quantity: item.quantity,
                unitPriceVnd: p.priceVnd,
                totalPriceVnd: itemTotal,
              },
            });

            // Trừ tồn kho mỹ phẩm tự động
            const newStock = Math.max(0, p.stockQuantity - item.quantity);
            await tx.product.update({
              where: { slug: p.slug },
              data: { stockQuantity: newStock },
            });

            await tx.inventoryTransaction.create({
              data: {
                productSlug: p.slug,
                type: 'SALE_DEDUCTION',
                quantity: -item.quantity,
                balanceAfter: newStock,
                costPriceVnd: p.costPriceVnd,
                reason: `Bán kèm theo hóa đơn ${code}`,
                actorId: input.upsellTherapistId || 'admin',
              },
            });
          }
        }
      }

      // Hoa hồng bán chéo: 15% doanh số sản phẩm gán cho KTV
      if (input.upsellTherapistId && totalProductSales > 0) {
        upsellCommissionVnd = Math.round(totalProductSales * 0.15);
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { upsellCommissionVnd },
        });
      }

      // Tăng số lượt dùng voucher nếu có áp dụng
      if (appliedVoucherCode) {
        await tx.voucher.update({
          where: { code: appliedVoucherCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Cập nhật tài khoản khách hàng:
      // 1. Nếu dùng gói trả trước -> trừ 1 buổi
      const newPrepaid =
        input.paymentMethod === 'PREPAID_PACKAGE'
          ? Math.max(0, customer.prepaidSessions - 1)
          : customer.prepaidSessions;

      // 2. Cộng dồn công nợ mới (nếu có)
      const newDebtBalance = customer.debtBalanceVnd + debtVnd;

      // 3. Tích điểm và cộng dồn chi tiêu
      const newTotalSpent = customer.totalSpentVnd + paidVnd;
      const pointsEarned = Math.floor(paidVnd / 100000); // 100k VND = 1 điểm
      const newPoints = customer.loyaltyPoints + pointsEarned;

      // 4. Tự động thăng hạng thẻ khách hàng (Standard -> Silver -> Gold -> Diamond)
      let newTier = customer.loyaltyTier;
      if (newTotalSpent >= 30000000) newTier = 'DIAMOND';
      else if (newTotalSpent >= 15000000) newTier = 'GOLD';
      else if (newTotalSpent >= 5000000) newTier = 'SILVER';

      await tx.customerProfile.update({
        where: { id: input.customerId },
        data: {
          prepaidSessions: newPrepaid,
          debtBalanceVnd: newDebtBalance,
          totalSpentVnd: newTotalSpent,
          loyaltyPoints: newPoints,
          loyaltyTier: newTier,
        },
      });

      return ok({
        invoiceId: invoice.id,
        code: invoice.code,
        debtVnd,
      });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi xử lý hóa đơn';
    return err(msg);
  }
}

/**
 * Lấy danh sách hóa đơn kế toán
 */
export async function getInvoicesList(): Promise<Result<InvoiceListItem[], string>> {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: {
          include: {
            user: { select: { name: true } },
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Lấy tên KTV bán chéo nếu có
    const upsellTherapistIds = invoices.map((i) => i.upsellTherapistId).filter(Boolean) as string[];

    const therapists = await prisma.user.findMany({
      where: { id: { in: upsellTherapistIds } },
      select: { id: true, name: true },
    });
    const therapistMap = new Map(therapists.map((t) => [t.id, t.name]));

    const items: InvoiceListItem[] = invoices.map((inv) => ({
      id: inv.id,
      code: inv.code,
      customerName: inv.customer.user.name,
      customerPhone: inv.customer.phone,
      loyaltyTier: inv.customer.loyaltyTier,
      subtotalVnd: inv.subtotalVnd,
      discountVnd: inv.discountVnd,
      finalVnd: inv.finalVnd,
      paidVnd: inv.paidVnd,
      debtVnd: inv.debtVnd,
      paymentMethod: inv.paymentMethod,
      status: inv.status,
      upsellTherapistName: inv.upsellTherapistId
        ? therapistMap.get(inv.upsellTherapistId) || null
        : null,
      upsellCommissionVnd: inv.upsellCommissionVnd,
      createdAt: inv.createdAt.toISOString(),
      items: inv.items.map((it) => ({
        itemType: it.itemType,
        itemName: it.itemName,
        quantity: it.quantity,
        unitPriceVnd: it.unitPriceVnd,
        totalPriceVnd: it.totalPriceVnd,
      })),
    }));

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy danh sách hóa đơn';
    return err(msg);
  }
}
