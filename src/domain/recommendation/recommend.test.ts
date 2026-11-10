import { describe, it, expect } from 'vitest';
import { recommend } from './recommend';
import { RecommendationCatalog } from './types';

const mockCatalog: RecommendationCatalog = {
  rules: [
    {
      id: 'R-001',
      concernSlug: 'mat-ngu',
      minSeverity: 2,
      serviceSlug: 'thu-gian-sau',
      productSlugs: ['tinh-dau-thu-gian', 'tra-thao-moc-toi'],
      priority: 5,
      rationale: 'Hỗ trợ giấc ngủ sâu tự nhiên.',
      active: true,
    },
    {
      id: 'R-002',
      concernSlug: 'cang-thang',
      minSeverity: 3,
      serviceSlug: 'thu-gian-sau',
      productSlugs: ['tinh-dau-thu-gian'],
      priority: 4,
      rationale: 'Giảm căng thẳng mệt mỏi.',
      active: true,
    },
    {
      id: 'R-003',
      concernSlug: 'moi-vai-gay',
      minSeverity: 2,
      serviceSlug: 'giai-toa-vai-gay',
      productSlugs: ['dau-massage-vai-gay', 'mieng-dan-nhiet'],
      priority: 5,
      rationale: 'Giải tỏa cơ cổ vai gáy.',
      active: true,
    },
    {
      id: 'R-004',
      concernSlug: 'da-kich-ung',
      minSeverity: 2,
      serviceSlug: 'phuc-hoi-da-nhay-cam',
      productSlugs: ['serum-phuc-hoi', 'kem-duong-am'],
      priority: 6,
      rationale: 'Làm dịu da nhạy cảm.',
      active: true,
    },
    {
      id: 'R-005',
      concernSlug: 'da-kho',
      minSeverity: 2,
      serviceSlug: 'cap-am-sang-da',
      productSlugs: ['kem-duong-am'],
      priority: 4,
      rationale: 'Cấp ẩm sâu cho da.',
      active: true,
    },
  ],
  contraindications: [
    {
      flag: 'pregnant',
      blocksServiceSlugs: ['thu-gian-sau'],
      blocksProductSlugs: ['tinh-dau-thu-gian', 'dau-massage-vai-gay'],
      requiresStaffReview: true,
      message: 'Mang thai cần phác đồ nhẹ nhàng không dùng tinh dầu.',
    },
    {
      flag: 'allergy-essential-oil',
      blocksServiceSlugs: [],
      blocksProductSlugs: ['tinh-dau-thu-gian', 'dau-massage-vai-gay'],
      requiresStaffReview: true,
      message: 'Dị ứng tinh dầu: đã loại bỏ sản phẩm tinh dầu.',
    },
  ],
};

