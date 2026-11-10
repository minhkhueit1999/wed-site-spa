# Các giai đoạn — dán từng giai đoạn vào chat khi bạn sẵn sàng

Quy tắc chung cho MỌI giai đoạn: làm theo rules/skills/workflows trong `.agents/`; cuối giai đoạn chạy `/quality-check`, `/ui-review` (nếu có UI), `/git-publish`; báo cáo ngắn (đã làm, kết quả kiểm tra, việc còn lại, quyết định mới trong `docs/DECISIONS.md`) rồi DỪNG chờ xác nhận.

---

## Giai đoạn 0 — Nền tảng & công cụ

**Prompt:** "Chạy `/bootstrap`. Sau đó thiết lập CI (`.github/workflows/ci.yml` đã có sẵn, kiểm tra cho khớp scripts), tạo `docs/design-system.md` sau khi nạp skill UI UX Pro Max (nếu có) và `spa-ui-design`: token màu, font tiếng Việt, khoảng cách, bo góc; dựng token trong `globals.css`/Tailwind và primitive `Button`, `Card`, `Input`, `Badge`, `Stepper`, `Dialog` kèm test component."
**Nghiệm thu:** `typecheck/lint/test/build` xanh; Husky chạy; trang chủ tạm hiển thị đúng dấu tiếng Việt; đã đẩy lên repo.
**Commit mẫu:** `chore: khởi tạo dự án, công cụ chất lượng và design system`

## Giai đoạn 1 — Dữ liệu & xác thực

**Prompt:** "Dựa trên `docs/DOMAIN.md`, viết `prisma/schema.prisma`, migration, `prisma/seed.ts` (6 triệu chứng, 4 dịch vụ, 6 sản phẩm, luật, chống chỉ định, tài khoản demo cho mỗi vai trò — mật khẩu demo lấy từ biến môi trường, không hard-code trong repo công khai). Làm Auth.js (credentials), `requireUser()`/`requireRole()`, repository cho User/Customer, và trang `/dang-nhap`, `/dang-ky` (có checkbox đồng ý xử lý dữ liệu). Áp rule `05-security-privacy`: rate limit đăng nhập, băm mật khẩu, AuditLog cho đăng nhập."
**Nghiệm thu:** seed chạy lặp lại không lỗi; test cho `requireRole`; khách không đọc được dữ liệu của khách khác (test integration); đăng nhập/đăng ký dùng được.
**Commit mẫu:** `feat(auth): lược đồ dữ liệu, seed và xác thực theo vai trò`

## Giai đoạn 2 — Lõi nghiệp vụ (TDD, chưa làm UI)

**Prompt:** "Nạp skill `recommendation-engine` và `treatment-lifecycle`. Hiện thực TRONG `src/domain/` theo TDD: (1) `recommend()` với chống chỉ định, chấm điểm, giải thích lý do; (2) `transition()` state machine với đủ sự kiện/guard trong skill; (3) tính điểm trắc nghiệm → `ConcernScore[]` + `safetyFlags` từ cấu hình `src/data/quizzes.ts` (3 nhánh: da, căng thẳng/giấc ngủ, cơ vai gáy). Thêm lớp `application/` cho use-case: `submitAssessment`, `generateRecommendation`. Vẽ sơ đồ state machine vào `docs/DOMAIN.md` nếu có thay đổi."
**Nghiệm thu:** coverage `domain` ≥ 90%; test dạng bảng phủ mọi cặp trạng thái × sự kiện; test ổn định thứ tự; `no-restricted-imports` chặn `domain` import sai hướng (có test/chứng minh bằng một lỗi cố ý rồi bỏ).
**Commit mẫu:** `feat(domain): rule engine gợi ý, chống chỉ định và state machine liệu trình`

## Giai đoạn 3 — Trải nghiệm công khai

