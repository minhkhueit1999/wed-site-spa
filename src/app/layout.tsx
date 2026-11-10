import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google';
import './globals.css';

const vietnamSans = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-vietnam',
  display: 'swap',
});

const playfairSerif = Playfair_Display({
  weight: ['600', '700'],
  subsets: ['latin', 'vietnamese'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Digital Wellness Platform — Chăm sóc Cá nhân hóa từ Spa đến Nhà',
  description:
    'Hệ thống quản lý liệu trình và chăm sóc cá nhân hóa, kết hợp phác đồ tại spa cùng toa dưỡng tại nhà.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${vietnamSans.variable} ${playfairSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#FAF7F2] text-[#2B2622]">{children}</body>
    </html>
  );
}