describe('Rule Engine Gợi ý (recommend)', () => {
  it.each([
    {
      concern: 'mat-ngu',
      severity: 3 as const,
      expectedService: 'thu-gian-sau',
      expectedProducts: ['tinh-dau-thu-gian', 'tra-thao-moc-toi'],
    },
    {
      concern: 'moi-vai-gay',
      severity: 3 as const,
      expectedService: 'giai-toa-vai-gay',
      expectedProducts: ['dau-massage-vai-gay', 'mieng-dan-nhiet'],
    },
    {
      concern: 'da-kich-ung',
      severity: 3 as const,
      expectedService: 'phuc-hoi-da-nhay-cam',
      expectedProducts: ['serum-phuc-hoi', 'kem-duong-am'],
    },
    {
      concern: 'da-kho',
      severity: 3 as const,
      expectedService: 'cap-am-sang-da',
      expectedProducts: ['kem-duong-am'],
    },
  ])(
    'gợi ý chuẩn xác cho triệu chứng $concern',
    ({ concern, severity, expectedService, expectedProducts }) => {
      const res = recommend(
        {
          scores: [{ concernSlug: concern, severity }],
          safety: { flags: [] },
        },
        mockCatalog,
      );

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.length).toBeGreaterThanOrEqual(1);
        const top = res.value[0]!;
        expect(top.serviceSlug).toBe(expectedService);
        expect(top.productSlugs).toEqual(expect.arrayContaining(expectedProducts));
        expect(top.reasons.length).toBeGreaterThan(0);
        expect(top.requiresStaffReview).toBe(false);
      }
    },
  );

  it('xử lý chống chỉ định mang thai: chặn dịch vụ bị cấm và gắn cảnh báo', () => {
    const res = recommend(
      {
        scores: [{ concernSlug: 'mat-ngu', severity: 3 }],
        safety: { flags: ['pregnant'] },
      },
      mockCatalog,
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      // Dịch vụ thu-gian-sau bị chặn hoàn toàn bởi cờ pregnant
      const hasBlockedService = res.value.some((r) => r.serviceSlug === 'thu-gian-sau');
      expect(hasBlockedService).toBe(false);
    }
  });

  it('xử lý chống chỉ định dị ứng tinh dầu: dịch vụ được giữ nhưng sản phẩm tinh dầu bị loại', () => {
    const res = recommend(
      {
        scores: [{ concernSlug: 'mat-ngu', severity: 3 }],
        safety: { flags: ['allergy-essential-oil'] },
      },
      mockCatalog,
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.length).toBe(1);
      const rec = res.value[0]!;
      expect(rec.serviceSlug).toBe('thu-gian-sau');
      expect(rec.productSlugs).toContain('tra-thao-moc-toi');
      expect(rec.productSlugs).not.toContain('tinh-dau-thu-gian'); // Bị lọc bỏ
      expect(rec.requiresStaffReview).toBe(true);
      expect(rec.warnings.length).toBeGreaterThan(0);
    }
  });

  it('kiểm tra ngưỡng biên severity: mức 2 khớp rule, mức 1 không khớp', () => {
    const resUnderThreshold = recommend(
      {
        scores: [{ concernSlug: 'mat-ngu', severity: 1 }],
        safety: { flags: [] },
      },
      mockCatalog,
    );

    expect(resUnderThreshold.ok).toBe(true);
    if (resUnderThreshold.ok) {
      expect(resUnderThreshold.value.length).toBe(0);
    }

    const resAtThreshold = recommend(
      {
        scores: [{ concernSlug: 'mat-ngu', severity: 2 }],
        safety: { flags: [] },
      },
      mockCatalog,
    );

    expect(resAtThreshold.ok).toBe(true);
    if (resAtThreshold.ok) {
      expect(resAtThreshold.value.length).toBe(1);
    }
  });

  it('xử lý hòa điểm: sắp xếp theo bảng chữ cái serviceSlug', () => {
    const tieCatalog: RecommendationCatalog = {
      rules: [
        {
          id: 'R-T1',
          concernSlug: 'moi-vai-gay',
          minSeverity: 2,
          serviceSlug: 'service-z',
          productSlugs: [],
          priority: 5,
          rationale: 'Z',
          active: true,
        },
        {
          id: 'R-T2',
          concernSlug: 'moi-vai-gay',
          minSeverity: 2,
          serviceSlug: 'service-a',
          productSlugs: [],
          priority: 5,
          rationale: 'A',
          active: true,
        },
      ],
      contraindications: [],
    };

    const res = recommend(
      {
        scores: [{ concernSlug: 'moi-vai-gay', severity: 2 }],
        safety: { flags: [] },
      },
      tieCatalog,
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value[0]?.serviceSlug).toBe('service-a');
      expect(res.value[1]?.serviceSlug).toBe('service-z');
    }
  });

  it('tính ổn định tất định: cùng đầu vào hoặc đảo thứ tự luôn trả kết quả như nhau', () => {
    const inputA = {
      scores: [
        { concernSlug: 'mat-ngu', severity: 4 as const },
        { concernSlug: 'moi-vai-gay', severity: 3 as const },
      ],
      safety: { flags: [] },
    };

    const inputB = {
      scores: [
        { concernSlug: 'moi-vai-gay', severity: 3 as const },
        { concernSlug: 'mat-ngu', severity: 4 as const },
      ],
      safety: { flags: [] },
    };

    const resA1 = recommend(inputA, mockCatalog);
    const resA2 = recommend(inputA, mockCatalog);
    const resB = recommend(inputB, mockCatalog);

    expect(resA1).toEqual(resA2);
    expect(resA1).toEqual(resB);
  });

  it('trả về danh sách rỗng khi không có triệu chứng nào khớp luật', () => {
    const res = recommend(
      {
        scores: [{ concernSlug: 'trieu-chung-khong-ton-tai', severity: 3 }],
        safety: { flags: [] },
      },
      mockCatalog,
    );

    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value).toEqual([]);
    }
  });
});