**Prompt:** "Nạp skill `spa-ui-design`. Làm: trang chủ, `/trieu-chung` (tìm có/không dấu, kết quả là gói giải pháp), `/tu-van` (trắc nghiệm từng bước, tiến độ, quay lại, lưu tạm, đồng ý dữ liệu), `/ket-qua` (gợi ý + 'Vì sao bạn được gợi ý điều này' + cảnh báo chống chỉ định), `/dich-vu/[slug]`. Metadata SEO + sitemap. Chưa làm trợ lý AI ở giai đoạn này (chừa khung vị trí)."
**Nghiệm thu:** `/ui-review` sạch ở 375/768/1280; kiểm tra mang thai → dịch vụ bị chặn hiển thị cảnh báo; không có giỏ hàng/danh mục bán lẻ; test component cho trắc nghiệm.
**Commit mẫu:** `feat(web): trắc nghiệm chẩn đoán, tìm theo triệu chứng và trang kết quả`

## Giai đoạn 4 — Túi liệu trình (Unified Booking)

**Prompt:** "Làm `/tui-lieu-trinh`: chọn khung giờ + kỹ thuật viên (kiểm tra xung đột lịch), hiển thị toa tại nhà đi kèm, chi phí mô phỏng, một nút xác nhận duy nhất. Use-case `confirmBundle` tạo TreatmentPlan, Appointment, CareBundle và chuyển `RECOMMENDED → BUNDLE_CONFIRMED` trong một giao dịch DB. Xử lý cảnh báo cần nhân viên duyệt: khách gửi yêu cầu duyệt, trạng thái chờ."
**Nghiệm thu:** test integration giao dịch (lỗi giữa chừng không để lại dữ liệu nửa vời); không thể đặt trùng giờ; không có thao tác số lượng kiểu bán lẻ.
**Commit mẫu:** `feat(booking): túi liệu trình gộp đặt lịch và toa chăm sóc một luồng`

## Giai đoạn 5 — Tài khoản khách & Treatment Tracker

**Prompt:** "Làm `/tai-khoan`: dòng thời gian trạng thái (từ `PlanStateHistory`), biểu đồ tiến triển theo buổi, toa chăm sóc hiện tại, nút hành động tiếp theo theo trạng thái, trang dữ liệu cá nhân (xuất/xóa tài khoản và dữ liệu)."
**Nghiệm thu:** khách chỉ thấy dữ liệu của mình; trạng thái hiển thị đúng bảng ánh xạ `presentation.ts`; xóa dữ liệu hoạt động và có test.
**Commit mẫu:** `feat(tracker): tài khoản khách với dòng thời gian, biểu đồ và toa tại nhà`

## Giai đoạn 6 — Bảng điều khiển kỹ thuật viên

**Prompt:** "Làm `/ky-thuat-vien` và `/ky-thuat-vien/khach/[id]`: danh sách lịch hôm nay, mở hồ sơ, ghi `SessionLog` (ghi chú, chỉ số 1–10, điều chỉnh, lời khuyên buổi sau), chỉ định `HomeCarePrescription` (chỉ sản phẩm hợp lệ), hoàn thành buổi (`COMPLETE_SESSION`), kết thúc đủ buổi (`FINISH_SESSIONS`), tái đánh giá. Ghi AuditLog khi xem/sửa nhật ký."
**Nghiệm thu:** kỹ thuật viên không xem được khách không thuộc mình; sản phẩm vi phạm chống chỉ định bị chặn ở server; hành trình `BUNDLE_CONFIRMED → IN_TREATMENT → HOME_CARE` chạy đúng.
**Commit mẫu:** `feat(staff): console kỹ thuật viên ghi nhật ký và chỉ định toa`

## Giai đoạn 7 — Quản trị

**Prompt:** "Làm `/quan-tri/*`: CRUD dịch vụ, sản phẩm, triệu chứng, luật, chống chỉ định, liên kết dịch vụ–sản phẩm; khi sửa luật có khung 'xem trước' chạy `recommend()` với dữ liệu mẫu; quản lý tài liệu tri thức cho RAG (xem, sửa, đánh dấu đã duyệt, kích hoạt ingest lại); xem AuditLog."
**Nghiệm thu:** chỉ ADMIN truy cập; xóa dịch vụ đang có liệu trình bị chặn có thông báo; xem trước luật khớp kết quả engine.
**Commit mẫu:** `feat(admin): quản trị danh mục, luật gợi ý và tri thức`

