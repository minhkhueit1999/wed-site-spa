export interface QuizChoice {
  id: string;
  label: string;
  weights: Record<string, number>; // slug -> score points (ví dụ: { 'mat-ngu': 3 })
  safetyFlags?: string[]; // ví dụ: ['pregnant']
}

export interface QuizQuestion {
  id: string;
  title: string;
  description?: string;
  choices: QuizChoice[];
  isSafetyCheck?: boolean;
}

export interface QuizBranch {
  id: 'skin' | 'stress-sleep' | 'muscle';
  name: string;
  description: string;
  questions: QuizQuestion[];
}

export const QUIZ_BRANCHES: Record<string, QuizBranch> = {
  skin: {
    id: 'skin',
    name: 'Khảo sát Tình trạng Da',
    description: 'Đánh giá mức độ nhạy cảm, cấp ẩm và sắc diện làn da của bạn.',
    questions: [
      {
        id: 'skin-1',
        title: 'Cảm giác làn da của bạn vào cuối ngày thường như thế nào?',
        choices: [
          { id: 's1-1', label: 'Căng rát, bong tróc hoặc thô ráp', weights: { 'da-kho': 3 } },
          {
            id: 's1-2',
            label: 'Dễ ửng đỏ, châm chích khi ra nắng hoặc gặp gió',
            weights: { 'da-kich-ung': 3 },
          },
          {
            id: 's1-3',
            label: 'Xỉn màu, kém tươi tắn và thiếu sức sống',
            weights: { 'da-xin-mau': 3 },
          },
          { id: 's1-4', label: 'Bình thường, chỉ cần dưỡng ẩm duy trì', weights: { 'da-kho': 1 } },
        ],
      },
      {
        id: 'skin-2',
        title: 'Khi thay đổi thời tiết hoặc đổi mỹ phẩm, da bạn phản ứng ra sao?',
        choices: [
          { id: 's2-1', label: 'Rất dễ nổi mẩn đỏ, ngứa ngáy', weights: { 'da-kich-ung': 4 } },
          { id: 's2-2', label: 'Khô ráp nhiều hơn, xuất hiện vảy mỏng', weights: { 'da-kho': 3 } },
          { id: 's2-3', label: 'Không có phản ứng gì đặc biệt', weights: {} },
        ],
      },
      {
        id: 'skin-safety',
        title: 'Bạn có đang trong các tình trạng đặc biệt dưới đây không?',
        isSafetyCheck: true,
        choices: [
          {
            id: 'sf-none',
            label: 'Không có tình trạng đặc biệt nào bên dưới',
            weights: {},
            safetyFlags: [],
          },
          {
            id: 'sf-pregnant',
            label: 'Đang mang thai hoặc cho con bú',
            weights: {},
            safetyFlags: ['pregnant'],
          },
          {
            id: 'sf-open-wound',
            label: 'Vùng da mặt/cổ có vết thương hở hoặc viêm nhiễm',
            weights: {},
            safetyFlags: ['open-wound-skin-infection'],
          },
          {
            id: 'sf-allergy',
            label: 'Có tiền sử dị ứng với các loại tinh dầu thực vật',
            weights: {},
            safetyFlags: ['allergy-essential-oil'],
          },
        ],
      },
    ],
  },
  'stress-sleep': {
    id: 'stress-sleep',
    name: 'Khảo sát Căng thẳng & Giấc ngủ',
    description: 'Đo lường chất lượng giấc ngủ và mức độ căng thẳng thần kinh.',
    questions: [
      {
        id: 'sleep-1',
        title: 'Mỗi tối bạn mất bao lâu để có thể đi vào giấc ngủ?',
        choices: [
          { id: 'sl1-1', label: 'Dưới 15 phút, ngủ dễ dàng', weights: { 'mat-ngu': 1 } },
          {
            id: 'sl1-2',
            label: 'Từ 30 đến 60 phút, trằn trọc suy nghĩ',
            weights: { 'mat-ngu': 3, 'cang-thang': 2 },
          },
          {
            id: 'sl1-3',
            label: 'Trên 1 tiếng hoặc thức trắng nhiều đêm',
            weights: { 'mat-ngu': 5, 'cang-thang': 4 },
          },
        ],
      },
      {
        id: 'sleep-2',
        title: 'Trong ngày, bạn cảm nhận mức độ áp lực tinh thần như thế nào?',
        choices: [
          { id: 'sl2-1', label: 'Thư thả, kiểm soát tốt công việc', weights: { 'cang-thang': 1 } },
          {
            id: 'sl2-2',
            label: 'Hay lo âu, nhức mỏi hai bên thái dương',
            weights: { 'cang-thang': 3 },
          },
          {
            id: 'sl2-3',
            label: 'Quá tải liên tục, tinh thần kiệt sức',
            weights: { 'cang-thang': 5 },
          },
        ],
      },
      {
        id: 'sleep-safety',
        title: 'Bạn có triệu chứng sốt hoặc đang mang thai không?',
        isSafetyCheck: true,
        choices: [
          { id: 'ss-none', label: 'Không có', weights: {}, safetyFlags: [] },
          { id: 'ss-pregnant', label: 'Đang mang thai', weights: {}, safetyFlags: ['pregnant'] },
          {
            id: 'ss-fever',
            label: 'Đang sốt hoặc ốm sốt cấp tính',
            weights: {},
            safetyFlags: ['fever-acute-illness'],
          },
        ],
      },
    ],
  },
  muscle: {
    id: 'muscle',
    name: 'Khảo sát Cơ Vai Gáy',
    description: 'Nhận diện tình trạng căng cơ cổ vai gáy và tuần hoàn vùng lưng trên.',
    questions: [
      {
        id: 'mus-1',
        title: 'Thời gian bạn ngồi làm việc cố định với màn hình mỗi ngày?',
        choices: [
          { id: 'm1-1', label: 'Dưới 4 giờ/ngày', weights: { 'moi-vai-gay': 1 } },
          { id: 'm1-2', label: 'Từ 4 đến 8 giờ/ngày', weights: { 'moi-vai-gay': 3 } },
          { id: 'm1-3', label: 'Trên 8 giờ/ngày, ít vận động', weights: { 'moi-vai-gay': 4 } },
        ],
      },
      {
        id: 'mus-2',
        title: 'Mức độ ê mỏi hoặc căng cứng ở vùng cổ vai gáy?',
        choices: [
          { id: 'm2-1', label: 'Thỉnh thoảng mới mỏi nhẹ', weights: { 'moi-vai-gay': 2 } },
          {
            id: 'm2-2',
            label: 'Mỏi ê ẩm hàng ngày, lan lên đỉnh đầu',
            weights: { 'moi-vai-gay': 4 },
          },
          { id: 'm2-3', label: 'Co cứng rõ rệt, quay cổ khó khăn', weights: { 'moi-vai-gay': 5 } },
        ],
      },
      {
        id: 'mus-safety',
        title: 'Kiểm tra tiền sử phẫu thuật hoặc chấn thương cột sống',
        isSafetyCheck: true,
        choices: [
          {
            id: 'ms-none',
            label: 'Không có tiền sử phẫu thuật gần đây',
            weights: {},
            safetyFlags: [],
          },
          {
            id: 'ms-surgery',
            label: 'Vừa phẫu thuật hoặc có chấn thương gần đây',
            weights: {},
            safetyFlags: ['recent-surgery'],
          },
        ],
      },
    ],
  },
};
