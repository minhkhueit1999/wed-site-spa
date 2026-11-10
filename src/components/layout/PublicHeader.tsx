import Link from 'next/link';
import { Button } from '@/components/ui';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E2D9CC] bg-[#FAF7F2]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[#405C4E]">
          Digital Wellness
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/trieu-chung"
            className="text-sm font-medium text-[#635B54] transition-colors hover:text-[#405C4E]"
          >
            Theo triệu chứng
          </Link>
          <Link
            href="/dang-nhap"
            className="text-sm font-medium text-[#635B54] transition-colors hover:text-[#405C4E]"
          >
            Đăng nhập
          </Link>
          <Link href="/tu-van">
            <Button size="sm" variant="primary">
              Trắc nghiệm
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
