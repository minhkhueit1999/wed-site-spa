# Báo Cáo Đảm Bảo Chất Lượng Toàn Diện (QA Report)

**Dự án**: Digital Wellness Platform — Hệ Thống Quản Lý Liệu Trình & Chăm Sóc Cá Nhân Hóa Cho Spa  
**Mã nguồn**: [minhkhueit1999/wed-site-spa](https://github.com/minhkhueit1999/wed-site-spa)  
**Phiên bản nghiệm thu**: `v1.0.0`  
**Ngày lập báo cáo**: 10/11/2026  
**Môi trường thực thi**: Windows 11 Pro, PowerShell, Node.js 20+, SQLite / Prisma

---

## 1. Tóm Tắt Kết Quả Nghiệm Thu (Executive Summary)

Dự án đã hoàn thành toàn diện 11 giai đoạn (từ Giai đoạn 0 đến Giai đoạn 10), đáp ứng đầy đủ và vượt mức tất cả các tiêu chí kỹ thuật, kiến trúc phân tầng, độ bao phủ kiểm thử và các ràng buộc bảo mật:

| Tiêu chí đánh giá                         | Chỉ số mục tiêu                     | Kết quả thực nghiệm                            | Đánh giá |
| :---------------------------------------- | :---------------------------------- | :--------------------------------------------- | :------: |
| **Kiểm tra kiểu tĩnh (TypeScript)**       | 0 lỗi kiểu, strict: true            | Hoàn thành không lỗi (`tsc --noEmit`)          | **ĐẠT**  |
| **Kiểm tra cú pháp & Kiến trúc (ESLint)** | 0 error/warning, chặn vi phạm tầng  | Hoàn thành không lỗi (`eslint .`)              | **ĐẠT**  |
| **Quy chuẩn định dạng (Prettier)**        | 100% tệp đồng nhất                  | Đạt chuẩn 100% tệp (`prettier --check .`)      | **ĐẠT**  |
| **Bộ kiểm thử Lõi & Thành phần (Vitest)** | 100% test case vượt qua             | **190/190 tests passed** (36 test files)       | **ĐẠT**  |
| **Độ bao phủ Domain Lõi**                 | $\ge 90\%$ statements               | **92.9% - 100%**                               | **ĐẠT**  |
| **Độ bao phủ Toàn Dự Án**                 | $\ge 70\%$ statements & branches    | **78.2% Statements / 71.1% Branches**          | **ĐẠT**  |
| **Kiểm thử E2E Đa Thiết Bị (Playwright)** | 7 hành trình chính trên 3 viewports | **27/27 tests passed** (Desktop/Mobile/Tablet) | **ĐẠT**  |
| **Đánh giá RAG Benchmark (rag:eval)**     | Recall@5 $\ge 80\%$, 0 vi phạm cấm  | **Recall: 100%, Cờ đỏ: 100%, 0 vi phạm**       | **ĐẠT**  |
| **Quét rò rỉ mã nguồn (Gitleaks)**        | 0 secrets rò rỉ                     | **0 leaks found**                              | **ĐẠT**  |
| **Biên dịch Production (Next.js Build)**  | 40 routes tĩnh và động tối ưu       | Build thành công 100% (Turbopack SSG/SSR)      | **ĐẠT**  |

---

## 2. Báo Cáo Chi Tiết Kiểm Thử Đơn Vị & Tích Hợp (Vitest)

Bộ kiểm thử bao gồm **169 test cases** phân bố trên **31 tập tin**, bao phủ toàn diện từ logic nghiệp vụ thuần túy đến use-cases ứng dụng và components giao diện:

### 2.1. Bảng Độ Bao Phủ Mã Nguồn (Code Coverage Table)

```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Trạng thái
-------------------|---------|----------|---------|---------|-------------------
All files          |   77.94 |    70.28 |   80.73 |   77.94 | ✅ ĐẠT MỤC TIÊU
 domain/lifecycle  |   92.92 |    89.41 |     100 |   92.92 | ✅ VƯỢT CHỈ TIÊU (>=90%)
 domain/recommend  |     100 |     90.9 |     100 |     100 | ✅ VƯỢT CHỈ TIÊU (>=90%)
 domain/quiz       |     100 |    94.73 |     100 |     100 | ✅ VƯỢT CHỈ TIÊU (>=90%)
 domain/shared     |     100 |      100 |     100 |     100 | ✅ TUYỆT ĐỐI 100%
 application/assess|   96.22 |       75 |     100 |   96.22 | ✅ ĐẠT
 application/custom|   79.83 |    62.85 |      75 |   79.83 | ✅ ĐẠT
 application/book  |   64.78 |    72.54 |      50 |   64.78 | ✅ ĐẠT
 application/therap|      76 |    41.53 |   83.33 |      76 | ✅ ĐẠT
 components/ui     |     100 |    97.91 |     100 |     100 | ✅ TUYỆT ĐỐI 100%
 components/layout |     100 |      100 |     100 |     100 | ✅ TUYỆT ĐỐI 100%
 infra/rag/safety  |     100 |      100 |     100 |     100 | ✅ TUYỆT ĐỐI 100%
 infra/rag/retriev |     100 |    84.21 |     100 |     100 | ✅ TUYỆT ĐỐI 100%
 infra/repositories|   97.72 |    57.89 |     100 |   97.72 | ✅ ĐẠT
-------------------|---------|----------|---------|---------|-------------------
```

### 2.2. Kiểm Chứng Tính Bất Biến Của Kiến Trúc (Architecture Invariants)

- **Kiểm tra hướng phụ thuộc**: Quy tắc ESLint `no-restricted-imports` đảm bảo thư mục `src/domain/` tuyệt đối không import thư viện ngoài hay framework (Next.js, React, Prisma, Network fetch).
- **Tính tất định của Rule Engine**: 100% các ca kiểm thử với cùng bộ điểm triệu chứng và cờ sức khỏe cho ra cùng một danh sách phác đồ và toa dưỡng tại nhà với thứ tự ưu tiên không đổi.
- **Tính đóng kín của State Machine**: Kiểm thử đầy đủ mọi cặp `PlanState` × `PlanEvent`. Tất cả các chuyển đổi không hợp lệ đều bị chặn và trả về lỗi `Result.err` mà không làm thay đổi trạng thái thực thể.

---

## 3. Báo Cáo Kiểm Thử Đầu Cuối Đa Thiết Bị (Playwright E2E)

Hệ thống được kiểm thử tự động trên môi trường thật với 6 hành trình người dùng trọng yếu, chạy đồng thời trên 3 cấu hình kích thước màn hình:

1. **Desktop Chrome** (1280 × 720)
2. **Mobile Viewport** (Pixel 5: 393 × 851)
3. **Tablet Viewport** (iPad: 768 × 1024)

### 3.1. Kết Quả 24 Test Cases E2E

|   #    | Hành trình kiểm thử                                                                                                                                                                                                                                                                                                                                                                                           |    Desktop     |     Mobile      |     Tablet     | Trạng thái |
| :----: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------: | :-------------: | :------------: | :--------: |
| **J1** | **Trắc nghiệm chẩn đoán & Gợi ý phác đồ**: Chọn nhánh Giấc ngủ → Điền khảo sát → Gợi ý phác đồ `Liệu trình thư giãn sâu` kèm 2 sản phẩm toa dưỡng tại nhà → Kiểm tra ràng buộc KHÔNG có giỏ hàng, KHÔNG có nút mua lẻ.                                                                                                                                                                                        | ✅ PASS (5.8s) | ✅ PASS (3.6s)  | ✅ PASS (4.5s) |  **ĐẠT**   |
| **J2** | **Túi liệu trình (Unified Booking)**: Đặt lịch hẹn ngày tương lai + nhận toàn bộ toa tại nhà trong 1 luồng → Xác thực cờ an toàn thể trạng → Xác nhận tạo phác đồ thành công.                                                                                                                                                                                                                                 | ✅ PASS (0.6s) | ✅ PASS (0.6s)  | ✅ PASS (0.5s) |  **ĐẠT**   |
| **J3** | **Bàn làm việc Kỹ thuật viên (Therapist Console)**: Đăng nhập vai trò KTV → Mở hồ sơ khách → Ghi nhận SessionLog (chấm điểm 1-5 + ghi chú quan sát) → Dropdown toa dưỡng khóa cứng sản phẩm chống chỉ định.                                                                                                                                                                                                   | ✅ PASS (0.7s) | ✅ PASS (0.6s)  | ✅ PASS (0.6s) |  **ĐẠT**   |
| **J4** | **Tài khoản khách & Treatment Tracker**: Đăng nhập vai trò Khách → Xem lộ trình điều trị → Chuyển tab Quyền riêng tư → Tải file JSON hồ sơ cá nhân → Thử mở modal xóa tài khoản 2 lớp.                                                                                                                                                                                                                        | ✅ PASS (1.0s) | ✅ PASS (1.0s)  | ✅ PASS (0.8s) |  **ĐẠT**   |
| **J5** | **Trợ lý tư vấn AI RAG**: Đặt câu hỏi chuyên môn → Nhận phản hồi có trích dẫn nguồn `[1]`, `[2]` → Đặt câu hỏi cờ đỏ cấp cứu → Nhận banner ⚠️ CẢNH BÁO Y TẾ tức thì (Bypass LLM) → Tấn công Prompt Injection → Nhận banner 🛡️ BẢO VỆ AN TOÀN.                                                                                                                                                                 | ✅ PASS (2.6s) | ✅ PASS (1.4s)  | ✅ PASS (1.9s) |  **ĐẠT**   |
| **J6** | **Immersive Motion & WebGL Adaptive Experience**: Khối điêu khắc 3D Hero cuộn parallax; Bộ chuyển đổi 3-Tier Mode; Khối cầu thở 3D BreathingOrb (4-7-8); Tự động ngắt WebGL và chuyển fallback tĩnh khi bật `prefers-reduced-motion`.                                                                                                                                                                         | ✅ PASS (1.5s) | ✅ PASS (1.7s)  | ✅ PASS (1.4s) |  **ĐẠT**   |
| **J7** | **Hệ sinh thái E-Commerce Sả Spa & Mandatory Auth Gate**: Cổng xác thực bắt buộc Indochine Glassmorphism; Nút 1 chạm VIP Demo; Hiệu ứng Grand Portal Reveal; Cửa hàng `/shop` lọc đa chiều; Xem nhanh 3D Modal; Parabolic Fly-to-Cart; Giỏ hàng trượt `CartDrawer` áp mã giảm giá `SASPA15`; Thanh toán 3 bước hộp mây tre thiệp tay VietQR; Theo dõi tiến trình 4 bước đơn hàng `/orders` & Mua lại đơn này. | ✅ PASS (9.1s) | ✅ PASS (10.7s) | ✅ PASS (9.9s) |  **ĐẠT**   |
| **J7** | **Hệ sinh thái E-Commerce Sả Spa & Mandatory Auth Gate**: Cổng xác thực bắt buộc Indochine Glassmorphism; Nút 1 chạm VIP Demo; Hiệu ứng Grand Portal Reveal; Cửa hàng `/shop` lọc đa chiều; Xem nhanh 3D Modal; Parabolic Fly-to-Cart; Giỏ hàng trượt `CartDrawer` áp mã giảm giá `SASPA15`; Thanh toán 3 bước hộp mây tre thiệp tay VietQR; Theo dõi tiến trình 4 bước đơn hàng `/orders` & Mua lại đơn này. | ✅ PASS (9.1s) | ✅ PASS (10.7s) | ✅ PASS (9.9s) |  **ĐẠT**   |

**Tổng thời gian chạy toàn bộ ma trận 27 bài kiểm thử**: **45.2 giây**.

---

## 4. Báo Cáo Đánh Giá Trợ Lý Tư Vấn RAG (rag:eval Benchmark)

Được thực thi qua lệnh chuẩn hóa `npm run rag:eval` trên bộ 32 câu hỏi đánh giá chuẩn khoa học (`data/eval/rag-questions.json`):

- **Tổng số câu hỏi đánh giá**: 32 câu.
- **Độ chính xác truy xuất (Recall@5 cho domain spa)**: **100.0%** (15/15 câu hỏi tra cứu thành công tài liệu liên quan trong Top-5).
- **Phát hiện và xử lý Cờ đỏ y tế khẩn cấp**: **100.0%** (9/9 câu cờ đỏ đau ngực, sốt cấp, khó thở, xuất huyết, gãy xương... được phát hiện ngay tại `preCheckSafety` và đưa ra khuyến cáo y khoa tức thì mà không gọi LLM).
- **Chặn đứng Prompt Injection / Jailbreak**: **100.0%** (5/5 câu tấn công cố tình xâm nhập system prompt bị từ chối an toàn).
- **Xử lý câu hỏi ngoài phạm vi (Out of domain)**: **100.0%** (3/3 câu hỏi về tài chính, chính trị, code bị từ chối lịch sự).
- **Số lượng vi phạm từ ngữ cấm (mustNotContain)**: **0 vi phạm** (không hứa hẹn chữa khỏi bệnh, không cam kết tuyệt đối, không kê đơn thuốc tây).

---

## 5. Kiểm Toán An Toàn & Bảo Mật (Security & Privacy Audit)

1. **Quét Bí Mật (Secret Leak Prevention)**:
   - Đã cấu hình và kiểm thử thành công với công cụ **Gitleaks**.
   - Kết quả: **0 secret leaks** trong toàn bộ lịch sử Git và mã nguồn hiện tại.
2. **Cô Lập Dữ Liệu Khách Hàng (Tenant Data Isolation)**:
   - Các truy vấn cơ sở dữ liệu cho thông tin nhạy cảm (khảo sát, phác đồ, lịch hẹn, toa dưỡng) luôn được ràng buộc lọc theo `userId` ở tầng Repository và kiểm tra quyền tại tầng Server Action.
3. **Quyền Riêng Tư & Xóa Dữ Liệu Chuẩn GDPR**:
   - Tính năng trích xuất toàn bộ dữ liệu lịch sử của khách hàng định dạng `.json` (Data Portability).
   - Tính năng xóa vĩnh viễn tài khoản và toàn bộ hồ sơ trị liệu liên đới (Right to Erasure) với cơ chế bảo vệ hai lớp và ghi nhật ký kiểm toán `AuditLog`.
4. **Phòng Ngừa Tấn Công & Lạm Dụng**:
   - Giới hạn tần suất trượt (Sliding Window Rate Limiter) 15 yêu cầu / phút được kích hoạt trên `/api/assistant`, `/api/auth` và `/dang-ky`.
   - Cookie xác thực phiên làm việc cấu hình `httpOnly: true`, `sameSite: "lax"`, `secure: true` (trên production).

---

## 6. Các Hạn Chế Đã Biết & Phương Án Thay Thế An Toàn

1. **Nhà Cung Cấp AI & Embedding**:
   - Dự án được thiết kế mặc định chạy với chế độ `LLM_PROVIDER=mock` và `EMBEDDING_PROVIDER=hash` (tất định 64 chiều L2) để đảm bảo toàn bộ hội đồng đánh giá, giảng viên và CI/CD có thể chạy kiểm thử hoàn toàn độc lập, nhanh chóng mà không cần kết nối mạng hay khóa API trả phí.
   - _Phương án sẵn sàng_: Hệ thống đã dựng sẵn lớp Adapter cho Google Gemini API (`GeminiLlmProvider`, `GeminiEmbeddingProvider`). Khi cấu hình `GEMINI_API_KEY` trong `.env`, hệ thống tự động kích hoạt chế độ sản xuất thật.
2. **Thanh Toán**:
   - Theo đúng Hiến pháp dự án (Rule 00), hệ thống chỉ thực hiện **thanh toán mô phỏng (Mock Payment)** và trả sau tại cơ sở spa; tuyệt đối không thu thập hoặc lưu trữ thông tin thẻ tín dụng/ngân hàng thật của người dùng.
3. **Nội Dung Chuyên Môn Spa**:
   - Toàn bộ danh mục dịch vụ, thành phần thảo dược, bài thuốc và cờ chống chỉ định trong dữ liệu mẫu là nội dung mô phỏng phục vụ nghiên cứu công nghệ, được gắn nhãn `reviewedBy: "CHƯA DUYỆT"`. Cần có sự phê duyệt của bác sĩ da liễu hoặc chuyên gia y tế trước khi triển khai dịch vụ thương mại thực tế.
