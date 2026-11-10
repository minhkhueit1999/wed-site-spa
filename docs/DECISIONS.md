# Nhật ký quyết định

Ghi mỗi quyết định kỹ thuật/thiết kế đáng nhớ: ngày, quyết định, lý do, phương án đã loại.

| Ngày       | Quyết định                                                                           | Lý do / ghi chú                                                                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (khởi tạo) | Stack: Next.js App Router + TypeScript + Tailwind + Prisma/SQLite + Auth.js + Vitest | Phổ biến, nhiều tài liệu, dễ demo; SQLite đủ cho đồ án, đổi sang PostgreSQL khi triển khai                                                                       |
| (khởi tạo) | Rule engine tất định, RAG chỉ giải thích                                             | Kết quả gợi ý phải kiểm thử và giải trình được với giảng viên                                                                                                    |
| (khởi tạo) | Vector store trong SQLite + cosine trong Node, qua interface `VectorStore`           | Tri thức vài trăm đoạn là đủ; có thể đổi sang pgvector mà không đổi nghiệp vụ                                                                                    |
| (khởi tạo) | Nhà cung cấp LLM/embedding qua interface, cấu hình bằng env, có bản giả cho test     | Không phụ thuộc một nhà cung cấp, CI chạy được không cần khóa API                                                                                                |
| (khởi tạo) | Thanh toán chỉ mô phỏng                                                              | Ngoài phạm vi đồ án; tránh xử lý dữ liệu thẻ                                                                                                                     |
| (khởi tạo) | Thư mục cấu hình agent dùng `.agents/`                                               | Là vị trí mặc định hiện hành của Antigravity; `.agent/` cũ vẫn được hỗ trợ                                                                                       |
| 2026-11-10 | MCP context7 & chrome-devtools                                                       | context7 hoạt động chuẩn xác; chrome-devtools lỗi thiếu Google Chrome tại đường dẫn mặc định -> dùng Playwright làm giải pháp thay thế kiểm tra giao diện và E2E |
| 2026-11-10 | Di chuyển bộ starter kit ra root                                                     | Thư mục `spa-antigravity-kit` được chuyển toàn bộ ra thư mục gốc workspace để khớp tài liệu và remote git                                                        |

## Nội dung cần chuyên gia duyệt

- [ ] Tên và mô tả dịch vụ/sản phẩm mẫu trong `DOMAIN.md` và dữ liệu seed
- [ ] Danh sách chống chỉ định/cờ an toàn
- [ ] Tài liệu `data/knowledge/*` có `reviewedBy: "CHƯA DUYỆT"`
- [ ] Mẫu phản hồi cờ đỏ của trợ lý AI
