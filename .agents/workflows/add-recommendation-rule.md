---
description: Thêm triệu chứng, luật gợi ý hoặc chống chỉ định mới theo kiểu test-trước, cập nhật seed, docs và kiểm tra lại.
---

# /add-recommendation-rule <triệu chứng / luật / chống chỉ định>

Làm theo skill `recommendation-engine`.

1. Xác định loại thay đổi: triệu chứng mới, luật mới, chống chỉ định mới, hay điều chỉnh luật cũ. Kiểm tra dịch vụ/sản phẩm liên quan đã có trong danh mục seed chưa (chưa có thì thêm vào danh mục trước, kèm slug ổn định).
2. Viết test (đỏ) trong `src/domain/recommendation/`: ca đúng, ca biên severity, ca bị chống chỉ định, ca không khớp.
   // turbo
   `npm run test -- recommendation`
3. Thêm dữ liệu vào `src/data/` (concern, rule, contraindication). Mỗi `rule.id` duy nhất; `rationale` là câu tiếng Việt thân thiện, không hứa kết quả.
4. Chạy lại test đến xanh, sau đó toàn bộ test:
   // turbo
   `npm run test`
5. Cập nhật `docs/DOMAIN.md` (bảng triệu chứng → dịch vụ → sản phẩm, danh sách cờ chống chỉ định).
6. Nếu thêm triệu chứng mới: thêm mục vào cấu hình trắc nghiệm (`src/data/quizzes.ts`) hoặc chip tìm kiếm, và tài liệu RAG tương ứng (chạy `/seed-knowledge`).
7. Gắn nhãn "nội dung mẫu, cần chuyên gia spa duyệt" vào `docs/DECISIONS.md`.
8. Chạy `/quality-check`, rồi commit: `feat(recommendation): ...`.
