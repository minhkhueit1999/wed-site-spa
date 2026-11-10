# PRD — Digital Wellness Platform (Hệ thống Quản lý Liệu trình & Chăm sóc Cá nhân hóa)

## 1. Đặt vấn đề

- Website spa hiện nay tách việc đặt lịch và giỏ hàng mua sắm, khiến trải nghiệm rời rạc và thiếu tư vấn chuyên môn.
- Đề tài giải bài toán liên kết dữ liệu giữa dịch vụ tại chỗ (offline) và quy trình dưỡng tại nhà (online) trong MỘT luồng duy nhất.
- Chuyển hướng: từ "website đặt lịch + bán lẻ TMĐT" sang "nền tảng quản lý liệu trình & chăm sóc cá nhân hóa". Sản phẩm là "toa chăm sóc tại nhà" đi kèm dịch vụ, không bán đại trà.

## 2. Đối tượng sử dụng

| Vai trò                   | Mục tiêu                                                                                 |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Khách hàng (CUSTOMER)     | Biết mình nên làm liệu trình nào, đặt lịch dễ, theo dõi tiến triển, biết dùng gì tại nhà |
| Kỹ thuật viên (THERAPIST) | Xem hồ sơ khách, ghi nhật ký sau buổi, chỉ định sản phẩm tiếp theo nhanh và an toàn      |
| Quản trị (ADMIN)          | Quản lý dịch vụ, sản phẩm, luật gợi ý, chống chỉ định, tri thức cho trợ lý AI            |

## 3. Chức năng cốt lõi

### F1. Trắc nghiệm chẩn đoán (Consultation Flow)

Khảo sát tình trạng da / mức độ căng thẳng / giấc ngủ / cơ vai gáy. Hệ thống tự ghép gói dịch vụ tại spa kèm bộ sản phẩm dưỡng tương ứng.

- Tiêu chí chấp nhận: hoàn thành trắc nghiệm trong ≤ 10 câu; có bước đồng ý lưu dữ liệu; kết quả hiển thị dịch vụ chính + sản phẩm + "Vì sao bạn được gợi ý điều này"; câu hỏi có thể quay lại, lưu tạm.

### F2. Hồ sơ theo dõi trị liệu (Treatment Tracker)

Lưu nhật ký tiến triển sau mỗi buổi để kỹ thuật viên chỉ định sản phẩm cần dùng tiếp ngay trên tài khoản khách.

- Tiêu chí chấp nhận: kỹ thuật viên ghi được ghi chú + chỉ số 1–10 + chỉ định sản phẩm hợp lệ; khách thấy dòng thời gian, biểu đồ tiến triển và toa hiện tại; sản phẩm vi phạm chống chỉ định bị chặn.

### F3. Đặt lịch theo triệu chứng (Symptom-Based UX)

Thay bộ lọc danh mục bán lẻ bằng tìm kiếm giải pháp trọn gói theo vấn đề thực tế: mất ngủ, mỏi vai gáy, da kích ứng...

- Tiêu chí chấp nhận: tìm theo từ khóa tự nhiên (có dấu/không dấu); kết quả là gói giải pháp (dịch vụ + toa tại nhà), không phải lưới sản phẩm.

### F4. Túi liệu trình tích hợp (Unified Booking)

Gộp xác nhận lịch hẹn và nhận sản phẩm đi kèm vào một luồng xử lý, thay cho giỏ hàng truyền thống.

- Tiêu chí chấp nhận: một trang gồm buổi hẹn + toa tại nhà + tổng quan chi phí mô phỏng + một nút xác nhận; không có thao tác thêm/bớt số lượng kiểu bán lẻ.

### F5. Trợ lý tư vấn AI (RAG)

Khung hỏi đáp trả lời dựa trên tài liệu của spa, có trích nguồn, từ chối khi ngoài phạm vi, chuyển nhân viên khi có cờ đỏ.

- Tiêu chí chấp nhận: mọi câu trả lời có nguồn hoặc phản hồi dự phòng; bộ đánh giá `rag:eval` không có vi phạm; không lộ prompt hệ thống.

### F6. Quản trị

CRUD dịch vụ, sản phẩm, triệu chứng, luật gợi ý, chống chỉ định, tài liệu tri thức; xem trước kết quả gợi ý khi sửa luật.

## 4. Điểm nhấn kỹ thuật

