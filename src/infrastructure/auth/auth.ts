import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { userRepository } from '@/infrastructure/repositories/UserRepository';
import { auditLogRepository } from '@/infrastructure/repositories/AuditLogRepository';
import { checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Rate limit đăng nhập: tối đa 5 lần thử/phút cho mỗi email
        const rateLimitResult = checkRateLimit(`login:${email}`, 5, 60000);
        if (!rateLimitResult.success) {
          throw new Error('Bạn đã thử đăng nhập quá số lần cho phép. Vui lòng chờ 1 phút.');
        }

        const user = await userRepository.findByEmail(email);
        if (!user) {
          return null;
        }

        const isValid = await userRepository.verifyPassword(password, user.passwordHash);
        if (!isValid) {
          await auditLogRepository.record({
            actorId: user.id,
            action: 'LOGIN_FAILED',
            targetType: 'USER',
            targetId: user.id,
            metadata: { reason: 'Sai mật khẩu' },
          });
          return null;
        }

        await auditLogRepository.record({
          actorId: user.id,
          action: 'LOGIN_SUCCESS',
          targetType: 'USER',
          targetId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || 'CUSTOMER';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/dang-nhap',
  },
  secret: process.env.AUTH_SECRET,
});
