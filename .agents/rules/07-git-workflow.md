---
trigger: always_on
---

# Quy trình Git

- Nhánh: `main` luôn chạy được. Làm việc trên nhánh `feat/<ten-ngan>`, `fix/<ten-ngan>`, `chore/<ten-ngan>`, `docs/<ten-ngan>`. Gộp vào `main` qua Pull Request (hoặc merge sau khi `/quality-check` xanh nếu người dùng chọn làm một mình).
- Commit nhỏ, đúng một ý, theo Conventional Commits: `feat(recommendation): thêm luật cho nhóm triệu chứng mất ngủ`. Loại: feat, fix, docs, style, refactor, test, chore, build, ci.
- Commit trước mỗi thay đổi lớn (điểm khôi phục) và sau mỗi bước chạy được.
- KHÔNG: `git push --force`, `git reset --hard` trên nhánh đã đẩy, sửa lịch sử đã đẩy, commit `.env`/khóa/dữ liệu khách, commit `node_modules`/`.next`/file DB.
- KHÔNG đẩy khi `/quality-check` hoặc Gitleaks còn lỗi.
- Remote: nếu chưa có `origin`, hỏi người dùng URL repo, hoặc (khi người dùng đồng ý) tạo bằng `gh repo create <tên> --private --source=. --remote=origin`. Đẩy lần đầu: `git push -u origin <nhánh>`. Không tự tạo repo công khai.
- Cuối mỗi giai đoạn trong `prompts/phases.md`: chạy `/git-publish` rồi báo link commit/nhánh.
- Nếu `git push` bị từ chối vì chưa đăng nhập, hướng dẫn người dùng chạy `gh auth login` rồi thử lại; không yêu cầu người dùng dán token vào cuộc trò chuyện.
