# Tiến độ dự án — Digital Wellness Platform (Spa)

Dự án: Hệ thống Quản lý Liệu trình & Chăm sóc Cá nhân hóa cho Spa  
Repo: [minhkhueit1999/wed-site-spa](https://github.com/minhkhueit1999/wed-site-spa)  
Chế độ: Tự chủ chạy một mạch (Autonomous Execution) từ Giai đoạn 0 đến Giai đoạn 10.

---

## Bảng tổng hợp 11 giai đoạn

| Giai đoạn        | Nội dung                                                                             | Trạng thái    | Nhánh / Commit                | Việc tồn | Ghi chú & Tự quyết định                                                  |
| ---------------- | ------------------------------------------------------------------------------------ | ------------- | ----------------------------- | -------- | ------------------------------------------------------------------------ |
| **Giai đoạn 0**  | Nền tảng & công cụ (Next.js, TS strict, Tailwind, Prisma, Vitest, CI, Design System) | Đã hoàn thành | `main`                        | Không    | Hoàn thành typecheck, lint, format, test, build, Gitleaks.               |
| **Giai đoạn 1**  | Dữ liệu & xác thực (Prisma schema, seed, Auth.js credentials, RBAC, AuditLog)        | Đã hoàn thành | `feat/auth-data-rbac`         | Không    | Đạt 36/36 test, coverage 94.89%, seed idempotent                         |
| **Giai đoạn 2**  | Lõi nghiệp vụ (Domain TDD: rule engine, state machine, quiz scoring)                 | Đã hoàn thành | `feat/domain-rules-lifecycle` | Không    | Coverage domain >= 93%, 101 test, chứng minh no-restricted-imports       |
| **Giai đoạn 3**  | Trải nghiệm công khai (Trang chủ, /trieu-chung, /tu-van, /ket-qua, /dich-vu/[slug])  | Đã hoàn thành | `feat/public-experience`      | Không    | Mobile-first, không giỏ hàng, SSG chuẩn, 106 tests xanh                  |
| **Giai đoạn 4**  | Túi liệu trình (Unified booking: chọn giờ + toa tại nhà trong 1 luồng)               | Đã hoàn thành | `feat/unified-booking`        | Không    | Transaction DB an toàn, chống trùng lịch, PENDING_REVIEW, 115 tests xanh |
| **Giai đoạn 5**  | Tài khoản khách & Treatment Tracker (Timeline, biểu đồ, xuất/xóa dữ liệu)            | Chưa bắt đầu  | `feat/customer-tracker`       | -        | Quyền riêng tư khách                                                     |
| **Giai đoạn 6**  | Bảng điều khiển kỹ thuật viên (/ky-thuat-vien, SessionLog, toa tại nhà)              | Chưa bắt đầu  | `feat/therapist-console`      | -        | Chặn sản phẩm chống chỉ định                                             |
| **Giai đoạn 7**  | Quản trị (/quan-tri/*: CRUD, preview luật, tri thức RAG, AuditLog)                   | Chưa bắt đầu  | `feat/admin-management`       | -        | Role ADMIN                                                               |
| **Giai đoạn 8**  | Hạ tầng RAG & trợ lý AI (VectorStore SQLite, Retriever lai, preCheck, rag:eval)      | Chưa bắt đầu  | `feat/rag-assistant`          | -        | Recall@5 >= 0.8, 100% cờ đỏ chuẩn                                        |
| **Giai đoạn 9**  | Chất lượng cuối & hoàn thiện (Playwright E2E 5 luồng, a11y, Lighthouse, README)      | Chưa bắt đầu  | `feat/e2e-quality-audit`      | -        | -                                                                        |
| **Giai đoạn 10** | Đóng gói bảo vệ đồ án (DEMO.md, QA-REPORT.md, SLIDE-OUTLINE.md, tag v1.0.0)          | Chưa bắt đầu  | `main`                        | -        | Đẩy v1.0.0 lên GitHub                                                    |

---

## Chi tiết cập nhật từng giai đoạn

### Khởi động (Init)

- Chuyển toàn bộ kit từ thư mục con ra gốc workspace.
- Khởi tạo git repo cục bộ, gắn remote `https://github.com/minhkhueit1999/wed-site-spa.git`.
- Thử nghiệm công cụ: MCP `context7` hoạt động tốt; `chrome-devtools` fallback sang Playwright.

### Giai đoạn 0: Nền tảng & công cụ

- Thiết lập Next.js 16 + React 19 + TypeScript strict + Tailwind v4 + ESLint flat config + Prettier + Husky + Gitleaks.
- Xây dựng Design System spa chuẩn earthy luxury, components UI primitives, test suites.

### Giai đoạn 1: Dữ liệu & xác thực

- 17 models Prisma schema, seed đầy đủ dữ liệu spa thực tế, 3 tài khoản demo.
- Auth.js credentials provider, RBAC guards, rate limiter, data isolation repositories.

### Giai đoạn 2: Lõi nghiệp vụ (Domain TDD)

- Deterministic Rule Engine, Lifecycle State Machine với guards và PlanStateHistory.
- Quiz scoring 3 nhánh, Result type chuẩn Functional Programming, chặn domain vi phạm layer imports.

### Giai đoạn 3: Trải nghiệm công khai

- PublicHeader và PublicFooter sang trọng, navigation chuẩn.
- `/trieu-chung`: Tìm kiếm giải pháp theo triệu chứng tiếng Việt không dấu, lọc danh mục, hiển thị gói giải pháp đi kèm sản phẩm chăm sóc tại nhà.
- `/tu-van`: Wizard trắc nghiệm 3 nhánh, Stepper chỉ số tiến trình, lưu tạm localStorage, đồng ý thu thập dữ liệu sức khỏe.
- `/ket-qua`: Hiển thị gợi ý phác đồ, điểm số triệu chứng, cờ an toàn, giải thích lý do, CTA đặt hẹn phác đồ.
- `/dich-vu/[slug]`: Chi tiết dịch vụ kèm toa sản phẩm, SSG `generateStaticParams` tối ưu SEO, JSON-LD Schema.
- Build thành công toàn bộ static pages, 106 tests xanh, lint & format chuẩn.

### Giai đoạn 4: Túi liệu trình (Unified Booking)

- Không giỏ hàng, không trang bán lẻ: Dịch vụ gắn liền với toa chăm sóc tại nhà trong một luồng duy nhất.
- Use-case `confirmCareBundle` (`src/application/booking/confirmCareBundle.ts`):
  - Giao dịch nguyên tử qua `prisma.$transaction`: tạo TreatmentPlan, PlanStateHistory, Appointment, CareBundle, HomeCarePrescription, AuditLog.
  - Kiểm tra và ngăn chặn xung đột trùng lịch của kỹ thuật viên.
  - Kiểm tra chống chỉ định nghiêm ngặt: từ chối nếu có cờ vi phạm an toàn; tự động gắn cờ `requiresReview = true`, chuyển CareBundle sang trạng thái `PENDING_REVIEW` và gửi cảnh báo thân thiện cho khách.
  - Chuyển trạng thái state machine chuẩn: `RECOMMENDED` -> `BUNDLE_CONFIRMED`.
- UI `/tui-lieu-trinh`:
  - 4 trạng thái: Loading skeleton, Empty/Error fallback, Success screen (mã phác đồ, thời gian, toa đính kèm, hướng dẫn trước khi đến), Form tương tác (ngày, giờ, kỹ thuật viên, cờ sức khỏe, đồng ý bảo mật).
- Đạt 115 tests xanh (toàn bộ 7 unit/integration tests cho booking + 2 component tests), typecheck và build hoàn hảo.
