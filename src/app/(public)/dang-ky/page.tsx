'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
} from '@/components/ui';
import { registerAction } from '@/application/auth/actions';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [consent, setConsent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!consent) {
      setError('Bạn cần đồng ý cho phép xử lý dữ liệu sức khỏe để tiếp tục.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('consent', 'true');

    const result = await registerAction({ success: false }, formData);
    setIsLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || 'Đăng ký thành công!');
      setTimeout(() => {
        router.push('/dang-nhap');
      }, 1500);
    } else {
      setError(result.message || 'Đăng ký thất bại.');
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF7F2] px-6 py-12 sm:px-8">
      <div className="mb-6 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="font-serif text-3xl font-bold text-[#405C4E]">
          Digital Wellness
        </Link>
        <p className="mt-2 text-sm text-[#635B54]">Khởi tạo tài khoản chăm sóc cá nhân hóa</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="border-[#E2D9CC] shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Tạo tài khoản mới</CardTitle>
            <CardDescription className="text-center">
              Lưu trữ an toàn hồ sơ khảo sát và nhật ký điều trị của riêng bạn
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

            {successMsg && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-[#2F6A4F]/20 bg-[#E5F3EB] p-3 text-sm text-[#2F6A4F]"
              >
                {successMsg} Đang chuyển đến trang đăng nhập...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Họ và tên"
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors['name']}
                placeholder="Nguyễn Văn A"
              />

              <Input
                label="Địa chỉ Email"
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={fieldErrors['email']}
                placeholder="tenban@vidu.vn"
              />

              <Input
                label="Mật khẩu"
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors['password']}
                placeholder="Tối thiểu 6 ký tự"
              />

              {/* Checkbox đồng ý dữ liệu nhạy cảm */}
              <div className="space-y-2 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E2D9CC] text-[#405C4E] focus:ring-[#405C4E]"
                    required
                  />
                  <label
                    htmlFor="consent"
                    className="cursor-pointer leading-relaxed text-[#2B2622]"
                  >
                    Tôi đồng ý để hệ thống lưu trữ và xử lý thông tin khảo sát triệu chứng, tình
                    trạng cơ địa và lịch sử chăm sóc nhằm mục đích gợi ý phác đồ và toa dưỡng cá
                    nhân hóa.
                  </label>
                </div>
                <p className="pl-6 text-[11px] text-[#635B54] italic">
                  * Dữ liệu được bảo mật tối đa, không chia sẻ với bên thứ ba và bạn có quyền xóa
                  bất cứ lúc nào.
                </p>
              </div>

              <Button type="submit" variant="primary" className="mt-2 w-full" isLoading={isLoading}>
                Đăng ký tài khoản
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-[#635B54]">
              Đã có tài khoản?{' '}
              <Link href="/dang-nhap" className="font-medium text-[#405C4E] hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
