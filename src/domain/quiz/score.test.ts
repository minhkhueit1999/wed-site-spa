import { describe, it, expect } from 'vitest';
import { scoreQuiz } from './score';
import { QUIZ_BRANCHES, QuizBranch } from '@/data/quizzes';

describe('Quiz Scoring (tính điểm trắc nghiệm -> ConcernScore & safetyFlags)', () => {
  it('tính đúng điểm triệu chứng da và cờ an toàn khi chọn da kích ứng + mang thai', () => {
    const skinBranch = QUIZ_BRANCHES['skin']!;
    const answers = {
      'skin-1': 's1-2', // da-kich-ung: 3
      'skin-2': 's2-1', // da-kich-ung: 4 -> total 7 -> severity 5
      'skin-safety': 'sf-pregnant', // pregnant flag
    };

    const result = scoreQuiz(answers, skinBranch);

    expect(result.safetyFlags).toContain('pregnant');
    const kichUng = result.concernScores.find((c) => c.concernSlug === 'da-kich-ung');
    expect(kichUng).toBeDefined();
    expect(kichUng?.severity).toBe(5);
  });

  it('tính đúng cho các ngưỡng trọng số khác nhau (severity 1, 2, 3, 4)', () => {
    const mockBranch: QuizBranch = {
      id: 'skin',
      name: 'Test Branch',
      description: 'Test',
      questions: [
        {
          id: 'q1',
          title: 'Q1',
          choices: [
            { id: 'c1', label: '1 điểm', weights: { 'da-kho': 1 } },
            { id: 'c2', label: '2 điểm', weights: { 'da-kich-ung': 2 } },
            { id: 'c3', label: '3 điểm', weights: { 'cang-thang': 3 } },
            { id: 'c4', label: '4 điểm', weights: { 'mat-ngu': 4 } },
          ],
        },
      ],
    };

    const res1 = scoreQuiz({ q1: 'c1' }, mockBranch);
    expect(res1.concernScores.find((c) => c.concernSlug === 'da-kho')?.severity).toBe(1);

    const res2 = scoreQuiz({ q1: 'c2' }, mockBranch);
    expect(res2.concernScores.find((c) => c.concernSlug === 'da-kich-ung')?.severity).toBe(2);

    const res3 = scoreQuiz({ q1: 'c3' }, mockBranch);
    expect(res3.concernScores.find((c) => c.concernSlug === 'cang-thang')?.severity).toBe(3);

    const res4 = scoreQuiz({ q1: 'c4' }, mockBranch);
    expect(res4.concernScores.find((c) => c.concernSlug === 'mat-ngu')?.severity).toBe(4);
  });

  it('bỏ qua các câu hỏi chưa được trả lời hoặc choiceId không hợp lệ', () => {
    const skinBranch = QUIZ_BRANCHES['skin']!;
    const res = scoreQuiz({ 'invalid-question': 'invalid-choice' }, skinBranch);
    expect(res.concernScores.length).toBe(0);
    expect(res.safetyFlags.length).toBe(0);
  });
});
