# Đề Cương Slide Báo Cáo Bảo Vệ Đồ Án (10 Slides)

**Đề tài**: Digital Wellness Platform — Hệ Thống Quản Lý Liệu Trình & Chăm Sóc Cá Nhân Hóa Cho Spa  
**Thời lượng trình bày khuyến nghị**: 10 – 12 phút  
**Đối tượng lắng nghe**: Giảng viên hướng dẫn & Hội đồng chấm đồ án tốt nghiệp

---

## 📑 Slide 1: Trang Bìa Đề Tài (Title Slide)

- **Tiêu đề lớn**: Digital Wellness Platform: Hệ Thống Quản Lý Liệu Trình & Chăm Sóc Cá Nhân Hóa Cho Spa.
- **Phụ đề**: Giải pháp liên kết dữ liệu offline tại cơ sở và quy trình dưỡng tại nhà online trên nền tảng Web hiện đại.
- **Sinh viên thực hiện**: [Họ và tên sinh viên] — MSSV: [Mã số sinh viên]
- **Giảng viên hướng dẫn**: [Học hàm, học vị và tên Giảng viên hướng dẫn]
- **Khoa / Chuyên ngành**: Công nghệ Thông tin / Kỹ thuật Phần mềm.
- **Thời gian**: Tháng 11 / 2026.

---

## 📑 Slide 2: Đặt Vấn Đề & Thực Trạng (Problem Statement)

- **Thực trạng ngành dịch vụ Spa & Thẩm mỹ**:
  - Đứt gãy dữ liệu: Khách làm dịch vụ tại spa (offline) nhưng về nhà tự dùng mỹ phẩm ngẫu nhiên, không đồng bộ với phác đồ.
  - Mô hình bán lẻ đại trà: Các website spa thường biến thành sàn thương mại điện tử với giỏ hàng và danh mục sản phẩm rời rạc, làm mất đi tính chuyên môn cá nhân hóa.
  - Kỹ thuật viên thiếu công cụ ghi nhận: Nhật ký trị liệu ghi chép thủ công trên sổ giấy, dễ thất lạc, không cảnh báo được dị ứng hay chống chỉ định.
- **Hậu quả**: Hiệu quả trị liệu giảm sút, khách hàng dễ gặp kích ứng/tác dụng phụ, spa không duy trì được tỷ lệ gắn bó lâu dài.

---

## 📑 Slide 3: Mục Tiêu Đề Tài & Triết Lý Sản Phẩm (Core Philosophy)

- **Mục tiêu kỹ thuật**: Xây dựng một nền tảng chuyên biệt quản lý trọn vẹn chu trình chăm sóc sức khỏe thể trạng.
- **3 Nguyên tắc bất biến định hình sản phẩm**:
  1. **Tuyệt đối không có giỏ hàng, không có danh mục bán lẻ**: Mọi sản phẩm đóng vai trò là **"Toa chăm sóc tại nhà"** gắn liền với phác đồ dịch vụ hoặc do kỹ thuật viên chỉ định.
  2. **Gợi ý tất định & Có giải trình**: Rule Engine quyết định dịch vụ và sản phẩm dựa trên bằng chứng khoa học, tự động lọc chống chỉ định và giải thích lý do; AI không tự ý can thiệp kết quả.
  3. **Vòng đời khách hàng là State Machine tường minh**: Chuyển đổi trạng thái có điều kiện kiểm tra (guard) và lưu vết lịch sử phục vụ đối soát chuyên môn.

---

## 📑 Slide 4: Kiến Trúc Phân Tầng Nghiêm Ngặt (Layered Architecture)

- **Sơ đồ 3 tầng kiến trúc một chiều**:
  - `Presentation Layer`: Next.js App Router (React Server Components, Tailwind CSS).
  - `Application Layer`: Điều phối Use-Cases, xử lý giao dịch cơ sở dữ liệu và kiểm tra phân quyền RBAC.
  - `Domain Layer` (LÕI THUẦN): Chứa toàn bộ nghiệp vụ cốt lõi, hoàn toàn độc lập với Framework, UI hay Database.
  - `Infrastructure Layer`: Prisma ORM (SQLite/PostgreSQL), Auth.js v5, RAG Pipeline.
- **Kỷ luật kiến trúc**: Được bảo vệ tự động bằng quy tắc ESLint `no-restricted-imports`, ngăn chặn tuyệt đối việc Domain import ngược tầng ngoài.

---

## 📑 Slide 5: Lõi Nghiệp Vụ 1 — State Machine Vòng Đời Khách Hàng

- **Mô hình Finite State Machine**:
  - `NEW` → `ASSESSED` → `RECOMMENDED` → `BUNDLE_CONFIRMED` → `IN_TREATMENT` → `HOME_CARE` → `REASSESSMENT` → `COMPLETED`.
  - Hỗ trợ các nhánh rẽ: `CANCELLED` (hủy lịch kèm lý do), `LAPSED` (quá hạn không phản hồi).
- **Cơ chế Guards & PlanStateHistory**:
  - Mọi sự kiện chuyển trạng thái đều phải thỏa mãn điều kiện bảo vệ (ví dụ: chuyển sang `HOME_CARE` bắt buộc phải hoàn thành đủ số buổi và có chỉ định toa dưỡng hợp lệ).
  - Bảng lịch sử `PlanStateHistory` ghi nhận: trạng thái trước/sau, sự kiện kích hoạt, tác nhân thực hiện và thời điểm.

---

## 📑 Slide 6: Lõi Nghiệp Vụ 2 — Rule Engine Tất Định & Chống Chỉ Định

