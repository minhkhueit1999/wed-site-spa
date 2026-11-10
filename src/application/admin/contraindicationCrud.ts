import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface CreateContraindicationInput {
  flag: string;
  message: string;
  blocksServiceSlugs: string[];
  blocksProductSlugs: string[];
  requiresStaffReview: boolean;
}

export async function createContraindication(
  input: CreateContraindicationInput,
): Promise<Result<{ id: string }, string>> {
  if (!input.flag || !input.message) {
    return err('Vui lòng nhập mã cờ (flag) và thông điệp cảnh báo.');
  }

  const existing = await prisma.contraindication.findUnique({
    where: { flag: input.flag },
  });
  if (existing) {
    return err(`Cờ chống chỉ định "${input.flag}" đã tồn tại.`);
  }

  try {
    const item = await prisma.contraindication.create({
      data: {
        flag: input.flag,
        message: input.message.trim(),
        blocksServiceSlugs: JSON.stringify(input.blocksServiceSlugs || []),
        blocksProductSlugs: JSON.stringify(input.blocksProductSlugs || []),
        requiresStaffReview: input.requiresStaffReview,
      },
    });

    return ok({ id: item.id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể tạo chống chỉ định: ${msg}`);
  }
}

export async function deleteContraindication(
  id: string,
): Promise<Result<{ message: string }, string>> {
  try {
    await prisma.contraindication.delete({ where: { id } });
    return ok({ message: 'Đã xóa cờ chống chỉ định thành công.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể xóa chống chỉ định: ${msg}`);
  }
}
