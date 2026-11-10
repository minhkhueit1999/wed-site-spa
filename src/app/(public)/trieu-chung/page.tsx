'use client';

import * as React from 'react';
import Link from 'next/link';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Input,
} from '@/components/ui';
import { removeVietnameseTones, formatCurrencyVND } from '@/lib/utils';
import { AmbientBackground } from '@/components/canvas/AmbientBackground';
import { TiltCard } from '@/components/ui/TiltCard';

interface SolutionPackage {
  concernSlug: string;
  concernName: string;
  category: 'sleep-stress' | 'muscle' | 'skin';
  categoryLabel: string;
  description: string;
  service: {
    slug: string;
    name: string;
    durationMin: number;
    sessions: number;
    priceVnd: number;
  };
  homeCareProducts: Array<{
    name: string;
    description: string;
  }>;
}

const PACKAGES: SolutionPackage[] = [
  {
    concernSlug: 'mat-ngu',
    concernName: 'Khó ngủ, ngủ chập chờn',
    category: 'sleep-stress',
    categoryLabel: 'Giấc ngủ & Căng thẳng',
    description: 'Thao thức khó đi vào giấc ngủ, ngủ chập chờn hay giật mình, thức giấc mệt mỏi.',
    service: {
      slug: 'thu-gian-sau',
      name: 'Liệu trình thư giãn sâu & ngủ ngon',
      durationMin: 75,
      sessions: 6,
      priceVnd: 1200000,
    },
    homeCareProducts: [
      {
        name: 'Tinh dầu thư giãn buổi tối',
        description: 'Oải hương & cam ngọt hữu cơ làm dịu thần kinh',
      },
      {
        name: 'Trà thảo mộc an thần buổi tối',
        description: 'Cúc la mã và tim sen sao vàng giúp giấc ngủ sâu',
      },
    ],
  },
  {
    concernSlug: 'cang-thang',
    concernName: 'Căng thẳng kéo dài',
    category: 'sleep-stress',
    categoryLabel: 'Giấc ngủ & Căng thẳng',
    description: 'Áp lực công việc, nhức mỏi thái dương, cảm giác kiệt sức tinh thần kéo dài.',
    service: {
      slug: 'thu-gian-sau',
      name: 'Liệu trình thư giãn sâu & ngủ ngon',
      durationMin: 75,
      sessions: 6,
      priceVnd: 1200000,
    },
    homeCareProducts: [
      {
        name: 'Tinh dầu thư giãn buổi tối',
        description: 'Liệu pháp mùi hương tái tạo cân bằng cảm xúc',
      },
    ],
  },
  {
    concernSlug: 'moi-vai-gay',
    concernName: 'Mỏi vai gáy',
    category: 'muscle',
    categoryLabel: 'Cơ vai gáy',
    description:
      'Co thắt và căng cứng cơ vùng cổ, bả vai và lưng trên do ngồi máy tính thời gian dài.',
    service: {
      slug: 'giai-toa-vai-gay',
      name: 'Liệu trình giải tỏa vai gáy',
      durationMin: 60,
      sessions: 6,
      priceVnd: 950000,
    },
    homeCareProducts: [
      {
        name: 'Dầu massage ấm vai gáy thảo mộc',
        description: 'Gừng gió & tràm ấm sâu tuần hoàn khí huyết',
      },
      {
        name: 'Miếng dán thảo dược ấm vai gáy',
        description: 'Duy trì nhiệt ấm 40°C giảm co cứng cơ 6 giờ',
      },
    ],
  },
  {
    concernSlug: 'da-kich-ung',
    concernName: 'Da dễ kích ứng, nhạy cảm',
    category: 'skin',
    categoryLabel: 'Chăm sóc Da',
    description: 'Da mỏng yếu, dễ ửng đỏ, châm chích khi đổi thời tiết hoặc tiếp xúc mỹ phẩm lạ.',
    service: {
      slug: 'phuc-hoi-da-nhay-cam',
      name: 'Liệu trình phục hồi da nhạy cảm',
      durationMin: 75,
      sessions: 8,
      priceVnd: 1350000,
    },
    homeCareProducts: [
      {
        name: 'Serum phục hồi dịu nhẹ B5 & Rau má',
        description: 'Tái tạo hàng rào bảo vệ màng sinh học da',
      },
      { name: 'Kem dưỡng ẩm không hương liệu', description: 'Khóa ẩm dịu nhẹ, không gây bít tắc' },
    ],
  },
  {
    concernSlug: 'da-kho',
    concernName: 'Da khô, thiếu ẩm',
    category: 'skin',
    categoryLabel: 'Chăm sóc Da',
    description: 'Bề mặt da thô ráp, thiếu độ đàn hồi tự nhiên và dễ bong tróc.',
    service: {
      slug: 'cap-am-sang-da',
      name: 'Liệu trình cấp ẩm & làm sáng da',
      durationMin: 60,
      sessions: 6,
      priceVnd: 1100000,
    },
    homeCareProducts: [
      { name: 'Kem dưỡng ẩm không hương liệu', description: 'Ceramide củng cố tầng dưỡng ẩm sâu' },
    ],
  },
  {
    concernSlug: 'da-xin-mau',
    concernName: 'Da xỉn màu, thiếu sức sống',
    category: 'skin',
    categoryLabel: 'Chăm sóc Da',
    description:
      'Sắc diện sạm xỉn, không đều màu do thức khuya và tiếp xúc ánh sáng xanh liên tục.',
    service: {
      slug: 'cap-am-sang-da',
      name: 'Liệu trình cấp ẩm & làm sáng da',
      durationMin: 60,
      sessions: 6,
      priceVnd: 1100000,
    },
    homeCareProducts: [
      { name: 'Serum phục hồi dịu nhẹ B5', description: 'Nuôi dưỡng tế bào da tươi sáng tự nhiên' },
    ],
  },
];

