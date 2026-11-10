import Link from 'next/link';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/ui';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { AmbientBackground } from '@/components/canvas/AmbientBackground';
import { HeroScene } from '@/components/canvas/HeroScene';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { TiltCard } from '@/components/ui/TiltCard';
import { SA_SPA_PRODUCTS } from '@/data/saSpaProducts';
import { LivingProductCard } from '@/components/ecommerce/LivingProductCard';

export default function Home() {
  // 4 sản phẩm tiêu biểu cho trang chủ
  const featuredProducts = SA_SPA_PRODUCTS.slice(0, 4);

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-[#2B2622]">
      {/* Nền động WebGL Fluid Aurora Shaders & Hạt 3D */}
      <AmbientBackground variant="fluid-aurora" />

      {/* Thanh điều hướng tích hợp giỏ hàng và bộ chuyển đổi chế độ */}
      <PublicHeader />

      {/* Hero Section: Không gian Sả Spa Indochine Luxury */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Cột văn bản thông điệp */}
          <div className="flex flex-col items-center space-y-6 text-center lg:col-span-7 lg:items-start lg:text-left">
            <Badge variant="terracotta" className="text-xs tracking-wider uppercase">
              🌿 Sả Spa Indochine Botanical Sanctuary
            </Badge>

            <h1 className="font-serif text-4xl leading-tight font-light text-[#1F2B24] sm:text-5xl md:text-6xl">
              Chăm sóc trọn vẹn từ spa đến chính ngôi nhà bạn
            </h1>

            <p className="text-base leading-relaxed text-[#635B54] md:text-lg">
              Đắm mình trong không gian tĩnh tại của Sả Spa — nơi tinh dầu sả chanh chưng cất thủ
              công, muối khoáng ngải cứu Tây Bắc và nến thơm bấc gỗ tuyết tùng hòa quyện cùng phác
              đồ trị liệu cá nhân hóa khép kín từ cơ sở đến ngôi nhà bạn.
            </p>

            <div className="flex w-full flex-col justify-center gap-3 pt-2 sm:w-auto sm:flex-row lg:justify-start">
              <Link href="/shop" className="w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-auto">
                  <Button size="lg" variant="primary" className="w-full shadow-lg sm:w-auto">
                    Khám Phá Cửa Hàng Sả Spa →
                  </Button>
                </MagneticButton>
              </Link>
              <Link href="/tu-van" className="w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Bắt đầu bài trắc nghiệm (3 phút)
                  </Button>
                </MagneticButton>
              </Link>
            </div>
          </div>

          {/* Cột Tác phẩm 3D Scrollytelling tương tác */}
          <div className="flex items-center justify-center lg:col-span-5">
            <HeroScene />
          </div>
        </div>

        {/* MỤC SẢN PHẨM SỐNG ĐỘNG TIÊU BIỂU (LIVING PRODUCTS SHOWCASE) */}
        <section className="mt-24">
          <div className="mb-10 flex flex-col items-center justify-between text-center sm:flex-row sm:text-left">
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase">
                ✦ Tuyệt Tác Thảo Mộc ✦
              </span>
              <h2 className="mt-1 font-serif text-2xl font-light text-[#1F2B24] sm:text-3xl">
                Bộ Sưu Tập Sả Spa Tuyển Chọn
              </h2>
              <p className="mt-1.5 text-xs text-[#8C827A]">
                Mỗi sản phẩm tự nâng hạ theo nhịp thở hữu cơ, nghiêng 3D và bung nở nốt hương khi
                chạm
              </p>
            </div>
            <Link
              href="/shop"
              className="mt-4 rounded-full border border-[#D4AF37] px-5 py-2 text-xs font-semibold text-[#755428] transition-colors hover:bg-[#D4AF37]/10 sm:mt-0"
            >
              Xem Toàn Bộ 16 Sản Phẩm →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((p) => (
              <LivingProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 3 Trụ cột cốt lõi với 3D Tilt Cards */}
        <section className="mt-24">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-2xl font-light text-[#1F2B24] sm:text-3xl">
              Chu Trình Trị Liệu &amp; Dưỡng Thân Toàn Diện
            </h2>
            <p className="mt-2 text-xs text-[#635B54]">
              Liên kết chặt chẽ giữa buổi trị liệu tại Sả Spa và nghi thức dưỡng thân thảo mộc tại
              gia
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <TiltCard>
              <Card
                hoverable
                className="flex h-full flex-col justify-between border-[#E2D9CC] bg-[#FAF7F2]"
              >
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5F3EB] text-sm font-bold text-[#2F6A4F]">
                      01
                    </span>
                    <Badge variant="secondary">Trắc nghiệm thể trạng</Badge>
                  </div>
                  <CardTitle>Chẩn đoán khoa học</CardTitle>
                  <CardDescription>
                    Khảo sát sâu sắc về da, giấc ngủ, căng thẳng và triệu chứng cơ vai gáy với hệ
                    thống luật tất định minh bạch.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#635B54]">
                    Tự động phát hiện cờ an toàn và chống chỉ định trước khi gợi ý tinh dầu và liệu
                    trình.
                  </p>
                </CardContent>
              </Card>
            </TiltCard>

            <TiltCard>
              <Card
                hoverable
                className="flex h-full flex-col justify-between border-[#E2D9CC] bg-[#FAF7F2]"
              >
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4EAE4] text-sm font-bold text-[#B8714F]">
                      02
                    </span>
                    <Badge variant="terracotta">Hộp Mây Tre Đan</Badge>
                  </div>
                  <CardTitle>Đóng gói thủ công</CardTitle>
                  <CardDescription>
                    Mọi đơn hàng đều được đóng trong hộp mây tre tự nhiên, kèm thiệp tay viết thư
                    pháp lời chúc miễn phí.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#635B54]">
                    Giao hỏa tốc 2H hoặc đóng gói bảo quản tinh chất chuyển phát toàn quốc.
                  </p>
                </CardContent>
              </Card>
            </TiltCard>

            <TiltCard>
              <Card
                hoverable
                className="flex h-full flex-col justify-between border-[#E2D9CC] bg-[#FAF7F2]"
              >
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAE1D3] text-sm font-bold text-[#405C4E]">
                      03
                    </span>
                    <Badge variant="primary">Treatment Tracker</Badge>
                  </div>
                  <CardTitle>Theo dõi tiến triển</CardTitle>
                  <CardDescription>
                    Kỹ thuật viên ghi nhật ký chỉ số sau mỗi buổi, cập nhật toa dưỡng ngay trên tài
                    khoản cá nhân của bạn.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-[#635B54]">
                    Tích hợp khối cầu thở 3D 4-7-8 giúp phục hồi nhịp tim và giấc ngủ mỗi tối.
                  </p>
                </CardContent>
              </Card>
            </TiltCard>
          </div>
        </section>
      </main>

      {/* Chân trang */}
      <PublicFooter />
    </div>
  );
}
