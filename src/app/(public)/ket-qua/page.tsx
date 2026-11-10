'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { AssistantChatWidget } from '@/components/features/AssistantChatWidget';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
} from '@/components/ui';
import {
  generateRecommendation,
  DetailedRecommendation,
} from '@/application/recommendation/generateRecommendation';
import { formatCurrencyVND } from '@/lib/utils';
import { ConcernScore } from '@/domain/recommendation/types';

export default function KetQuaPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = React.useState<DetailedRecommendation[]>([]);
  const [safetyFlags, setSafetyFlags] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadResults() {
      setIsLoading(true);
      try {
        let scores: ConcernScore[] = [];
        let flags: string[] = [];

        // Đọc kết quả khảo sát từ sessionStorage
        const saved = sessionStorage.getItem('spa_assessment_result');
        if (saved) {
          const parsed = JSON.parse(saved);
          scores = parsed.concernScores || [];
          flags = parsed.safetyFlags || [];
        } else {
          // Dữ liệu mẫu ban đầu nếu truy cập trực tiếp
          scores = [{ concernSlug: 'mat-ngu', severity: 3 }];
          flags = [];
        }

        setSafetyFlags(flags);

        const res = await generateRecommendation({
          scores,
          safetyFlags: flags,
        });

        if (res.ok) {
          setRecommendations(res.value);
        } else {
          setError(res.error);
        }
      } catch {
        setError('Không thể xử lý kết quả khảo sát. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    }

    loadResults();
  }, []);

  const handleBookPlan = (serviceSlug: string) => {
    router.push(`/tui-lieu-trinh?serviceSlug=${serviceSlug}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        {/* Tiêu đề trang */}
        <div className="mb-8 max-w-2xl">
          <Badge variant="terracotta" className="mb-2">
            Kết quả phân tích cá nhân
          </Badge>
          <h1 className="font-serif text-3xl font-bold text-[#2B2622] sm:text-4xl">
            Phác đồ điều trị &amp; Toa chăm sóc đề xuất
          </h1>
          <p className="mt-2 text-sm text-[#635B54]">
            Dựa trên các chỉ số bạn đã chia sẻ, hệ thống tính toán tất định theo phác đồ spa chuẩn
            khoa học, kết hợp dịch vụ tại cơ sở và toa dưỡng tại nhà trong một chu trình khép kín.
          </p>
        </div>

        {/* Cảnh báo an toàn / Chống chỉ định nếu có cờ */}
        {safetyFlags.length > 0 && (
          <div
            role="alert"
            className="mb-8 space-y-2 rounded-2xl border border-[#9E6700]/30 bg-[#FEF5E7] p-5 text-sm text-[#9E6700]"
          >
            <div className="flex items-center gap-2 text-base font-semibold">
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Lưu ý an toàn &amp; Chống chỉ định theo hồ sơ của bạn</span>
            </div>
            <p className="text-xs leading-relaxed text-[#635B54]">
              Hệ thống đã nhận diện các cờ sức khỏe đặc biệt (ví dụ: đang mang thai, dị ứng tinh
              dầu...). Các sản phẩm và dịch vụ xung đột đã được tự động loại bỏ để bảo vệ an toàn
              tối đa cho bạn.
            </p>
          </div>
        )}

        {/* 1. Trạng thái Loading */}
        {isLoading && (
          <div className="my-8 rounded-2xl border border-[#E2D9CC] bg-[#F3EDE3] p-12 text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#405C4E] border-r-transparent" />
            <p className="font-serif text-lg text-[#2B2622]">
              Đang chạy Rule Engine phân tích kết quả...
            </p>
            <p className="mt-1 text-xs text-[#635B54]">
              Đang đối chiếu chống chỉ định và chuẩn hóa toa tại nhà
            </p>
          </div>
        )}

        {/* 2. Trạng thái Lỗi */}
        {!isLoading && error && (
          <div className="my-8 rounded-2xl border border-[#9E3838]/20 bg-[#FDECEC] p-8 text-center">
            <p className="font-serif text-lg text-[#9E3838]">Đã xảy ra sự cố</p>
            <p className="mt-2 mb-4 text-sm text-[#635B54]">{error}</p>
            <Link href="/tu-van">
              <Button variant="primary">Làm lại bài trắc nghiệm</Button>
            </Link>
          </div>
        )}

        {/* 3. Trạng thái Trống (không có rule khớp) */}
        {!isLoading && !error && recommendations.length === 0 && (
          <div className="my-8 rounded-2xl border border-[#E2D9CC] bg-[#F3EDE3] p-10 text-center">
            <p className="font-serif text-xl text-[#2B2622]">Cần tư vấn trực tiếp từ chuyên viên</p>
            <p className="mx-auto mt-2 mb-6 max-w-md text-sm text-[#635B54]">
              Tình trạng triệu chứng của bạn cần sự thăm khám và điều chỉnh trực tiếp từ kỹ thuật
              viên trước khi lên phác đồ điều trị cụ thể.
            </p>
            <Link href="/trieu-chung">
              <Button variant="primary">Khám phá các triệu chứng phổ biến</Button>
            </Link>
          </div>
        )}

        {/* 4. Trạng thái Thành công: Danh sách gợi ý */}
        {!isLoading && !error && recommendations.length > 0 && (
          <div className="space-y-10">
            {recommendations.map((rec, index) => {
              const isTop = index === 0;

              return (
                <Card
                  key={rec.service.slug}
                  className={`overflow-hidden border transition-all ${
                    isTop
                      ? 'border-[#405C4E] bg-[#FAF7F2] shadow-lg ring-2 ring-[#405C4E]/20'
                      : 'border-[#E2D9CC] bg-[#F3EDE3]'
                  }`}
                >
                  <CardHeader className="border-b border-[#E2D9CC] bg-[#F3EDE3] p-6">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isTop && (
                          <Badge variant="primary" className="text-xs uppercase">
                            Gợi ý tối ưu nhất (Độ khớp: {rec.score} điểm)
                          </Badge>
                        )}
                        {rec.requiresStaffReview && (
                          <Badge variant="warning">Cần KTV duyệt lại</Badge>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[#405C4E]">
                        {rec.service.sessionsRecommended} buổi điều trị đề xuất
                      </span>
                    </div>

                    <CardTitle className="text-2xl text-[#2B2622] sm:text-3xl">
                      {rec.service.name}
                    </CardTitle>
                    <CardDescription className="text-base text-[#635B54]">
                      {rec.service.description}
                    </CardDescription>

                    <div className="flex flex-wrap gap-4 pt-3 text-xs text-[#635B54]">
                      <span>
                        ⏱ Thời lượng: <strong>{rec.service.durationMin} phút / buổi</strong>
                      </span>
                      <span>
                        💰 Chi phí mô phỏng:{' '}
                        <strong>{formatCurrencyVND(rec.service.priceVnd)} / buổi</strong>
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 p-6">
                    {/* Khối 'Vì sao bạn được gợi ý điều này' */}
                    <div className="rounded-xl border border-[#405C4E]/20 bg-[#E5F3EB] p-4">
                      <h4 className="mb-2 flex items-center gap-2 font-serif text-base font-semibold text-[#2D4137]">
                        <svg
                          className="h-5 w-5 text-[#405C4E]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Vì sao bạn được gợi ý phác đồ này?
                      </h4>
                      <ul className="space-y-1.5 text-xs text-[#2D4137] sm:text-sm">
                        {rec.reasons.map((r) => (
                          <li key={r.ruleId} className="flex items-start gap-2">
                            <span className="font-bold">•</span>
                            <span>{r.text}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-[11px] text-[#635B54] italic">
                        * Gợi ý dựa trên hệ thống luật tất định chuyên khoa. Không thay thế chẩn
                        đoán y khoa.
                      </p>
                    </div>

                    {/* Danh sách Toa chăm sóc tại nhà đi kèm */}
                    <div>
                      <h4 className="mb-3 flex items-center justify-between font-serif text-lg font-semibold text-[#2B2622]">
                        <span>Toa chăm sóc tại nhà đi kèm</span>
                        <span className="font-sans text-xs font-normal text-[#635B54]">
                          (Kích hoạt cùng phác đồ, không bán lẻ)
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {rec.products.map((prod) => (
                          <div
                            key={prod.slug}
                            className="flex flex-col justify-between rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-sm font-semibold text-[#2B2622]">
                                  {prod.name}
                                </h5>
                                <span className="shrink-0 text-xs font-medium text-[#B8714F]">
                                  {formatCurrencyVND(prod.priceVnd)}
                                </span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-xs text-[#635B54]">
                                {prod.description}
                              </p>
                            </div>
                            <div className="mt-3 border-t border-[#E2D9CC]/60 pt-2 text-[11px] text-[#405C4E]">
                              <strong>Cách dùng:</strong> {prod.usageGuide}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col items-center justify-between gap-4 border-t border-[#E2D9CC] bg-[#F3EDE3] p-6 sm:flex-row">
                    <div className="text-xs text-[#635B54]">
                      Gộp lịch hẹn và toa tại nhà vào một quy trình xác nhận duy nhất.
                    </div>
                    <div className="flex w-full items-center gap-3 sm:w-auto">
                      <Link href={`/dich-vu/${rec.service.slug}`} className="w-full sm:w-auto">
                        <Button variant="secondary" size="md" className="w-full sm:w-auto">
                          Xem chi tiết dịch vụ
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleBookPlan(rec.service.slug)}
                        className="w-full sm:w-auto"
                      >
                        Đặt túi liệu trình này →
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}

            {/* Trợ lý tư vấn AI (RAG Assistant) có trích nguồn */}
            <div className="mt-8">
              <AssistantChatWidget
                embedded={true}
                context={{
                  serviceSlug: recommendations[0]?.service.slug,
                  productSlugs: recommendations[0]?.products.map((p) => p.slug),
                }}
              />
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