export default function TrieuChungPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  const filteredPackages = React.useMemo(() => {
    const normalizedQuery = removeVietnameseTones(searchTerm);

    return PACKAGES.filter((pkg) => {
      // Lọc danh mục
      if (selectedCategory !== 'all' && pkg.category !== selectedCategory) {
        return false;
      }

      // Tìm kiếm không phân biệt có dấu / không dấu
      if (!normalizedQuery) return true;

      const normalizedName = removeVietnameseTones(pkg.concernName);
      const normalizedSlug = removeVietnameseTones(pkg.concernSlug.replace(/-/g, ' '));
      const normalizedDesc = removeVietnameseTones(pkg.description);
      const normalizedService = removeVietnameseTones(pkg.service.name);

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedSlug.includes(normalizedQuery) ||
        normalizedDesc.includes(normalizedQuery) ||
        normalizedService.includes(normalizedQuery)
      );
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="relative flex min-h-screen flex-col bg-[#FAF7F2]">
      {/* Nền động WebGL gợn sóng mặt nước */}
      <AmbientBackground variant="zen-water" />
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        {/* Tiêu đề & Thông điệp */}
        <div className="mb-10 max-w-2xl">
          <Badge variant="terracotta" className="mb-2">
            Tìm kiếm theo vấn đề thực tế
          </Badge>
          <h1 className="font-serif text-3xl font-bold text-[#2B2622] sm:text-4xl">
            Giải pháp trọn gói theo triệu chứng
          </h1>
          <p className="mt-2 text-[#635B54]">
            Thay cho bộ lọc danh mục sản phẩm bán lẻ, chúng tôi liên kết triệu chứng của bạn trực
            tiếp với một phác đồ tại spa và bộ sản phẩm hướng dẫn dùng tại nhà.
          </p>
        </div>

        {/* Bộ lọc & Tìm kiếm */}
        <div className="mb-8 space-y-4">
          <Input
            id="symptom-search"
            aria-label="Tìm kiếm theo triệu chứng"
            placeholder="Tìm theo triệu chứng: mất ngủ, mỏi vai gáy, da kích ứng, da khô..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 border-[#E2D9CC] bg-[#F3EDE3] text-base"
          />

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-semibold text-[#635B54]">Nhóm:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'sleep-stress', label: 'Giấc ngủ & Căng thẳng' },
              { id: 'muscle', label: 'Cơ vai gáy' },
              { id: 'skin', label: 'Chăm sóc Da' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#405C4E] text-[#FAF7F2]'
                    : 'border border-[#E2D9CC] bg-[#F3EDE3] text-[#2B2622] hover:bg-[#EAE1D3]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách kết quả gói giải pháp */}
        {filteredPackages.length === 0 ? (
          <div className="my-8 rounded-2xl border border-[#E2D9CC] bg-[#F3EDE3] p-12 text-center">
            <p className="font-serif text-lg text-[#2B2622]">
              Không tìm thấy gói giải pháp phù hợp
            </p>
            <p className="mt-2 mb-6 text-sm text-[#635B54]">
              Bạn có thể làm bài trắc nghiệm đầy đủ để chúng tôi khảo sát sâu hơn về thể trạng.
            </p>
            <Link href="/tu-van">
              <Button variant="primary">Làm bài trắc nghiệm ngay</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {filteredPackages.map((pkg) => (
              <TiltCard key={pkg.concernSlug}>
                <Card hoverable className="flex h-full flex-col justify-between">
                  <div>
                    <CardHeader>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <Badge variant="secondary">{pkg.categoryLabel}</Badge>
                        <span className="text-xs text-[#635B54]">
                          {pkg.service.sessions} buổi đề xuất
                        </span>
                      </div>
                      <CardTitle className="text-xl sm:text-2xl">{pkg.concernName}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Phần phác đồ tại spa */}
                      <div className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-bold tracking-wider text-[#405C4E] uppercase">
                            Phác đồ tại Spa (Offline)
                          </span>
                          <span className="text-xs text-[#635B54]">
                            {pkg.service.durationMin} phút/buổi
                          </span>
                        </div>
                        <p className="text-base font-semibold text-[#2B2622]">{pkg.service.name}</p>
                        <p className="mt-1 text-xs text-[#635B54]">
                          Chi phí mô phỏng: {formatCurrencyVND(pkg.service.priceVnd)}/buổi
                        </p>
                      </div>

                      {/* Phần toa tại nhà đi kèm */}
                      <div className="rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4">
                        <span className="mb-2 block text-xs font-bold tracking-wider text-[#B8714F] uppercase">
                          Toa chăm sóc tại nhà đi kèm (Online)
                        </span>
                        <ul className="space-y-2">
                          {pkg.homeCareProducts.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <span className="mt-0.5 font-bold text-[#405C4E]">•</span>
                              <div>
                                <strong className="text-[#2B2622]">{p.name}</strong>
                                <p className="text-[11px] text-[#635B54]">{p.description}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </div>

                  <CardFooter className="flex flex-col gap-3 border-t border-[#E2D9CC] pt-4 sm:flex-row">
                    <Link href={`/dich-vu/${pkg.service.slug}`} className="w-full sm:w-1/2">
                      <Button variant="outline" size="sm" className="w-full">
                        Chi tiết phác đồ
                      </Button>
                    </Link>
                    <Link href={`/tu-van?branch=${pkg.category}`} className="w-full sm:w-1/2">
                      <Button variant="primary" size="sm" className="w-full">
                        Làm trắc nghiệm
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </TiltCard>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
