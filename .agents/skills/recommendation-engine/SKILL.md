---
name: recommendation-engine
description: Xây dựng, sửa hoặc kiểm thử logic gợi ý rule-based ánh xạ triệu chứng → dịch vụ → sản phẩm đi kèm, có xử lý chống chỉ định và giải thích lý do. Dùng khi đụng tới src/domain/recommendation, luật gợi ý, trắc nghiệm chẩn đoán hoặc dữ liệu seed luật.
---

# Rule engine gợi ý liệu trình

## Mục tiêu

Từ kết quả trắc nghiệm/triệu chứng khách chọn + hồ sơ an toàn, trả về danh sách gợi ý có thứ hạng: một dịch vụ chính, các sản phẩm "toa tại nhà" đi kèm, lý do, cảnh báo. Thuần hàm, tất định, không I/O.

## Hợp đồng (đặt trong `src/domain/recommendation/types.ts`)

```ts
type ConcernScore = { concernSlug: string; severity: 1 | 2 | 3 | 4 | 5 };
type SafetyProfile = { flags: ReadonlyArray<string> }; // ví dụ 'pregnant','allergy-nut-oil','open-wound'
type Rule = {
  id: string; // ổn định, dùng để giải thích và test
  concernSlug: string;
  minSeverity: 1 | 2 | 3 | 4 | 5;
  serviceSlug: string;
  productSlugs: ReadonlyArray<string>;
  priority: number; // lớn hơn = ưu tiên hơn
  rationale: string; // câu giải thích tiếng Việt hiển thị cho khách
  active: boolean;
};
type Contraindication = {
  flag: string;
  blocksServiceSlugs: ReadonlyArray<string>;
  blocksProductSlugs: ReadonlyArray<string>;
  requiresStaffReview: boolean;
  message: string;
};
type Recommendation = {
  serviceSlug: string;
  productSlugs: string[];
  score: number;
  reasons: Array<{ ruleId: string; text: string }>;
  warnings: string[];
  requiresStaffReview: boolean;
};
```

Hàm chính: `recommend(input, catalog): Result<Recommendation[], RecommendError>`.

## Thuật toán (giữ đúng thứ tự)

1. Chuẩn hóa đầu vào (loại trùng triệu chứng, kẹp severity 1–5).
2. Lọc luật: `active` và `severity >= minSeverity` cho đúng `concernSlug`.
3. Áp dụng chống chỉ định: với mỗi flag của khách, loại dịch vụ/sản phẩm bị chặn; nếu `requiresStaffReview` thì đánh dấu và thêm cảnh báo.
4. Tính điểm: `score = priority * 10 + severity * 2` cộng dồn cho các luật cùng `serviceSlug`; sản phẩm gộp từ các luật cùng dịch vụ, loại trùng.
5. Sắp xếp giảm dần theo `score`, hòa thì theo `serviceSlug` (để kết quả ổn định giữa các lần chạy).
6. Trả tối đa 3 gợi ý. Không có luật khớp → trả danh sách rỗng kèm cờ "cần tư vấn trực tiếp" (không bịa gợi ý).

## Giải thích (bắt buộc)

Mỗi gợi ý có `reasons` lấy từ `rationale` của luật đã dùng. UI hiển thị "Vì sao bạn được gợi ý điều này". Không sinh lý do bằng LLM ở bước này.

## Dữ liệu

Luật, chống chỉ định, danh mục nằm trong DB, seed từ `src/data/` (sửa được ở trang quản trị). Engine nhận dữ liệu qua tham số `catalog`, không tự đọc DB.

## Cách thêm luật mới

Dùng `/add-recommendation-rule`. Thứ tự: thêm trường hợp test (đỏ) → thêm luật vào seed → xanh → cập nhật `docs/DOMAIN.md` nếu thêm triệu chứng/cờ mới.

## Mẫu test bắt buộc

- Mỗi triệu chứng seed có ít nhất 1 test "ra đúng dịch vụ".
- Test chống chỉ định: cùng đầu vào, thêm cờ `pregnant` → dịch vụ bị chặn không xuất hiện + có cảnh báo.
- Test biên severity (đúng ngưỡng `minSeverity`, thấp hơn 1 bậc).
- Test tính ổn định: chạy 2 lần cho cùng kết quả, đảo thứ tự đầu vào vẫn cùng kết quả.
- Test không khớp luật nào.

## Sai lầm hay gặp

- Cho LLM quyết định gợi ý. (Cấm.)
- Gợi ý sản phẩm không gắn dịch vụ. (Cấm theo hiến pháp.)
- Quên loại sản phẩm bị chống chỉ định dù dịch vụ không bị chặn.
- Hard-code slug trong engine thay vì đọc từ `catalog`.
