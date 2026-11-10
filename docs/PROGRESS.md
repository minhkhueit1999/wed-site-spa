# Tiến độ dự án — Digital Wellness Platform (Spa)

Dự án: Hệ thống Quản lý Liệu trình & Chăm sóc Cá nhân hóa cho Spa  
Repo: [minhkhueit1999/wed-site-spa](https://github.com/minhkhueit1999/wed-site-spa)  
Chế độ: Tự chủ chạy một mạch (Autonomous Execution) từ Giai đoạn 0 đến Giai đoạn 10.

---

## Bảng tổng hợp 11 giai đoạn

| Giai đoạn        | Nội dung                                                                             | Trạng thái    | Nhánh / Commit                | Việc tồn | Ghi chú & Tự quyết định                                    |
| ---------------- | ------------------------------------------------------------------------------------ | ------------- | ----------------------------- | -------- | ---------------------------------------------------------- |
| **Giai đoạn 0**  | Nền tảng & công cụ (Next.js, TS strict, Tailwind, Prisma, Vitest, CI, Design System) | Đã hoàn thành | `main`                        | Không    | Hoàn thành typecheck, lint, format, test, build, Gitleaks. |
| **Giai đoạn 1**  | Dữ liệu & xác thực (Prisma schema, seed, Auth.js credentials, RBAC, AuditLog)        | Chưa bắt đầu  | `feat/auth-data-rbac`         | -        | -                                                          |
| **Giai đoạn 2**  | Lõi nghiệp vụ (Domain TDD: rule engine, state machine, quiz scoring)                 | Chưa bắt đầu  | `feat/domain-rules-lifecycle` | -        | Coverage domain >= 90%                                     |
| **Giai đoạn 3**  | Trải nghiệm công khai (Trang chủ, /trieu-chung, /tu-van, /ket-qua, /dich-vu/[slug])  | Chưa bắt đầu  | `feat/public-experience`      | -        | Mobile-first, không giỏ hàng                               |
| **Giai đoạn 4**  | Túi liệu trình (Unified booking: chọn giờ + toa tại nhà trong 1 luồng)               | Chưa bắt đầu  | `feat/unified-booking`        | -        | Transaction DB an toàn                                     |
| **Giai đoạn 5**  | Tài khoản khách & Treatment Tracker (Timeline, biểu đồ, xuất/xóa dữ liệu)            | Chưa bắt đầu  | `feat/customer-tracker`       | -        | Quyền riêng tư khách                                       |
| **Giai đoạn 6**  | Bảng điều khiển kỹ thuật viên (/ky-thuat-vien, SessionLog, toa tại nhà)              | Chưa bắt đầu  | `feat/therapist-console`      | -        | Chặn sản phẩm chống chỉ định                               |
| **Giai đoạn 7**  | Quản trị (/quan-tri/*: CRUD, preview luật, tri thức RAG, AuditLog)                   | Chưa bắt đầu  | `feat/admin-management`       | -        | Role ADMIN                                                 |
| **Giai đoạn 8**  | Hạ tầng RAG & trợ lý AI (VectorStore SQLite, Retriever lai, preCheck, rag:eval)      | Chưa bắt đầu  | `feat/rag-assistant`          | -        | Recall@5 >= 0.8, 100% cờ đỏ chuẩn                          |
| **Giai đoạn 9**  | Chất lượng cuối & hoàn thiện (Playwright E2E 5 luồng, a11y, Lighthouse, README)      | Chưa bắt đầu  | `feat/e2e-quality-audit`      | -        | -                                                          |
| **Giai đoạn 10** | Đóng gói bảo vệ đồ án (DEMO.md, QA-REPORT.md, SLIDE-OUTLINE.md, tag v1.0.0)          | Chưa bắt đầu  | `main`                        | -        | Đẩy v1.0.0 lên GitHub                                      |

---

## Chi tiết cập nhật từng giai đoạn

### Khởi động (Init)

- Chuyển toàn bộ kit từ thư mục con ra gốc workspace.
- Khởi tạo git repo cục bộ, gắn remote `https://github.com/minhkhueit1999/wed-site-spa.git`.
- Thử nghiệm công cụ: MCP `context7` hoạt động tốt; `chrome-devtools` fallback sang Playwright.
