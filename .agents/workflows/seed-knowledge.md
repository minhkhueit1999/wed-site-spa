---
description: Tạo/kiểm tra tài liệu tri thức cho RAG trong data/knowledge, nạp vào vector store, chạy đánh giá và ghi nhật ký kết quả.
---

# /seed-knowledge

Làm theo skill `rag-pipeline` và rule `06-rag-ai`.

1. Liệt kê chủ đề cần có từ `docs/DOMAIN.md` (mỗi dịch vụ, mỗi sản phẩm, mỗi triệu chứng, FAQ, chính sách đặt lịch/hủy, lưu ý chống chỉ định).
2. Với chủ đề thiếu tài liệu: viết file `data/knowledge/<type>-<slug>.md` bằng tiếng Việt, ngắn gọn, có frontmatter đủ trường. Nội dung do AI viết: đặt `reviewedBy: "CHƯA DUYỆT"`, không đưa tuyên bố y khoa, có mục "Lưu ý/Chống chỉ định". Ghi vào `docs/DECISIONS.md` rằng cần chuyên gia spa duyệt.
3. Kiểm tra frontmatter hợp lệ (loader báo lỗi file sai).
4. Nạp dữ liệu:
   // turbo
   `npm run rag:ingest`
5. Cập nhật `data/eval/rag-questions.json` cho các tài liệu mới (ít nhất 2 câu hỏi đúng chủ đề, 1 câu ngoài phạm vi, 1 câu cờ đỏ, 1 câu thử prompt-injection cho mỗi nhóm lớn).
6. Chạy đánh giá:
   // turbo
   `npm run rag:eval`
7. Ghi chỉ số (recall@k, tỷ lệ từ chối đúng, vi phạm mustNotContain) vào `docs/rag-eval-log.md` kèm ngày và thay đổi đã làm. Tụt chỉ số so với lần trước → điều tra trước khi tiếp tục.
8. Báo cáo ngắn kết quả.