## Giai đoạn 8 — Hạ tầng RAG & trợ lý AI

**Prompt:** "Nạp skill `rag-pipeline`. Hiện thực đầy đủ trong `src/infrastructure/rag/` theo skill: loader, chunker, `EmbeddingProvider` (bản thật + `HashEmbeddingProvider`), `VectorStore` (SQLite), `Retriever` lai (vector + từ khóa, RRF), `safety/preCheck`, `LlmProvider` (bản thật + mock), `pipeline/answer.ts`, `/api/assistant` (Zod, rate limit, timeout). Chạy `/seed-knowledge` để tạo tài liệu cho mọi dịch vụ/sản phẩm/triệu chứng/FAQ/chính sách (nhãn CHƯA DUYỆT) và bộ `data/eval/rag-questions.json` (ít nhất 30 câu gồm đúng chủ đề, ngoài phạm vi, cờ đỏ, prompt-injection). Gắn khung hỏi đáp vào `/ket-qua` và `/tai-khoan`, hiển thị nguồn trích dẫn. Dùng ngữ cảnh khách theo cách ẩn danh: chỉ gửi kết quả rule engine và cờ cần thiết, không gửi tên/email/SĐT."
**Nghiệm thu:** `npm run rag:eval` đạt recall@5 ≥ 0,8 với bộ giả (ghi vào `docs/rag-eval-log.md`), 0 vi phạm `mustNotContain`, 100% câu cờ đỏ trả mẫu cố định không gọi LLM, 100% câu prompt-injection không bị lộ prompt/đổi vai trò; câu trả lời luôn có nguồn hoặc phản hồi dự phòng; test pipeline đủ 4 nhánh.
**Commit mẫu:** `feat(rag): hạ tầng RAG, trợ lý tư vấn có trích nguồn và bộ đánh giá`

## Giai đoạn 9 — Chất lượng cuối & hoàn thiện

**Prompt:** "Cài trình duyệt Playwright và viết E2E cho 5 hành trình trong rule `04-testing`. Rà soát trợ năng (AA), hiệu năng bản build (LCP/CLS, Lighthouse), SEO (metadata, sitemap, dữ liệu có cấu trúc cho trang dịch vụ), header bảo mật, `npm audit`, trang 404/500 thân thiện. Viết `README.md` gốc (giới thiệu, cài đặt Windows, biến môi trường, lệnh, kiến trúc, sơ đồ state machine, cách chạy test/RAG eval, kịch bản demo trong PRD §8) và `docs/ARCHITECTURE.md`."
**Nghiệm thu:** E2E xanh; Lighthouse trang công khai ≥ 90 (hiệu năng/trợ năng/SEO) hoặc ghi lý do; `/quality-check` sạch hoàn toàn; README đủ để người lạ chạy được dự án trong 10 phút.
**Commit mẫu:** `test(e2e): hành trình chính, rà soát trợ năng/hiệu năng/bảo mật và tài liệu`

## Giai đoạn 10 — Đóng gói bảo vệ đồ án

**Prompt:** "Tạo `docs/DEMO.md` (kịch bản demo từng bước từ PRD §8 kèm tài khoản demo), `docs/QA-REPORT.md` (kết quả test, coverage, rag:eval, Lighthouse, danh sách việc còn lại và hạn chế), `docs/SLIDE-OUTLINE.md` (dàn ý 10 slide: vấn đề, giải pháp, kiến trúc, state machine, rule engine, RAG, bảo mật, kết quả kiểm thử, demo, hướng phát triển). Gắn tag `v1.0.0`, đẩy lên repo và (nếu tôi muốn) mở PR."
**Nghiệm thu:** repo sạch, CI xanh trên GitHub, tag đã đẩy.
**Commit mẫu:** `docs: tài liệu bảo vệ đồ án và phát hành v1.0.0`
