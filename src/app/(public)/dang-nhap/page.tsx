'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
} from '@/components/ui';
import { loginAction } from '@/application/auth/actions';
import { useAuth } from '@/components/layout/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    const result = await loginAction({ success: false }, formData);
    setIsLoading(false);

    if (result.success) {
      const userRole =
        result.role ||
        (email.startsWith('quantri')
          ? 'ADMIN'
          : email.startsWith('kythuatvien')
            ? 'THERAPIST'
            : 'CUSTOMER');
      const userName = result.name || email.split('@')[0];

      setSession({
        email,
        name: userName,
        role: userRole,
      });

      const callbackUrl = searchParams.get('callbackUrl');
      if (callbackUrl && !callbackUrl.startsWith('//') && callbackUrl.startsWith('/')) {
        router.push(callbackUrl);
      } else if (userRole === 'ADMIN') {
        router.push('/quan-tri');
      } else if (userRole === 'THERAPIST') {
        router.push('/ky-thuat-vien');
      } else {
        router.push('/tai-khoan');
      }
      router.refresh();
    } else {
      setError(result.message || 'Email hoặc mật khẩu không chính xác.');
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SpaDemo2026!');
  };

  return (
    <Card className="border-[#E2D9CC] shadow-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Đăng nhập tài khoản</CardTitle>
        <CardDescription className="text-center">
          Truy cập để theo dõi lộ trình và toa dưỡng tại nhà của bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-[#9E3838]/20 bg-[#FDECEC] p-3 text-sm text-[#9E3838]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Địa chỉ Email"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tenban@vidu.vn"
          />

          <Input
            label="Mật khẩu"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" variant="primary" className="mt-2 w-full" isLoading={isLoading}>
            Đăng nhập
          </Button>
        </form>

        {/* Tài khoản Demo hỗ trợ giảng viên đánh giá */}
        <div className="mt-6 border-t border-[#E2D9CC] pt-4">
          <p className="mb-2 text-center text-xs font-semibold tracking-wide text-[#635B54] uppercase">
            Tài khoản kiểm thử nhanh (Demo)
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemo('khachhang@spawellness.vn')}
              className="rounded-lg border border-[#E2D9CC] bg-[#FAF7F2] px-2.5 py-1 text-xs text-[#2B2622] transition-colors hover:bg-[#EAE1D3]"
            >
              <Badge variant="secondary" className="mr-1">
                Khách
              </Badge>{' '}
              An
            </button>
            <button
              type="button"
              onClick={() => fillDemo('kythuatvien@spawellness.vn')}
              className="rounded-lg border border-[#E2D9CC] bg-[#FAF7F2] px-2.5 py-1 text-xs text-[#2B2622] transition-colors hover:bg-[#EAE1D3]"
            >
              <Badge variant="primary" className="mr-1">
                KTV
              </Badge>{' '}
              Yến
            </button>
            <button
              type="button"
              onClick={() => fillDemo('quantri@spawellness.vn')}
              className="rounded-lg border border-[#E2D9CC] bg-[#FAF7F2] px-2.5 py-1 text-xs text-[#2B2622] transition-colors hover:bg-[#EAE1D3]"
            >
              <Badge variant="terracotta" className="mr-1">
                Admin
              </Badge>{' '}
              Trị
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-[#8C827A]">
            Tự động chuyển hướng tương ứng: Khách → /tai-khoan | KTV → /ky-thuat-vien | Admin →
            /quan-tri
          </p>
        </div>

        <div className="mt-6 text-center text-sm text-[#635B54]">
          Chưa có tài khoản?{' '}
          <Link href="/dang-ky" className="font-medium text-[#405C4E] hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF7F2] px-6 py-12 sm:px-8">
      <div className="mb-6 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="font-serif text-3xl font-bold text-[#405C4E]">
          Digital Wellness
        </Link>
        <p className="mt-2 text-sm text-[#635B54]">Hệ thống chăm sóc cá nhân hóa cho spa</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <React.Suspense
          fallback={
            <div className="rounded-2xl border border-[#E2D9CC] bg-white p-8 text-center text-[#635B54]">
              Đang tải biểu mẫu...
            </div>
          }
        >
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}
