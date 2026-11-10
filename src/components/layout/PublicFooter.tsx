import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[#E2D9CC] bg-[#F3EDE3] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 text-sm text-[#635B54] md:flex-row">
        <div className="flex flex-col items-center gap-1 md:items-start">
          <p className="font-serif text-base font-semibold text-[#1F2B24]">
            🌿 MK SPA Indochine Sanctuary
          </p>
          <p className="text-xs">
            Hương thảo mộc bản địa chưng cất thủ công &amp; Trị liệu phục hồi chuyên sâu
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm">
          <Link href="/shop" className="font-medium text-[#1F2B24] hover:text-[#D4AF37]">
            Cửa Hàng MK SPA
          </Link>
          <Link href="/orders" className="hover:text-[#405C4E]">
            Đơn Hàng
          </Link>
          <Link href="/trieu-chung" className="hover:text-[#405C4E]">
            Triệu Chứng
          </Link>
          <Link href="/tu-van" className="hover:text-[#405C4E]">
            Trắc Nghiệm
          </Link>
          <span className="text-[#E2D9CC]">|</span>
          <span className="text-[#D4AF37]">Gói Quà Mây Tre Thủ Công</span>
          <span>Chuẩn WCAG AA</span>
        </div>
      </div>
    </footer>
  );
}
