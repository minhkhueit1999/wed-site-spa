import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface PrescribeProductInput {
  planId: string;
  therapistId: string;
  productSlug: string;
  instructions: string;
  frequency: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export async function prescribeProduct(
  input: PrescribeProductInput,
): Promise<Result<{ prescriptionId: string }, string>> {
  if (!input.instructions || input.instructions.trim().length < 5) {
    return err('Hướng dẫn sử dụng sản phẩm phải có ít nhất 5 ký tự.');
  }

  if (!input.frequency || input.frequency.trim().length < 2) {
    return err('Vui lòng chỉ định tần suất sử dụng (ví dụ: Mỗi tối, 2 lần/ngày).');
  }

  const therapist = await prisma.user.findUnique({
    where: { id: input.therapistId },
  });

  if (!therapist || (therapist.role !== 'THERAPIST' && therapist.role !== 'ADMIN')) {
    return err('Chỉ kỹ thuật viên hoặc quản trị viên mới có quyền kê toa chăm sóc tại nhà.');
  }

  const plan = await prisma.treatmentPlan.findUnique({
    where: { id: input.planId },
    include: {
      customer: true,
      service: true,
    },
  });

  if (!plan) {
    return err('Không tìm thấy phác đồ điều trị.');
  }

  const product = await prisma.product.findUnique({
    where: { slug: input.productSlug },
  });

  if (!product) {
    return err(`Sản phẩm không tồn tại: ${input.productSlug}`);
  }

  // KIỂM TRA CHỐNG CHỈ ĐỊNH NGHIÊM NGẶT
  const customerFlags: string[] = JSON.parse(plan.customer.safetyFlags || '[]');

  if (customerFlags.length > 0) {
    const contraindications = await prisma.contraindication.findMany({
      where: { flag: { in: customerFlags } },
    });

    for (const c of contraindications) {
      const blockedProductSlugs: string[] = JSON.parse(c.blocksProductSlugs || '[]');
      if (blockedProductSlugs.includes(product.slug)) {
        return err(
          `CẢNH BÁO AN TOÀN: Sản phẩm "${product.name}" bị chống chỉ định đối với khách hàng này do: ${c.message}`,
        );
      }
    }
  }

  try {
    const prescription = await prisma.homeCarePrescription.create({
      data: {
        planId: plan.id,
        productSlug: product.slug,
        instructions: input.instructions.trim(),
        frequency: input.frequency.trim(),
        startDate: input.startDate ? new Date(input.startDate) : new Date(),
        endDate: input.endDate ? new Date(input.endDate) : null,
        prescribedBy: input.therapistId,
      },
    });

    // Ghi AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: input.therapistId,
        action: 'CREATE_PRESCRIPTION',
        targetType: 'TREATMENT_PLAN',
        targetId: plan.id,
        metadata: JSON.stringify({
          prescriptionId: prescription.id,
          productSlug: product.slug,
        }),
      },
    });

    return ok({ prescriptionId: prescription.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể kê toa chăm sóc: ${msg}`);
  }
}
