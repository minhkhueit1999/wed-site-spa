'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Stepper,
  Badge,
} from '@/components/ui';
import { QUIZ_BRANCHES, QuizBranch } from '@/data/quizzes';
import { submitAssessment } from '@/application/assessment/submitAssessment';

function TuVanWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Chọn nhánh: skin | stress-sleep | muscle (mặc định lấy từ query hoặc skin)
  const initialBranchParam = searchParams.get('branch');
  const validBranch =
    initialBranchParam === 'stress-sleep' ||
    initialBranchParam === 'muscle' ||
    initialBranchParam === 'skin'
      ? initialBranchParam
      : 'skin';

  const [selectedBranchId, setSelectedBranchId] = React.useState<
    'skin' | 'stress-sleep' | 'muscle'
  >(validBranch);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`spa_quiz_answers_${validBranch}`);
        return saved ? JSON.parse(saved) : {};
      } catch {
        // Bỏ qua lỗi truy cập storage
      }
    }
    return {};
  });
  const [consentGiven, setConsentGiven] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const activeBranch: QuizBranch = QUIZ_BRANCHES[selectedBranchId]!;
  const currentQuestion = activeBranch.questions[currentStepIndex];
  const isLastQuestion = currentStepIndex === activeBranch.questions.length - 1;

  // Lưu tạm đáp án vào localStorage khi người dùng chọn
  const handleSelectChoice = (questionId: string, choiceId: string) => {
    const updated = { ...answers, [questionId]: choiceId };
    setAnswers(updated);
    setErrorMsg(null);
    try {
      localStorage.setItem(`spa_quiz_answers_${selectedBranchId}`, JSON.stringify(updated));
    } catch {
      // Bỏ qua lỗi
    }
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    if (!answers[currentQuestion.id]) {
      setErrorMsg('Vui lòng chọn một câu trả lời trước khi chuyển sang bước tiếp theo.');
      return;
    }

    setErrorMsg(null);
    if (!isLastQuestion) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    if (!answers[currentQuestion.id]) {
      setErrorMsg('Vui lòng chọn đáp án cho câu hỏi này.');
      return;
    }

    if (!consentGiven) {
      setErrorMsg('Bạn cần đồng ý lưu trữ và xử lý dữ liệu trước khi gửi khảo sát.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await submitAssessment({
      branchId: selectedBranchId,
      answers,
      consentGiven: true,
    });

    setIsSubmitting(false);

    if (result.ok) {
      // Xoá lưu tạm sau khi gửi thành công
      try {
        localStorage.removeItem(`spa_quiz_answers_${selectedBranchId}`);
      } catch {
        // Bỏ qua
      }

      // Đưa dữ liệu điểm số và cờ an toàn sang trang kết quả qua sessionStorage hoặc URL
      const payload = {
        branchId: selectedBranchId,
        concernScores: result.value.concernScores,
        safetyFlags: result.value.safetyFlags,
        assessmentId: result.value.assessmentId,
      };

      try {
        sessionStorage.setItem('spa_assessment_result', JSON.stringify(payload));
      } catch {
        // Bỏ qua
      }

      router.push('/ket-qua');
    } else {
      setErrorMsg(result.error);
    }
  };

  const stepperSteps = activeBranch.questions.map((q, idx) => ({
    id: q.id,
    title: `Câu ${idx + 1}`,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      <PublicHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        {/* Lựa chọn nhánh khảo sát */}
        <div className="mb-8">
          <Badge variant="terracotta" className="mb-2">
            Khảo sát cá nhân hóa
          </Badge>
          <h1 className="font-serif text-3xl font-bold text-[#2B2622] sm:text-4xl">
            Trắc nghiệm chẩn đoán thể trạng
          </h1>
          <p className="mt-2 text-sm text-[#635B54]">
            Hệ thống quy chuẩn hóa triệu chứng và tự động ghép phác đồ dịch vụ kèm toa dưỡng tại
            nhà.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: 'skin', label: 'Tình trạng Da' },
              { id: 'stress-sleep', label: 'Căng thẳng & Giấc ngủ' },
              { id: 'muscle', label: 'Cơ Vai Gáy' },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  const nextBranch = b.id as 'skin' | 'stress-sleep' | 'muscle';
                  setSelectedBranchId(nextBranch);
                  setCurrentStepIndex(0);
                  setErrorMsg(null);
                  try {
                    const saved = localStorage.getItem(`spa_quiz_answers_${nextBranch}`);
                    setAnswers(saved ? JSON.parse(saved) : {});
                  } catch {
                    setAnswers({});
                  }
                }}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  selectedBranchId === b.id
                    ? 'bg-[#405C4E] text-[#FAF7F2] shadow-sm'
                    : 'border border-[#E2D9CC] bg-[#F3EDE3] text-[#2B2622] hover:bg-[#EAE1D3]'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Thanh tiến độ Stepper */}
        <div className="mb-8 rounded-2xl border border-[#E2D9CC] bg-[#F3EDE3] p-4">
          <Stepper steps={stepperSteps} currentStepIndex={currentStepIndex} />
        </div>

        {/* Thẻ câu hỏi hiện tại */}
        {currentQuestion && (
          <Card className="border-[#E2D9CC] shadow-md">
            <CardHeader>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider text-[#405C4E] uppercase">
                  Câu hỏi {currentStepIndex + 1} / {activeBranch.questions.length}
                </span>
                {currentQuestion.isSafetyCheck && (
                  <Badge variant="warning">Kiểm tra an toàn & Chống chỉ định</Badge>
                )}
              </div>
              <CardTitle className="text-xl leading-snug sm:text-2xl">
                {currentQuestion.title}
              </CardTitle>
              {currentQuestion.description && (
                <CardDescription>{currentQuestion.description}</CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-3 pt-2">
              {currentQuestion.choices.map((choice) => {
                const isSelected = answers[currentQuestion.id] === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => handleSelectChoice(currentQuestion.id, choice.id)}
                    className={`flex min-h-[52px] w-full items-center justify-between rounded-xl border p-4 text-left transition-all duration-150 ${
                      isSelected
                        ? 'border-[#405C4E] bg-[#E5F3EB] font-medium text-[#2D4137] shadow-xs'
                        : 'border-[#E2D9CC] bg-[#FAF7F2] text-[#2B2622] hover:bg-[#F3EDE3]'
                    }`}
                  >
                    <span className="text-sm leading-relaxed sm:text-base">{choice.label}</span>
                    <span
                      className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? 'border-[#405C4E] bg-[#405C4E] text-[#FAF7F2]'
                          : 'border-[#E2D9CC] bg-white'
                      }`}
                    >
                      {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}

              {/* Điều khoản đồng ý dữ liệu ở câu cuối cùng */}
              {isLastQuestion && (
                <div className="mt-6 space-y-2 rounded-xl border border-[#E2D9CC] bg-[#FAF7F2] p-4 text-xs">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="quiz-consent"
                      checked={consentGiven}
                      onChange={(e) => {
                        setConsentGiven(e.target.checked);
                        setErrorMsg(null);
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-[#E2D9CC] text-[#405C4E] focus:ring-[#405C4E]"
                    />
                    <label
                      htmlFor="quiz-consent"
                      className="cursor-pointer leading-relaxed font-medium text-[#2B2622]"
                    >
                      Tôi đồng ý để hệ thống lưu tạm và phân tích các triệu chứng trên nhằm xuất kết
                      quả gợi ý phác đồ cá nhân hóa (tuân thủ quyền riêng tư dữ liệu sức khỏe).
                    </label>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-[#9E3838]/20 bg-[#FDECEC] p-3 text-sm text-[#9E3838]"
                >
                  {errorMsg}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-[#E2D9CC] pt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="text-[#635B54]"
              >
                ← Quay lại
              </Button>

              {isLastQuestion ? (
                <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
                  Xem kết quả gợi ý
                </Button>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  Tiếp theo →
                </Button>
              )}
            </CardFooter>
          </Card>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

export default function TuVanPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2] p-8 text-[#635B54]">
          Đang tải trắc nghiệm...
        </div>
      }
    >
      <TuVanWizard />
    </React.Suspense>
  );
}
