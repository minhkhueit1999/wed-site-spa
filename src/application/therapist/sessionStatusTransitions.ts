import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export type SessionWorkflowStatus = 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * Đổi trạng thái liệu trình một chạm trên Mobile KTV ("Nhận khách" -> "Bắt đầu làm" -> "Hoàn thành")
 */
export async function transitionAppointmentStatus(
  appointmentId: string,
  therapistId: string,
  targetStatus: SessionWorkflowStatus,
  notes?: string,
): Promise<Result<{ newStatus: string; message: string }, string>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          plan: { include: { customer: { include: { user: true } } } },
        },
      });

      if (!appointment) return err('Không tìm thấy lịch hẹn.');

      // Bảo mật phân quyền: Chỉ KTV phụ trách hoặc Admin mới được đổi trạng thái
      if (appointment.therapistId !== therapistId) {
        const user = await tx.user.findUnique({ where: { id: therapistId } });
        if (user?.role !== 'ADMIN') {
          return err('Bạn không phải là kỹ thuật viên phụ trách lịch hẹn này.');
        }
      }

      // Xác thực luồng trạng thái hợp lệ
      if (targetStatus === 'CHECKED_IN') {
        if (appointment.status !== 'SCHEDULED' && appointment.status !== 'CONFIRMED') {
          return err('Chỉ có thể nhận khách khi lịch hẹn ở trạng thái Đã đặt.');
        }
      } else if (targetStatus === 'IN_PROGRESS') {
        if (
          appointment.status !== 'CHECKED_IN' &&
          appointment.status !== 'SCHEDULED' &&
          appointment.status !== 'CONFIRMED'
        ) {
          return err('Lịch hẹn cần ở trạng thái Đã nhận khách trước khi bắt đầu.');
        }
      } else if (targetStatus === 'COMPLETED') {
        // Cho phép hoàn thành từ IN_PROGRESS hoặc CHECKED_IN
      }

      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: targetStatus,
          notes: notes
            ? `${appointment.notes ? appointment.notes + ' | ' : ''}${notes}`
            : appointment.notes,
        },
      });

      // Ghi nhật ký AuditLog
      await tx.auditLog.create({
        data: {
          actorId: therapistId,
          action: 'UPDATE_SESSION_LOG',
          targetType: 'SESSION_LOG',
          targetId: appointmentId,
          metadata: JSON.stringify({
            event: 'STATUS_TRANSITION',
            from: appointment.status,
            to: targetStatus,
            customerName: appointment.plan.customer.user.name,
          }),
        },
      });

      let message = 'Đã cập nhật trạng thái thành công.';
      if (targetStatus === 'CHECKED_IN') {
        message = 'Đã nhận khách vào phòng thành công.';
      } else if (targetStatus === 'IN_PROGRESS') {
        message = 'Đang trong phiên trị liệu. Đồng hồ bấm giờ đã bắt đầu!';
      } else if (targetStatus === 'COMPLETED') {
        message =
          'Đã hoàn thành buổi trị liệu. Vui lòng ghi chú lâm sàng hoặc thêm sản phẩm bán chéo.';
      }

      return ok({
        newStatus: updated.status,
        message,
      });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cập nhật trạng thái ca';
    return err(msg);
  }
}
