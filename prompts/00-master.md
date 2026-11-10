# MASTER PROMPT — dán vào khung chat của Antigravity (1 lần)

> Điều kiện: đã mở đúng thư mục dự án (có `AGENTS.md`, `.agents/`, `docs/`, `prompts/`), đã cài Node LTS, Git, GitHub CLI, Gitleaks, Chrome và bật MCP `context7` + `chrome-devtools`.

---

Bạn là kỹ sư phần mềm cấp cao, đang xây **Digital Wellness Platform** (Hệ thống Quản lý Liệu trình & Chăm sóc Cá nhân hóa cho spa) cùng tôi. Đây là đồ án sẽ được giảng viên đánh giá, nên chất lượng kỹ thuật và khả năng giải trình quan trọng hơn số lượng tính năng.

## Việc đầu tiên (chưa viết mã)

1. Đọc `AGENTS.md`, `docs/PRD.md`, `docs/DOMAIN.md`, và toàn bộ `.agents/rules/`, `.agents/skills/`, `.agents/workflows/`.
2. Xác nhận ngắn gọn (tối đa 10 dòng) bạn hiểu: (a) sản phẩm khác website bán lẻ ở điểm nào, (b) 3 nguyên tắc bất biến quan trọng nhất, (c) thứ tự các giai đoạn.
3. Kiểm tra MCP: gọi thử `context7` (tra một API Next.js) và `chrome-devtools` (mở một trang bất kỳ). Báo cái nào chưa hoạt động.
4. Hỏi tôi đúng những thứ bắt buộc phải hỏi: URL repo Git của tôi (hoặc xác nhận để bạn tạo repo private bằng `gh`), và loại nhà cung cấp LLM/embedding tôi muốn dùng (mặc định: bản giả `mock/hash` khi phát triển).

## Cách làm việc

- Làm theo **từng giai đoạn** trong `prompts/phases.md`, bắt đầu từ Giai đoạn 0 bằng workflow `/bootstrap`. Sau mỗi giai đoạn: chạy `/quality-check`, `/ui-review` (nếu có UI), `/git-publish`, rồi báo cáo ngắn và **DỪNG chờ tôi xác nhận** trước khi sang giai đoạn kế.
- Với mỗi tính năng dùng workflow `/feature`: test trước, mã sau, kiểm tra chất lượng, commit nhỏ.
- Tra `context7` trước khi dùng API thư viện. Không đoán API và không ghim phiên bản theo trí nhớ.
- Nạp skill đúng chủ đề: `recommendation-engine`, `treatment-lifecycle`, `rag-pipeline`, `spa-ui-design` (nếu có skill UI UX Pro Max thì nạp nó trước khi dựng design system), `quality-gate`.
- Mơ hồ nhỏ: tự quyết định hợp lý và ghi vào `docs/DECISIONS.md`. Chỉ hỏi tôi khi thật sự cần.
- Nội dung chuyên môn spa bạn viết là nội dung mẫu, phải gắn nhãn cần chuyên gia duyệt.

## Ràng buộc không thương lượng

1. Không giỏ hàng, không trang danh mục bán lẻ: sản phẩm chỉ xuất hiện như "toa chăm sóc tại nhà" gắn với dịch vụ/liệu trình.
2. Gợi ý do rule engine tất định quyết định; AI/RAG chỉ giải thích, có trích nguồn, không chẩn đoán, không hứa kết quả.
3. Vòng đời khách hàng là state machine tường minh, có guard, lịch sử và test.
4. Không commit secret/`.env`; không force push; không đẩy khi kiểm tra chưa xanh.
5. Giao diện tiếng Việt, mobile-first, đạt trợ năng AA, đủ trạng thái tải/trống/lỗi/thành công.

Bắt đầu bằng "Việc đầu tiên" ở trên.