- **Khảo sát chuẩn hóa 3 nhánh triệu chứng**:
  - Tình trạng da (da khô, nhạy cảm, xỉn màu), Căng thẳng & Giấc ngủ, Cơ vai gáy.
- **Động cơ khớp quy tắc (Rule Matcher)**:
  - Tính điểm độ nghiêm trọng (Severity) và mức độ ưu tiên (Priority) của từng nhóm triệu chứng.
  - Lọc loại trừ triệt để theo cờ an toàn (`pregnant`, `allergy-essential-oil`, `fever-acute-illness`, `recent-surgery`).
- **Khối giải trình khoa học (Rationale Explainability)**:
  - Khách hàng luôn nhìn thấy mục _"Vì sao bạn được gợi ý phác đồ này?"_ với lý do cụ thể theo từng quy tắc chuyên môn.

---

## 📑 Slide 7: Hạ Tầng RAG & Trợ Lý Tư Vấn AI An Toàn

- **Mô hình Hybrid Retrieval**:
  - Kết hợp truy xuất ngữ nghĩa (Vector Cosine Similarity qua Hashing Embedding 64-D) và truy xuất từ khóa chính xác (BM25) qua thuật toán **Reciprocal Rank Fusion (RRF)**.
- **Cơ chế bảo vệ an toàn đa tầng (Multi-layer Safety Guardrails)**:
  - **Lớp Pre-Check Cờ đỏ y tế**: Tự động phát hiện 100% triệu chứng cấp cứu (đau ngực dữ dội, sốt cao cấp, khó thở, co giật) → phản hồi mẫu khuyên đến cơ sở y tế ngay mà **KHÔNG gọi LLM**.
  - **Chống Prompt Injection**: Chặn đứng các nỗ lực xâm nhập hệ thống hoặc jailbreak prompt.
  - **Zero PII**: Không gửi tên, email hay thông tin cá nhân của khách tới các mô hình AI ngoài.
  - **Bắt buộc trích dẫn nguồn**: Mọi câu trả lời của trợ lý đều có trích dẫn `[1]`, `[2]` trỏ về tài liệu spa thẩm định.

---

## 📑 Slide 8: Bảo Mật, Phân Quyền RBAC & Quyền Riêng Tư Chuẩn GDPR

- **Phân quyền vai trò nghiêm ngặt ở cấp Server**:
  - `CUSTOMER`: Chỉ truy cập và quản lý dữ liệu của chính mình (kiểm tra `userId` ở tầng Repository).
  - `THERAPIST`: Bàn làm việc KTV chỉ thao tác trên khách hàng được phân công trị liệu; tự động khóa cứng sản phẩm chống chỉ định khi chỉ định toa.
  - `ADMIN`: Giám sát vận hành, mô phỏng luật gợi ý thời gian thực (Live Preview Simulation), quản lý danh mục và xem AuditLog.
- **Quyền riêng tư dữ liệu cá nhân**:
  - Tính năng xuất dữ liệu (Data Portability): Tải toàn bộ hồ sơ cá nhân ra file `.json`.
  - Tính năng xóa dữ liệu (Right to Erasure): Cho phép khách hàng xóa vĩnh viễn tài khoản và toàn bộ dữ liệu sức khỏe khỏi hệ thống.
  - Ghi nhật ký kiểm toán `AuditLog` cho mọi thao tác nhạy cảm.

---

## 📑 Slide 9: Thực Nghiệm & Kết Quả Đảm Bảo Chất Lượng (QA Results)

- **Bảng số liệu kiểm thử thực tế**:
  - **TypeScript & Linting**: `tsc --noEmit` và `eslint .` sạch 100%, không nới lỏng rule.
  - **Unit & Component Testing (Vitest)**: **169/169 tests passed** trên 31 file.
  - **Độ bao phủ mã nguồn (Coverage)**: Tầng Domain đạt **92.9% – 100%**; Toàn dự án đạt **77.94%**.
  - **Playwright E2E Testing**: **15/15 tests passed** trên cả 3 kích thước Desktop, Mobile Pixel 5 và Tablet.
  - **RAG Benchmark Evaluation (`rag:eval`)**: 32 câu hỏi chuẩn, Recall@5 đạt **100.0%**, xử lý cờ đỏ đạt **100.0%**, **0** vi phạm cụm từ cấm.
  - **Quét mã độc / Bí mật**: **Gitleaks 0 leaks found**.

---

## 📑 Slide 10: Kết Luận & Hướng Phát Triển Tương Lai

- **Đóng góp của đề tài**:
  - Hiện thực hóa thành công một sản phẩm phần mềm mẫu mực kết hợp chặt chẽ giữa tính kỷ luật kỹ thuật phần mềm (TDD, Clean Architecture, State Machine, CI/CD) và sự am hiểu nghiệp vụ spa chuyên sâu.
  - Giải quyết trọn vẹn bài toán liên kết dữ liệu offline - online với trải nghiệm người dùng tinh tế, ấm áp và chuyên nghiệp.
- **Hướng phát triển trong tương lai**:
  - Tích hợp thêm các kênh thông báo tự động (Zalo ZNS / SMS) nhắc lịch uống trà dưỡng và thoa tinh dầu tại nhà theo toa.
  - Nâng cấp mô hình phân tích ảnh da mặt tự động hỗ trợ kỹ thuật viên trong buổi đánh giá thể trạng ban đầu.
- **Lời cảm ơn**: Trân trọng cảm ơn Thầy Cô và Hội đồng đã lắng nghe! Sẵn sàng lắng nghe câu hỏi phản biện.
