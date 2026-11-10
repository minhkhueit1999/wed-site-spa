---
trigger: always_on
---

# Hiến pháp dự án — Digital Wellness Platform (Spa)

## Sứ mệnh

Xây hệ thống quản lý liệu trình & chăm sóc cá nhân hóa. Sản phẩm đóng vai trò "toa chăm sóc tại nhà" gắn với dịch vụ, không bán đại trà.

## Nguyên tắc bất biến

1. KHÔNG có giỏ hàng kiểu truyền thống, KHÔNG có trang danh mục sản phẩm bán lẻ. Mọi sản phẩm trong UI phải gắn với một dịch vụ, liệu trình hoặc chỉ định của kỹ thuật viên.
2. Gợi ý là rule-based, tất định, có test. AI/RAG chỉ giải thích và tư vấn, KHÔNG được tự đổi kết quả của rule engine.
3. Vòng đời khách hàng là state machine tường minh (skill `treatment-lifecycle`). Không đổi trạng thái bằng cách gán trực tiếp.
4. Đây là wellness, không phải y tế: không chẩn đoán, không hứa chữa bệnh. Gặp dấu hiệu cảnh báo hoặc chống chỉ định thì chuyển nhân viên xem xét.
5. Thanh toán chỉ là mô phỏng (mock). Không thu thập thông tin thẻ thật.

## Ngôn ngữ

- UI và nội dung hiển thị: tiếng Việt có dấu, chuẩn chính tả.
- Mã nguồn (tên biến, hàm, file, commit): tiếng Anh. Comment: tiếng Việt, ngắn, giải thích "tại sao".

## Môi trường

Người dùng dùng Windows 11 + PowerShell. Không dùng cú pháp bash-only (`rm -rf`, `export`, `&&` nối lệnh trong script). Đưa mọi thao tác lặp lại vào `npm run <script>` hoặc script Node (`scripts/*.mjs`) để chạy được mọi nơi.

## Stack cố định (hỏi trước khi thêm thư viện mới)

Next.js App Router (bản stable mới nhất) · TypeScript strict · Tailwind CSS · Prisma + SQLite (dev; PostgreSQL khi triển khai) · Zod · Auth.js (credentials) · Vitest + Testing Library · Playwright (E2E, giai đoạn cuối) · ESLint + Prettier + Husky + lint-staged · Gitleaks.

## Cách làm việc

- Tra tài liệu bằng context7 trước khi dùng API thư viện. Không đoán API, không ghim phiên bản theo trí nhớ.
- Mỗi tính năng: kế hoạch ngắn → viết test → code → `/quality-check` → `/ui-review` (nếu có UI) → commit.
- Mơ hồ nhỏ: tự quyết định hợp lý và ghi vào `docs/DECISIONS.md`. Chỉ hỏi người dùng khi cần: URL git remote, API key, hoặc đổi phạm vi.
- Làm từng giai đoạn trong `prompts/phases.md`; hết giai đoạn thì báo cáo ngắn rồi dừng chờ xác nhận.
- Nội dung chuyên môn spa (liệu trình, thành phần, chống chỉ định) trong dữ liệu mẫu là NỘI DUNG MẪU, phải gắn nhãn "cần chuyên gia spa duyệt" trong `docs/DECISIONS.md`.

## Định nghĩa hoàn thành (Definition of Done)

- `typecheck`, `lint`, `format:check`, `test`, `build` đều qua.
- UI đã xem ở 375px và 1280px bằng chrome-devtools, không có lỗi console.
- Không có secret trong code; commit theo Conventional Commits.
- Đã cập nhật docs nếu hành vi thay đổi.
