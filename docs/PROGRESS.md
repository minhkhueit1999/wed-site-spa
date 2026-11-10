# Tiến độ dự án — Digital Wellness Platform (Spa)

Dự án: Hệ thống Quản lý Liệu trình & Chăm sóc Cá nhân hóa cho Spa  
Repo: [minhkhueit1999/wed-site-spa](https://github.com/minhkhueit1999/wed-site-spa)  
Chế độ: Tự chủ chạy một mạch (Autonomous Execution) từ Giai đoạn 0 đến Giai đoạn 10.

---

## Bảng tổng hợp 11 giai đoạn

| Giai đoạn        | Nội dung                                                                             | Trạng thái    | Nhánh / Commit                | Việc tồn | Ghi chú & Tự quyết định                                                           |
| ---------------- | ------------------------------------------------------------------------------------ | ------------- | ----------------------------- | -------- | --------------------------------------------------------------------------------- |
| **Giai đoạn 0**  | Nền tảng & công cụ (Next.js, TS strict, Tailwind, Prisma, Vitest, CI, Design System) | Đã hoàn thành | `main`                        | Không    | Hoàn thành typecheck, lint, format, test, build, Gitleaks.                        |
| **Giai đoạn 1**  | Dữ liệu & xác thực (Prisma schema, seed, Auth.js credentials, RBAC, AuditLog)        | Đã hoàn thành | `feat/auth-data-rbac`         | Không    | Đạt 36/36 test, coverage 94.89%, seed idempotent                                  |
| **Giai đoạn 2**  | Lõi nghiệp vụ (Domain TDD: rule engine, state machine, quiz scoring)                 | Đã hoàn thành | `feat/domain-rules-lifecycle` | Không    | Coverage domain >= 93%, 101 test, chứng minh no-restricted-imports                |
| **Giai đoạn 3**  | Trải nghiệm công khai (Trang chủ, /trieu-chung, /tu-van, /ket-qua, /dich-vu/[slug])  | Đã hoàn thành | `feat/public-experience`      | Không    | Mobile-first, không giỏ hàng, SSG chuẩn, 106 tests xanh                           |
| **Giai đoạn 4**  | Túi liệu trình (Unified booking: chọn giờ + toa tại nhà trong 1 luồng)               | Đã hoàn thành | `feat/unified-booking`        | Không    | Transaction DB an toàn, chống trùng lịch, PENDING_REVIEW, 115 tests xanh          |
| **Giai đoạn 5**  | Tài khoản khách & Treatment Tracker (Timeline, biểu đồ, xuất/xóa dữ liệu)            | Đã hoàn thành | `feat/customer-tracker`       | Không    | Cô lập dữ liệu khách, xuất JSON & xóa tài khoản, 122 tests xanh                   |
| **Giai đoạn 6**  | Bảng điều khiển kỹ thuật viên (/ky-thuat-vien, SessionLog, toa tại nhà)              | Đã hoàn thành | `feat/therapist-console`      | Không    | Chặn nghiêm ngặt sản phẩm chống chỉ định, SessionLog, 133 tests xanh              |
| **Giai đoạn 7**  | Quản trị (/quan-tri/*: CRUD, preview luật, tri thức RAG, AuditLog)                   | Đã hoàn thành | `feat/admin-management`       | Không    | Bảng điều khiển admin, live preview rule simulation, CRUD phác đồ & toa, AuditLog |
| **Giai đoạn 8**  | Hạ tầng RAG & trợ lý AI (VectorStore SQLite, Retriever lai, preCheck, rag:eval)      | Đã hoàn thành | `feat/rag-assistant`          | Không    | Recall@5 100%, 100% cờ đỏ & injection, 0 mustNotContain, 165 tests xanh           |
| **Giai đoạn 9**  | Chất lượng cuối & hoàn thiện (Playwright E2E 5 luồng, a11y, Lighthouse, README)      | Chưa bắt đầu  | `feat/e2e-quality-audit`      | -        | -                                                                                 |
| **Giai đoạn 10** | Đóng gói bảo vệ đồ án (DEMO.md, QA-REPORT.md, SLIDE-OUTLINE.md, tag v1.0.0)          | Chưa bắt đầu  | `main`                        | -        | Đẩy v1.0.0 lên GitHub                                                             |

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

### Giai đoạn 5: Tài khoản khách & Treatment Tracker

- Use-case `getCustomerDashboard`:
  - Trích xuất dữ liệu phác đồ hiện tại, tính toán tiến trình số buổi đã hoàn thành / tổng số buổi.
  - Tổng hợp chỉ số tiến triển sau mỗi buổi trị liệu (thang điểm 1-5 / 1-10 cho da, căng thẳng, giấc ngủ, cơ vai gáy) từ `SessionLog`.
  - Hiển thị toa chăm sóc tại nhà hiện tại (`HomeCarePrescription`) do chuyên viên trực tiếp chỉ định.
  - Timeline lịch sử chuyển trạng thái chuẩn (`PlanStateHistory`) và gợi ý hành động tiếp theo (`nextAction`).
- Quyền riêng tư & Bảo mật dữ liệu cá nhân (GDPR-like):
  - Use-case `exportCustomerData`: Xuất toàn bộ dữ liệu cá nhân định dạng JSON và ghi AuditLog.
  - Use-case `deleteCustomerAccount`: Khách hàng tự xóa vĩnh viễn tài khoản và toàn bộ dữ liệu sức khỏe (cascade delete trong DB), chặn hành vi xóa tài khoản người khác, ghi AuditLog.
- UI `/tai-khoan`:
  - 3 tabs: Lộ trình & Treatment Tracker, Lịch hẹn của tôi, Quyền riêng tư & Dữ liệu.
  - Modal xác nhận xóa tài khoản an toàn (`Dialog`).
- Đạt 122 tests xanh (thêm 5 unit/integration tests + 2 component tests), coverage toàn bộ dự án đạt 88.48%.

### Giai đoạn 6: Bảng điều khiển kỹ thuật viên (Therapist Console)

- Phân quyền kỹ thuật viên (`THERAPIST` / `ADMIN`), bảo vệ bằng server guards và server actions.
- `/ky-thuat-vien`: Xem lịch làm việc, thống kê số buổi cần ghi nhận và đã hoàn thành, lọc theo trạng thái.
- `/ky-thuat-vien/khach/[id]`:
  - Khối Cảnh báo chuyên môn: Làm nổi bật cảnh báo cờ an toàn (`safetyFlags`) và nội dung chống chỉ định nghiêm ngặt.
  - Form Ghi nhận SessionLog (`submitSessionLog`): Điểm cải thiện thể trạng 1-5, quan sát trị liệu (tối thiểu 10 ký tự), điều chỉnh lực/thao tác, dặn dò buổi sau; tự động chuyển trạng thái `BUNDLE_CONFIRMED -> IN_TREATMENT`.
  - Form Chỉ định toa dưỡng tại nhà (`prescribeProduct`): RÀNG BUỘC CHẶN NGHIÊM NGẶT - server và UI từ chối toàn bộ sản phẩm nằm trong danh mục chống chỉ định của khách hàng.
  - Use-case `finishSessions`: Chuyển phác đồ sang `HOME_CARE` khi hoàn thành đủ số buổi và có toa dưỡng hợp lệ.
- Đạt 133 tests xanh (thêm 9 unit/integration tests + 2 component tests), toàn bộ typecheck, lint, build xanh.

### Giai đoạn 7: Quản trị (Admin Management)

- Phân quyền Quản trị viên (`ADMIN`), bảo vệ chặt chẽ trên server actions và giao diện.
- Backend Admin Application Services:
  - `getAdminStats`: Thống kê số lượng khách hàng, kỹ thuật viên, phác đồ, lịch hẹn, dịch vụ, sản phẩm, quy tắc, chống chỉ định; phân bố vòng đời phác đồ; trích xuất 20 nhật ký AuditLog gần nhất.
  - `serviceCrud`: Tạo mới dịch vụ và chặn xóa dịch vụ khi đang được liên kết trong bất kỳ phác đồ điều trị hoạt động nào (`TreatmentPlan`).
  - `productCrud`: Tạo mới sản phẩm dưỡng tại nhà và chặn xóa sản phẩm khi đang được chỉ định trong toa thuốc hoạt động (`Prescription`).
  - `ruleCrud` & `contraindicationCrud`: Thêm và xóa quy tắc đề xuất, quản lý cờ chống chỉ định.
  - `ruleSimulation`: Mô phỏng trực tiếp Rule Engine động (Live Preview) với thanh trượt mức độ triệu chứng và lựa chọn cờ an toàn, giải thích nguyên nhân (rationale).
- UI Bảng điều khiển quản trị `/quan-tri`:
  - 5 tabs chuyên sâu: Tổng quan & AuditLog, Quy tắc & Live Preview, Dịch vụ phác đồ, Toa sản phẩm tại nhà, Chống chỉ định & cảnh báo an toàn.
  - Giao diện trực quan hóa mô phỏng Rule Engine theo thời gian thực.
- Đạt 141 tests xanh (thêm 6 use-case tests + 2 component tests), typecheck, lint, build Next.js 19 pages hoàn toàn sạch lỗi.

### Giai đoạn 8: Hạ tầng RAG & Trợ lý AI (RAG Assistant & Knowledge Base)

- Xây dựng 19 tài liệu tri thức thẩm định mẫu tại `data/knowledge/` (4 dịch vụ, 6 sản phẩm toa tại nhà, 6 triệu chứng/thể trạng, 3 chính sách & FAQ), toàn bộ gắn `reviewedBy: "CHƯA DUYỆT"`.
- Module Ingest & Chunking:
  - `loader.ts`: Phân tích frontmatter YAML, xác thực đầy đủ 5 trường siêu dữ liệu bắt buộc.
  - `chunker.ts`: Chia nhỏ văn bản theo tiêu đề markdown, bảo toàn headingPath làm tiền tố ngữ cảnh, chồng lặp 200 ký tự.
- Module Vector Embedding & Store:
  - `HashEmbeddingProvider`: Vector embedding tất định 64 chiều dùng n-gram feature hashing và chuẩn hóa L2, độc lập API key, phục vụ test và đánh giá CI.
  - `GeminiEmbeddingProvider`: Adapter chuẩn Google Gemini Embeddings (`text-embedding-004`).
  - `SqliteVectorStore`: Lưu trữ và tính cosine similarity trong SQLite qua bảng Prisma `KnowledgeChunk`.
- Module Retrieval lai & An toàn:
  - `HybridRetriever`: Kết hợp Vector Cosine Similarity và BM25 keyword matching qua thuật toán Reciprocal Rank Fusion (RRF k=60).
  - `preCheckSafety`: Bộ lọc cờ đỏ khẩn cấp (đau dữ dội, sốt cao, xuất huyết, gãy xương, nhiễm trùng, tự hại) trả mẫu cố định khuyên đến cơ sở y tế mà KHÔNG gọi LLM và KHÔNG gửi PII; phát hiện và chặn đứng 100% các mẫu câu prompt injection / jailbreak.
- Module LLM & Pipeline:
  - `MockLlmProvider`: Tổng hợp câu trả lời tự nhiên có trích nguồn minh bạch dạng `[1]`, `[2]`.
  - `GeminiLlmProvider`: Adapter kết nối Gemini Live/Interactions API.
  - `RAGPipeline`: Điều phối kiểm tra an toàn -> truy xuất lai -> kiểm tra ngưỡng tin cậy -> dựng prompt kèm sự thật cố định từ phác đồ khách -> hậu kiểm chặn tuyên bố phóng đại.
- Endpoint `/api/assistant`:
  - Kiểm tra rate limit trượt (15 req/phút/IP).
  - Xác thực Zod schema cho câu hỏi và ngữ cảnh.
- Giao diện người dùng:
  - Component `AssistantChatWidget` hỗ trợ chế độ nhúng (trang `/ket-qua`) và nút chat nổi thông minh (trang `/tai-khoan`).
  - Hiển thị nhãn trích dẫn tài liệu tham khảo có thể tương tác, cảnh báo y tế khẩn cấp khi có cờ đỏ.
- Benchmark đánh giá RAG (`npm run rag:eval`):
  - Bộ dữ liệu 32 câu hỏi đa dạng trong `data/eval/rag-questions.json`.
  - Kết quả: Recall@5 đạt **100.0%** (15/15 câu domain), xử lý cờ đỏ đạt **100.0%** (9/9 câu), chặn prompt injection đạt **100.0%** (5/5 câu), **0** vi phạm cụm từ cấm (mustNotContain).
  - Báo cáo chi tiết được ghi tự động vào `docs/rag-eval-log.md`.
- Đạt **165 tests xanh** (30 test files), coverage kiểm thử toàn diện, build Next.js 20 routes hoàn toàn sạch lỗi.
