import { auth } from './auth';

export type UserRole = 'CUSTOMER' | 'THERAPIST' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? '',
    role: ((session.user as { role?: string }).role as UserRole) ?? 'CUSTOMER',
  };
}

export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED: Bạn cần đăng nhập để thực hiện hành động này.');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole | UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireUser();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    throw new Error(`FORBIDDEN: Vai trò '${user.role}' không có quyền truy cập chức năng này.`);
  }

  return user;
}
