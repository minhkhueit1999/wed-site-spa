# Nhật ký quyết định

Ghi mỗi quyết định kỹ thuật/thiết kế đáng nhớ: ngày, quyết định, lý do, phương án đã loại.

| Ngày       | Quyết định                                                                           | Lý do / ghi chú                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (khởi tạo) | Stack: Next.js App Router + TypeScript + Tailwind + Prisma/SQLite + Auth.js + Vitest | Phổ biến, nhiều tài liệu, dễ demo; SQLite đủ cho đồ án, đổi sang PostgreSQL khi triển khai                                                                                                              |
| (khởi tạo) | Rule engine tất định, RAG chỉ giải thích                                             | Kết quả gợi ý phải kiểm thử và giải trình được với giảng viên                                                                                                                                           |
| (khởi tạo) | Vector store trong SQLite + cosine trong Node, qua interface `VectorStore`           | Tri thức vài trăm đoạn là đủ; có thể đổi sang pgvector mà không đổi nghiệp vụ                                                                                                                           |
| (khởi tạo) | Nhà cung cấp LLM/embedding qua interface, cấu hình bằng env, có bản giả cho test     | Không phụ thuộc một nhà cung cấp, CI chạy được không cần khóa API                                                                                                                                       |
| (khởi tạo) | Thanh toán chỉ mô phỏng                                                              | Ngoài phạm vi đồ án; tránh xử lý dữ liệu thẻ                                                                                                                                                            |
| (khởi tạo) | Thư mục cấu hình agent dùng `.agents/`                                               | Là vị trí mặc định hiện hành của Antigravity; `.agent/` cũ vẫn được hỗ trợ                                                                                                                              |
| 2026-11-10 | MCP context7 & chrome-devtools                                                       | context7 hoạt động chuẩn xác; chrome-devtools lỗi thiếu Google Chrome tại đường dẫn mặc định -> dùng Playwright làm giải pháp thay thế kiểm tra giao diện và E2E                                        |
| 2026-11-10 | Di chuyển bộ starter kit ra root                                                     | Thư mục `spa-antigravity-kit` được chuyển toàn bộ ra thư mục gốc workspace để khớp tài liệu và remote git                                                                                               |
| 2026-11-10 | RAG: HashEmbeddingProvider & Hybrid Retriever (RRF k=60)                             | Mô phỏng tất định 64 chiều bằng kỹ thuật n-gram hashing trick và chuẩn hóa L2, kết hợp BM25 keyword matching qua RRF giúp recall@5 đạt 100% trong test/CI không cần API key                             |
| 2026-11-10 | Immersive Motion & WebGL Architecture (Awwwards/FWA Standard)                        | Tách biệt lớp 3D qua dynamic import (`ssr: false`), phân tầng 3-Tier Adaptive Quality, Runtime FPS Guard (< 30 FPS tự hạ cấp), hợp nhất render ticker (Lenis + GSAP + R3F), dọn dẹp triệt để bộ nhớ GPU |
| 2026-11-10 | Immersive Motion & WebGL Architecture (Awwwards/FWA Standard)                        | Tách biệt lớp 3D qua dynamic import (`ssr: false`), phân tầng 3-Tier Adaptive Quality, Runtime FPS Guard (< 30 FPS tự hạ cấp), hợp nhất render ticker (Lenis + GSAP + R3F), dọn dẹp triệt để bộ nhớ GPU |

## Nội dung cần chuyên gia duyệt

Toàn bộ 19 tài liệu tri thức trong `data/knowledge/` đều được gắn nhãn `reviewedBy: "CHƯA DUYỆT"` và chỉ phục vụ mục đích dựng hệ thống đồ án, cần hội đồng/bác sĩ/chuyên gia spa thẩm định trước khi đưa vào sản xuất:

1. **Dịch vụ (`service`)**:
   - `service-thu-gian-sau.md`: Liệu trình thư giãn sâu & ngủ ngon (75 phút, 6 buổi)
   - `service-giai-toa-vai-gay.md`: Liệu trình giải tỏa cổ vai gáy (60 phút, 8 buổi)
   - `service-cap-am-sang-da.md`: Liệu trình cấp ẩm & sáng da toàn diện (60 phút, 5 buổi)
   - `service-phuc-hoi-da-nhay-cam.md`: Liệu trình phục hồi da nhạy cảm & giảm đỏ (60 phút, 6 buổi)
2. **Sản phẩm toa tại nhà (`product`)**:
   - `product-tinh-dau-thu-gian.md`: Tinh dầu oải hương nguyên chất
   - `product-tra-thao-moc-ngu-ngon.md`: Trà thảo mộc cúc la mã & tâm sen
   - `product-cao-xoa-bop-thao-duoc.md`: Cao xoa bóp thiên niên kiện & quế chi
   - `product-tui-chuom-thao-moc.md`: Túi chườm ngải cứu giữ nhiệt
   - `product-serum-hyaluronic-b5.md`: Serum HA đa tầng & Panthenol 5%
   - `product-kem-duong-phuc-hoi.md`: Kem dưỡng phục hồi lipid phức hợp Ceramide
3. **Triệu chứng & thể trạng (`concern`)**:
   - `concern-mat-ngu.md`, `concern-cang-thang.md`, `concern-moi-vai-gay.md`, `concern-da-kho.md`, `concern-da-nhay-cam.md`, `concern-thoai-hoa-co.md`
4. **Chính sách & giải đáp (`policy`, `faq`)**:
   - `policy-chong-chi-dinh.md`: Danh mục chống chỉ định tuyệt đối & lưu ý đặc biệt
   - `policy-dat-lich-huy-hen.md`: Quy định thời gian dời hẹn & chính sách buổi hẹn
   - `faq-cham-soc-tai-nha.md`: Triết lý không bán lẻ sản phẩm đại trà & xử lý kích ứng tại nhà
5. **Mẫu phản hồi y tế khẩn cấp**:
   - Mẫu phản hồi cố định `CANNED_RED_FLAG_RESPONSE` khuyên khách hàng đến ngay cơ sở y tế khi có dấu hiệu cờ đỏ, hoàn toàn không gọi LLM và không thu thập PII.
