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

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-[#2B2622]">
      {/* Nền động WebGL Fluid Aurora Shaders & Hạt 3D */}
      <AmbientBackground variant="fluid-aurora" />

      {/* Thanh điều hướng tích hợp bộ chuyển đổi chế độ hiển thị 3D */}
      <PublicHeader />

      {/* Hero Section: Asymmetric layout với 3D Organic Pebble Sculpture */}
      <main className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Cột văn bản thông điệp */}
          <div className="flex flex-col items-center space-y-6 text-center lg:col-span-7 lg:items-start lg:text-left">
            <Badge variant="terracotta" className="text-xs tracking-wider uppercase">
              Phục hồi &amp; Chăm sóc cá nhân hóa
            </Badge>

            <h1 className="font-serif text-4xl leading-tight font-bold text-[#2B2622] sm:text-5xl md:text-6xl">
              Chăm sóc trọn vẹn từ spa đến chính ngôi nhà bạn
            </h1>

            <p className="text-lg leading-relaxed text-[#635B54] md:text-xl">
              Chúng tôi không bán lẻ đại trà. Mỗi dịch vụ chuyên sâu tại spa đều đi kèm một{' '}
              <strong className="font-medium text-[#405C4E]">toa chăm sóc tại nhà</strong> được cá
              nhân hóa dựa trên tình trạng da, mức độ căng thẳng và phản hồi thực tế của bạn.
            </p>

            <div className="flex w-full flex-col justify-center gap-4 pt-4 sm:w-auto sm:flex-row lg:justify-start">
              <Link href="/tu-van" className="w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-auto">
                  <Button size="lg" variant="primary" className="w-full shadow-md sm:w-auto">
                    Bắt đầu bài trắc nghiệm (3 phút)
                  </Button>
                </MagneticButton>
              </Link>
              <Link href="/trieu-chung" className="w-full sm:w-auto">
                <MagneticButton className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Tìm theo triệu chứng
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

        {/* 3 Trụ cột cốt lõi với 3D Tilt Cards & Phản quang */}
        <section className="mt-20">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-2xl font-bold text-[#2B2622] sm:text-3xl">
              Quy trình chăm sóc khép kín
            </h2>
            <p className="mt-2 text-sm text-[#635B54]">
              Liên kết chặt chẽ giữa buổi trị liệu trực tiếp và thói quen dưỡng tại nhà
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <TiltCard>
              <Card hoverable className="flex h-full flex-col justify-between">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5F3EB] text-sm font-bold text-[#2F6A4F]">
                      01
                    </span>
                    <Badge variant="secondary">Chẩn đoán khoa học</Badge>
                  </div>
                  <CardTitle>Trắc nghiệm chuyên sâu</CardTitle>
                  <CardDescription>
                    Khảo sát toàn diện về da, giấc ngủ, căng thẳng và triệu chứng cơ vai gáy với hệ
                    thống luật tất định minh bạch.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#635B54]">
                    Hệ thống tự động phát hiện cờ an toàn và chống chỉ định trước khi gợi ý liệu
                    trình.
                  </p>
                </CardContent>
              </Card>
            </TiltCard>

            <TiltCard>
              <Card hoverable className="flex h-full flex-col justify-between">
                <CardHeader>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4EAE4] text-sm font-bold text-[#B8714F]">
                      02
                    </span>
                    <Badge variant="terracotta">Túi liệu trình tích hợp</Badge>
                  </div>
                  <CardTitle>Một luồng duy nhất</CardTitle>
                  <CardDescription>
                    Gộp xác nhận lịch hẹn tại cơ sở và toa sản phẩm dưỡng tại nhà trong một bước xác
                    nhận duy nhất, không có giỏ hàng bán lẻ.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#635B54]">
                    Toa dưỡng chỉ kích hoạt khi đi kèm phác đồ chỉ định phù hợp từ kỹ thuật viên.
                  </p>
                </CardContent>
              </Card>
            </TiltCard>

            <TiltCard>
              <Card hoverable className="flex h-full flex-col justify-between">
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
                  <p className="text-sm text-[#635B54]">
                    Dòng thời gian rõ ràng, tái đánh giá định kỳ sau mỗi chu kỳ điều trị.
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
