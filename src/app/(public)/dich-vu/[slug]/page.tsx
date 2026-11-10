import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/infrastructure/db/prisma';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from '@/components/ui';
import { formatCurrencyVND } from '@/lib/utils';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const services = await prisma.service.findMany({
      select: { slug: true },
    });
    return services.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) {
    return {
      title: 'Không tìm thấy dịch vụ — Digital Wellness Platform',
    };
  }

  return {
    title: `${service.name} — Phác đồ & Toa chăm sóc tại nhà`,
    description: service.description,
    openGraph: {
      title: service.name,
      description: service.description,
      type: 'website',
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;

  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      serviceProducts: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!service || !service.active) {
    notFound();
  }

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'HealthAndBeautyBusiness',
      name: 'Digital Wellness Platform',
    },
    offers: {
      '@type': 'Offer',
      price: service.priceVnd,
      priceCurrency: 'VND',
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-6 py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Đường dẫn trang"
          className="flex items-center gap-2 text-xs text-[#635B54]"
        >
          <Link href="/" className="hover:text-[#405C4E]">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/trieu-chung" className="hover:text-[#405C4E]">
            Triệu chứng &amp; Dịch vụ
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#2B2622]">{service.name}</span>
        </nav>

        {/* Hero Dịch vụ */}
        <div className="max-w-3xl space-y-4">
          <Badge variant="primary" className="text-xs tracking-wider uppercase">
            Phác đồ chuyên khoa tại Spa
          </Badge>
          <h1 className="font-serif text-3xl leading-tight font-bold text-[#2B2622] sm:text-4xl md:text-5xl">
            {service.name}
          </h1>
          <p className="text-lg leading-relaxed text-[#635B54]">{service.description}</p>

          <div className="flex flex-wrap gap-6 pt-2 text-sm text-[#2B2622]">
            <div className="rounded-xl border border-[#E2D9CC] bg-[#F3EDE3] px-4 py-2">
              <span className="block text-xs text-[#635B54]">Thời lượng buổi:</span>
              <strong>{service.durationMin} phút</strong>
            </div>
            <div className="rounded-xl border border-[#E2D9CC] bg-[#F3EDE3] px-4 py-2">
              <span className="block text-xs text-[#635B54]">Lộ trình khuyến nghị:</span>
              <strong>{service.sessionsRecommended} buổi chuyên sâu</strong>
            </div>
            <div className="rounded-xl border border-[#E2D9CC] bg-[#F3EDE3] px-4 py-2">
              <span className="block text-xs text-[#635B54]">Chi phí mô phỏng:</span>
              <strong className="text-[#405C4E]">
                {formatCurrencyVND(service.priceVnd)} / buổi
              </strong>
            </div>
          </div>
        </div>

        {/* Hành động đặt lịch & Kiểm tra */}
        <div className="flex flex-col gap-4 pt-2 sm:flex-row">
          <Link href={`/tui-lieu-trinh?serviceSlug=${service.slug}`}>
            <Button size="lg" variant="primary" className="w-full sm:w-auto">
              Đặt túi liệu trình ngay →
            </Button>
          </Link>
          <Link href={`/tu-van`}>
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Làm trắc nghiệm kiểm tra độ phù hợp
            </Button>
          </Link>
        </div>

        {/* Toa chăm sóc tại nhà đi kèm */}
        <section className="space-y-4 pt-6">
          <div className="border-b border-[#E2D9CC] pb-3">
            <h2 className="font-serif text-2xl font-bold text-[#2B2622]">
              Toa chăm sóc tại nhà đi kèm phác đồ
            </h2>
            <p className="mt-1 text-xs text-[#635B54] sm:text-sm">
              Sản phẩm đóng vai trò là toa dưỡng phối hợp, giúp duy trì hiệu quả giữa các buổi trị
              liệu tại spa. Chúng tôi không bán lẻ các sản phẩm này bên ngoài.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {service.serviceProducts.map((sp) => (
              <Card
                key={sp.productSlug}
                className="flex flex-col justify-between border-[#E2D9CC] bg-[#F3EDE3]"
              >
                <div>
                  <CardHeader>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Badge variant="terracotta">Toa chỉ định</Badge>
                      <span className="text-xs font-medium text-[#635B54]">
                        {formatCurrencyVND(sp.product.priceVnd)}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{sp.product.name}</CardTitle>
                    <CardDescription>{sp.product.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-3 text-xs text-[#405C4E]">
                      <strong>Hướng dẫn dùng:</strong> {sp.product.usageGuide}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Lưu ý an toàn & Chống chỉ định */}
        <section className="space-y-3 rounded-2xl border border-[#E2D9CC] bg-[#F3EDE3] p-6">
          <h3 className="font-serif text-lg font-semibold text-[#2B2622]">
            Lưu ý an toàn &amp; Khuyến cáo chuyên môn
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-xs text-[#635B54]">
            <li>
              Khách hàng đang mang thai hoặc có chấn thương cột sống cần thông báo để KTV điều chỉnh
              lực ấn nhẹ nhàng.
            </li>
            <li>
              Trường hợp sốt hoặc viêm da cấp tính cần dời lịch hẹn để cơ thể nghỉ ngơi phục hồi.
            </li>
            <li>
              Mọi liệu trình đều được theo dõi và ghi nhật ký tiến triển sau từng buổi trên tài
              khoản khách hàng.
            </li>
          </ul>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
