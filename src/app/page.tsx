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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2622]">
      {/* Thanh điều hướng tối giản */}
      <header className="sticky top-0 z-40 border-b border-[#E2D9CC] bg-[#FAF7F2]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-[#405C4E]">
            Digital Wellness Platform
          </Link>
          <nav className="flex items-center gap-4">
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
                Trắc nghiệm ngay
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6 text-center">
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

          <div className="flex w-full flex-col justify-center gap-4 pt-4 sm:w-auto sm:flex-row">
            <Link href="/tu-van" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                Bắt đầu bài trắc nghiệm (3 phút)
              </Button>
            </Link>
            <Link href="/trieu-chung" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Tìm theo triệu chứng
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Trụ cột cốt lõi */}
        <section className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card hoverable className="flex flex-col justify-between">
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
                Hệ thống tự động phát hiện cờ an toàn và chống chỉ định trước khi gợi ý liệu trình.
              </p>
            </CardContent>
          </Card>

          <Card hoverable className="flex flex-col justify-between">
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

          <Card hoverable className="flex flex-col justify-between">
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
        </section>
      </main>

      {/* Chân trang */}
      <footer className="mt-auto border-t border-[#E2D9CC] bg-[#F3EDE3] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-[#635B54] sm:flex-row">
          <p>© 2026 Digital Wellness Platform. Đồ án xây dựng theo chuẩn kỹ thuật cao cấp.</p>
          <div className="flex gap-6">
            <span>Tiếng Việt</span>
            <span>WCAG 2.2 AA</span>
            <span>RAG AI minh bạch nguồn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
