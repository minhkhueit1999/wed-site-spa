import { customerRepository } from '@/infrastructure/repositories/CustomerRepository';
import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export async function exportCustomerData(userId: string): Promise<Result<object, string>> {
  const data = await customerRepository.exportCustomerData(userId);
  if (!data) {
    return err('Không tìm thấy dữ liệu khách hàng.');
  }

  // Ghi AuditLog
  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: 'EXPORT_CUSTOMER_DATA',
      targetType: 'USER',
      targetId: userId,
      metadata: JSON.stringify({ exportedAt: new Date().toISOString() }),
    },
  });

  return ok(data);
}
