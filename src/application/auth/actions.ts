'use server';

import { signIn, signOut } from '@/infrastructure/auth/auth';
import { userRepository } from '@/infrastructure/repositories/UserRepository';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { AuthError } from 'next-auth';

const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng.'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên.'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự.'),
  email: z.string().email('Email không đúng định dạng.'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên.'),
  consent: z
    .enum(['on', 'true', '1'])
    .optional()
    .refine((val) => val !== undefined, {
      message: 'Bạn cần đồng ý cho phép xử lý dữ liệu để lưu hồ sơ chăm sóc.',
    }),
});

export type ActionState = {
  success: boolean;
  message?: string;
  role?: string;
  fieldErrors?: Record<string, string>;
};

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [key, issues] of Object.entries(parsed.error.formErrors.fieldErrors)) {
      if (issues?.[0]) fieldErrors[key] = issues[0];
    }
    return { success: false, message: 'Dữ liệu không hợp lệ.', fieldErrors };
  }

  // Rate limit
  const rateLimit = checkRateLimit(`login-action:${parsed.data.email}`, 5, 60000);
  if (!rateLimit.success) {
    return {
      success: false,
      message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng chờ 1 phút.',
    };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    const user = await userRepository.findByEmail(parsed.data.email);
    return { success: true, role: user?.role };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, message: 'Email hoặc mật khẩu không chính xác.' };
    }
    return { success: false, message: 'Đăng nhập không thành công. Vui lòng thử lại.' };
  }
}

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    consent: formData.get('consent'),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [key, issues] of Object.entries(parsed.error.formErrors.fieldErrors)) {
      if (issues?.[0]) fieldErrors[key] = issues[0];
    }
    return { success: false, message: 'Vui lòng kiểm tra lại thông tin.', fieldErrors };
  }

  // Kiểm tra email tồn tại
  const existing = await userRepository.findByEmail(parsed.data.email);
  if (existing) {
    return {
      success: false,
      fieldErrors: { email: 'Email này đã được sử dụng.' },
      message: 'Email đã tồn tại trong hệ thống.',
    };
  }

  try {
    await userRepository.createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      role: 'CUSTOMER',
      consent: true,
    });

    return {
      success: true,
      message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay.',
    };
  } catch (error) {
    console.error('Lỗi tạo tài khoản:', error);
    return {
      success: false,
      message: 'Không thể tạo tài khoản lúc này. Vui lòng thử lại.',
    };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/dang-nhap' });
}
