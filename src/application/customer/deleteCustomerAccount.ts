import { customerRepository } from '@/infrastructure/repositories/CustomerRepository';
import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface DeleteCustomerAccountInput {
  targetUserId: string;
  actorId: string;
}

export async function deleteCustomerAccount(
  input: DeleteCustomerAccountInput,
): Promise<Result<{ message: string }, string>> {
  const actor = await prisma.user.findUnique({
    where: { id: input.actorId },
  });

  if (!actor) {
    return err('Không xác định được danh tính người thực hiện.');
  }

  // Khách hàng chỉ được phép xóa tài khoản của chính mình (hoặc quản trị viên)
  if (actor.id !== input.targetUserId && actor.role !== 'ADMIN') {
    return err('Bạn không có quyền xóa tài khoản của người khác.');
  }

  const target = await prisma.user.findUnique({
    where: { id: input.targetUserId },
  });

  if (!target) {
    return err('Tài khoản cần xóa không tồn tại.');
  }

  // Ghi AuditLog trước khi xóa (bản ghi AuditLog tham chiếu actor, nếu actor tự xóa thì ghi nhận hành động này)
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: 'DELETE_CUSTOMER_DATA',
        targetType: 'USER',
        targetId: input.targetUserId,
        metadata: JSON.stringify({
          deletedUserEmail: target.email,
          deletedAt: new Date().toISOString(),
        }),
      },
    });
  } catch {
    // Tiếp tục ngay cả khi log gặp sự cố
  }

  // Thực hiện xóa cascade
  await customerRepository.deleteCustomerAccountAndData(input.targetUserId);

  return ok({
    message: 'Tài khoản và toàn bộ dữ liệu sức khỏe đã được xóa vĩnh viễn khỏi hệ thống.',
  });
}
