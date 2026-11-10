import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[#E2D9CC] bg-[#F3EDE3] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 text-sm text-[#635B54] md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <p className="font-serif text-base font-semibold text-[#405C4E]">
            Digital Wellness Platform
          </p>
          <p className="text-xs">Giải pháp liên kết dữ liệu offline tại spa và dưỡng da tại nhà</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm">
          <Link href="/trieu-chung" className="hover:text-[#405C4E]">
            Triệu chứng
          </Link>
          <Link href="/tu-van" className="hover:text-[#405C4E]">
            Trắc nghiệm
          </Link>
          <Link href="/dang-nhap" className="hover:text-[#405C4E]">
            Tài khoản
          </Link>
          <span className="text-[#E2D9CC]">|</span>
          <span>Chuẩn WCAG 2.2 AA</span>
          <span>Không bán lẻ đại trà</span>
        </div>
      </div>
    </footer>
  );
}
