import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Be_Vietnam_Pro, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/layout/AppProviders';
import { auth } from '@/infrastructure/auth/auth';

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
  title:
    'Sả Spa Botanical | Digital Wellness Platform — Không Gian Thương Mại Điện Tử & Trị Liệu Đông Dương Cao Cấp',
  description:
    'Hệ sinh thái sản phẩm spa thảo mộc cao cấp Sả Spa: tinh dầu chưng cất, nến thơm bấc gỗ, muối tắm cổ truyền và trà thảo mộc dưỡng tâm.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cookieStore = await cookies();
  const isUnlockedCookie = cookieStore.get('sa_spa_unlocked')?.value === 'true';

  return (
    <html
      lang="vi"
      className={`${vietnamSans.variable} ${playfairSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#FAF7F2] text-[#2B2622]">
        <AppProviders
          isAuthenticated={!!session?.user || isUnlockedCookie}
          userEmail={session?.user?.email}
          userName={session?.user?.name}
        >
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
