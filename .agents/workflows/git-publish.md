---
description: Kiểm tra chất lượng, commit theo Conventional Commits và đẩy mã lên repo Git của người dùng (không bao giờ force push).
---

# /git-publish

KHÔNG dùng `// turbo` cho workflow này: các lệnh đẩy mã phải được người dùng chấp thuận.

1. Xem trạng thái: `git status` và `git branch --show-current`.
2. Chạy workflow `/quality-check`. Còn lỗi hoặc Gitleaks báo secret → DỪNG, báo người dùng, không đẩy.
3. Đảm bảo không có file cấm trong thay đổi: `.env`, khóa API, file `*.db`, `node_modules`, `.next`. Có → bỏ khỏi stage và kiểm tra `.gitignore`.
4. Nếu đang ở `main` và có thay đổi: tạo nhánh `feat/<ten-ngan>` hoặc `chore/<ten-ngan>` phù hợp.
5. Stage và commit theo Conventional Commits (tiếng Anh cho tiền tố, mô tả rõ ý). Chia nhiều commit nếu thay đổi gồm nhiều ý.
6. Kiểm tra remote: `git remote -v`.
   - Chưa có `origin`: hỏi người dùng URL repo GitHub của họ. Nếu họ muốn tạo repo mới và đã chạy `gh auth login`, dùng `gh repo create <ten-repo> --private --source=. --remote=origin`. KHÔNG tự tạo repo công khai.
7. Đẩy: `git push -u origin <nhánh-hiện-tại>`. Bị từ chối vì chưa đăng nhập → hướng dẫn người dùng chạy `gh auth login` rồi thử lại (không yêu cầu dán token vào chat). Bị từ chối vì lịch sử khác → dừng và hỏi, KHÔNG force push.
8. (Tùy chọn, hỏi người dùng) mở Pull Request: `gh pr create --fill`.
9. Báo cáo: nhánh, các commit đã đẩy, link repo/nhánh/PR.