1. **State-driven workflow**: vòng đời khách hàng từ khảo sát → gợi ý → túi liệu trình → điều trị tại spa → chăm sóc tại nhà → đánh giá lại, hiện thực bằng state machine có guard, lịch sử chuyển trạng thái và test đầy đủ.
2. **Logic gợi ý rule-based**: ánh xạ tự động triệu chứng → phác đồ dịch vụ → sản phẩm đi kèm, có chống chỉ định và giải thích lý do (thay cho thao tác thêm/sửa/xóa bán hàng cơ bản).
3. **Hạ tầng RAG**: ingest → chunk → embedding → vector store → truy xuất lai → kiểm tra an toàn → sinh câu trả lời có trích nguồn → đánh giá tự động.
4. **Kiến trúc phân lớp** (`domain` thuần, `application`, `infrastructure`) với kiểm soát hướng phụ thuộc bằng ESLint.
5. **Chất lượng kỹ thuật**: TypeScript strict, Vitest (coverage domain ≥ 90%), Playwright cho hành trình chính, ESLint/Prettier/Husky, Gitleaks, CI.

## 5. Ngoài phạm vi (non-goals)

- Thanh toán thật, hóa đơn điện tử, quản lý kho, vận chuyển.
- Chẩn đoán y khoa. Đây là hỗ trợ chăm sóc sức khỏe/làm đẹp, không thay thế bác sĩ.
- Ứng dụng di động native (chỉ web responsive).

## 6. Sơ đồ route

| Route                       | Vai trò                    | Mô tả                                            |
| --------------------------- | -------------------------- | ------------------------------------------------ |
| `/`                         | công khai                  | Trang chủ                                        |
| `/trieu-chung`              | công khai                  | Tìm giải pháp theo triệu chứng                   |
| `/tu-van`                   | công khai/đăng nhập để lưu | Trắc nghiệm                                      |
| `/ket-qua`                  | công khai/đăng nhập để lưu | Kết quả + lý do gợi ý + trợ lý AI                |
| `/dich-vu/[slug]`           | công khai                  | Chi tiết dịch vụ + toa đi kèm                    |
| `/dang-nhap`, `/dang-ky`    | công khai                  | Xác thực                                         |
| `/tui-lieu-trinh`           | CUSTOMER                   | Túi liệu trình (đặt lịch + toa một luồng)        |
| `/tai-khoan`                | CUSTOMER                   | Theo dõi trị liệu, toa hiện tại, dữ liệu cá nhân |
| `/ky-thuat-vien`            | THERAPIST                  | Danh sách khách/lịch hôm nay                     |
| `/ky-thuat-vien/khach/[id]` | THERAPIST                  | Hồ sơ, ghi nhật ký, chỉ định sản phẩm            |
| `/quan-tri/*`               | ADMIN                      | Quản trị danh mục, luật, tri thức                |
| `/api/assistant`            | công khai (rate limit)     | Trợ lý RAG                                       |

## 7. Yêu cầu phi chức năng

- Hiệu năng: LCP < 2,5s, CLS < 0,1 trên bản build, điểm Lighthouse hiệu năng/trợ năng/SEO ≥ 90 ở trang công khai.
- Trợ năng: WCAG 2.2 AA cho các luồng chính.
- Bảo mật & riêng tư: theo rule `05-security-privacy`.
- SEO: metadata, Open Graph, sitemap, dữ liệu có cấu trúc cho trang dịch vụ.
- i18n: chỉ tiếng Việt; chuỗi UI gom về một nơi để mở rộng sau.

## 8. Kịch bản demo cho giảng viên (5 phút)

1. Khách làm trắc nghiệm "mất ngủ + căng vai gáy" → thấy gợi ý + lý do + cảnh báo.
2. Thử thêm cờ "đang mang thai" → hệ thống chặn một dịch vụ và hiển thị cảnh báo (minh họa chống chỉ định).
3. Xác nhận túi liệu trình trong một luồng → trạng thái `BUNDLE_CONFIRMED`.
4. Đăng nhập kỹ thuật viên → ghi nhật ký buổi 1, chỉ định sản phẩm tiếp theo → trạng thái `IN_TREATMENT`.
5. Khách mở tài khoản → thấy dòng thời gian, biểu đồ, toa tại nhà.
6. Hỏi trợ lý AI một câu trong phạm vi (có nguồn), một câu ngoài phạm vi (từ chối), một câu cờ đỏ (chuyển nhân viên).
7. Mở bộ test + sơ đồ state machine + báo cáo `rag:eval` để chứng minh chất lượng.

## 9. Rủi ro

| Rủi ro                                        | Giảm thiểu                                                                    |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| Nội dung chuyên môn spa do AI viết có thể sai | Gắn nhãn "CHƯA DUYỆT", nhờ chuyên gia spa duyệt trước khi dùng thật           |
| LLM bịa hoặc nói quá                          | Chỉ trả lời từ nguồn truy xuất, hậu kiểm, bộ đánh giá, mẫu cờ đỏ cố định      |
| Phạm vi quá rộng                              | Làm theo giai đoạn trong `prompts/phases.md`, dừng chờ xác nhận mỗi giai đoạn |
| Lộ dữ liệu sức khỏe                           | Phân quyền ở server, tối thiểu hóa dữ liệu, không gửi PII tới LLM             |
