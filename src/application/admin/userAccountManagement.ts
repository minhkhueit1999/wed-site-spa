import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';
import bcrypt from 'bcryptjs';

export interface UserAccountItem {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'THERAPIST' | 'ADMIN';
  phone?: string | null;
  loyaltyTier?: string | null;
  totalSpentVnd?: number | null;
  prepaidSessions?: number | null;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  role: 'CUSTOMER' | 'THERAPIST' | 'ADMIN';
  password?: string;
  phone?: string;
}

export interface UpdateUserInput {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'THERAPIST' | 'ADMIN';
  phone?: string;
  password?: string;
}

/**
 * Lấy danh sách toàn bộ tài khoản người dùng trong hệ thống
 */
export async function getAllUsersList(): Promise<Result<UserAccountItem[], string>> {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped: UserAccountItem[] = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role as 'CUSTOMER' | 'THERAPIST' | 'ADMIN',
      phone: u.profile?.phone || null,
      loyaltyTier: u.profile?.loyaltyTier || null,
      totalSpentVnd: u.profile?.totalSpentVnd || null,
      prepaidSessions: u.profile?.prepaidSessions || null,
      createdAt: u.createdAt.toISOString(),
    }));

    return ok(mapped);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi truy vấn danh sách tài khoản';
    return err(msg);
  }
}

/**
 * Tạo tài khoản mới (Khách hàng, Kỹ thuật viên, Quản trị viên)
 */
export async function createUserAccount(
  input: CreateUserInput,
  actorId: string,
): Promise<Result<{ id: string; name: string }, string>> {
  if (!input.name?.trim() || !input.email?.trim()) {
    return err('Vui lòng nhập họ tên và email hợp lệ.');
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: input.email.trim() } });
    if (existing) {
      return err('Email này đã tồn tại trong hệ thống. Vui lòng chọn email khác.');
    }

    const rawPassword = input.password?.trim() || 'SpaDemo2026!';
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: input.email.trim(),
        role: input.role,
        passwordHash,
        profile: {
          create: {
            phone: input.phone?.trim() || null,
            loyaltyTier: 'STANDARD',
            consentAt: new Date(),
          },
        },
      },
    });

    // Ghi nhận AuditLog
    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'CREATE_USER',
        targetType: 'USER',
        targetId: newUser.id,
        metadata: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }),
      },
    });

    return ok({ id: newUser.id, name: newUser.name });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi tạo tài khoản mới';
    return err(msg);
  }
}

/**
 * Cập nhật thông tin tài khoản (Họ tên, email, vai trò, số điện thoại, đổi mật khẩu)
 */
export async function updateUserAccount(
  input: UpdateUserInput,
  actorId: string,
): Promise<Result<{ id: string; name: string }, string>> {
  if (!input.name?.trim() || !input.email?.trim()) {
    return err('Vui lòng nhập họ tên và email hợp lệ.');
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: input.id } });
    if (!user) return err('Không tìm thấy tài khoản người dùng cần cập nhật.');

    // Kiểm tra trùng email nếu đổi email
    if (input.email.trim() !== user.email) {
      const emailDup = await prisma.user.findUnique({ where: { email: input.email.trim() } });
      if (emailDup) return err('Email mới này đã được sử dụng bởi một tài khoản khác.');
    }

    const updateData: {
      name: string;
      email: string;
      role: string;
      passwordHash?: string;
    } = {
      name: input.name.trim(),
      email: input.email.trim(),
      role: input.role,
    };

    if (input.password?.trim()) {
      updateData.passwordHash = await bcrypt.hash(input.password.trim(), 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: input.id },
      data: updateData,
    });

    // Cập nhật SĐT trong CustomerProfile
    if (input.phone !== undefined) {
      const profile = await prisma.customerProfile.findUnique({ where: { userId: input.id } });
      if (profile) {
        await prisma.customerProfile.update({
          where: { userId: input.id },
          data: { phone: input.phone.trim() || null },
        });
      } else {
        await prisma.customerProfile.create({
          data: {
            userId: input.id,
            phone: input.phone.trim() || null,
            loyaltyTier: 'STANDARD',
            consentAt: new Date(),
          },
        });
      }
    }

    // Ghi nhận AuditLog
    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'UPDATE_USER',
        targetType: 'USER',
        targetId: updatedUser.id,
        metadata: JSON.stringify({
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          passwordChanged: Boolean(input.password?.trim()),
        }),
      },
    });

    return ok({ id: updatedUser.id, name: updatedUser.name });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cập nhật tài khoản';
    return err(msg);
  }
}

/**
 * Xóa tài khoản người dùng an toàn (Dọn dẹp ràng buộc dữ liệu phụ trợ)
 */
export async function deleteUserAccount(
  userId: string,
  actorId: string,
): Promise<Result<{ message: string }, string>> {
  if (userId === actorId) {
    return err('Bạn không thể tự xóa tài khoản quản trị đang đăng nhập của chính mình.');
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!target) return err('Không tìm thấy tài khoản người dùng cần xóa.');

    // 1. Dọn dẹp dữ liệu KTV nếu là nhân viên
    await prisma.appointment.deleteMany({ where: { therapistId: userId } });
    await prisma.staffShift.deleteMany({ where: { staffId: userId } });
    await prisma.leaveRequest.deleteMany({ where: { staffId: userId } });
    await prisma.staffPayroll.deleteMany({ where: { staffId: userId } });
    await prisma.sessionLog.deleteMany({ where: { therapistId: userId } });

    // 2. Dọn dẹp dữ liệu khách hàng nếu có
    if (target.profile) {
      const plans = await prisma.treatmentPlan.findMany({
        where: { customerId: target.profile.id },
      });
      for (const plan of plans) {
        await prisma.appointment.deleteMany({ where: { planId: plan.id } });
      }
      await prisma.treatmentPlan.deleteMany({ where: { customerId: target.profile.id } });
      await prisma.invoiceItem.deleteMany({});
      await prisma.invoice.deleteMany({ where: { customerId: target.profile.id } });
    }

    // 3. Xóa User (CustomerProfile sẽ bị cascade xóa)
    await prisma.user.delete({ where: { id: userId } });

    // Ghi AuditLog
    await prisma.auditLog.create({
      data: {
        actorId,
        action: 'DELETE_USER',
        targetType: 'USER',
        targetId: userId,
        metadata: JSON.stringify({
          deletedEmail: target.email,
          deletedName: target.name,
          deletedRole: target.role,
        }),
      },
    });

    return ok({ message: `Đã xóa tài khoản "${target.name}" (${target.email}) thành công.` });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi xóa tài khoản';
    return err(msg);
  }
}
