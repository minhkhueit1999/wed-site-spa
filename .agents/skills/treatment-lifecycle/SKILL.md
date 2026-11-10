---
name: treatment-lifecycle
description: Thiết kế và hiện thực state machine vòng đời khách hàng (khảo sát → gợi ý → túi liệu trình → điều trị tại spa → chăm sóc tại nhà → đánh giá lại) cùng nhật ký trị liệu và toa chăm sóc. Dùng khi đụng tới src/domain/lifecycle, trạng thái liệu trình, Treatment Tracker, SessionLog hoặc HomeCarePrescription.
---

# Vòng đời liệu trình (state-driven workflow)

## Trạng thái của một TreatmentPlan

`ASSESSED` → `RECOMMENDED` → `BUNDLE_CONFIRMED` → `IN_TREATMENT` → `HOME_CARE` → `REASSESSMENT` → `COMPLETED`
Ngoài luồng chính: `CANCELLED`, `LAPSED` (quá hạn không đặt/không quay lại).

## Sự kiện và chuyển trạng thái

| Từ                           | Sự kiện                 | Đến              | Guard (điều kiện)                                                              | Vai trò            |
| ---------------------------- | ----------------------- | ---------------- | ------------------------------------------------------------------------------ | ------------------ |
| (mới)                        | SUBMIT_ASSESSMENT       | ASSESSED         | đã có đồng ý lưu dữ liệu                                                       | CUSTOMER           |
| ASSESSED                     | GENERATE_RECOMMENDATION | RECOMMENDED      | rule engine trả ≥ 1 gợi ý, hoặc đánh dấu cần tư vấn                            | hệ thống           |
| RECOMMENDED                  | CONFIRM_BUNDLE          | BUNDLE_CONFIRMED | có ≥ 1 lịch hẹn hợp lệ; không còn cảnh báo cần duyệt chưa được nhân viên duyệt | CUSTOMER           |
| BUNDLE_CONFIRMED             | COMPLETE_SESSION        | IN_TREATMENT     | lịch hẹn đã diễn ra, có SessionLog                                             | THERAPIST          |
| IN_TREATMENT                 | COMPLETE_SESSION        | IN_TREATMENT     | còn buổi trong liệu trình                                                      | THERAPIST          |
| IN_TREATMENT                 | FINISH_SESSIONS         | HOME_CARE        | đã hoàn thành đủ số buổi, có toa chăm sóc                                      | THERAPIST          |
| HOME_CARE                    | REQUEST_REASSESSMENT    | REASSESSMENT     | đến hạn tái đánh giá hoặc khách yêu cầu                                        | CUSTOMER/THERAPIST |
| REASSESSMENT                 | CONTINUE_PLAN           | IN_TREATMENT     | kỹ thuật viên kê thêm buổi                                                     | THERAPIST          |
| REASSESSMENT                 | COMPLETE_PLAN           | COMPLETED        | chỉ số tiến triển đạt mục tiêu                                                 | THERAPIST          |
| mọi trạng thái chưa kết thúc | CANCEL                  | CANCELLED        | có lý do                                                                       | CUSTOMER/ADMIN     |
| BUNDLE_CONFIRMED/HOME_CARE   | MARK_LAPSED             | LAPSED           | quá N ngày không hoạt động (N cấu hình)                                        | hệ thống           |
| LAPSED                       | REACTIVATE              | RECOMMENDED      | khách quay lại, làm lại đánh giá nhanh                                         | CUSTOMER           |

## Hiện thực

- Hàm thuần: `transition(state, event, context): Result<{ next: State; effects: Effect[] }, TransitionError>` trong `src/domain/lifecycle/`. KHÔNG có I/O trong hàm này.
- `effects` là mô tả việc cần làm (ví dụ `NOTIFY_CUSTOMER`, `CREATE_PRESCRIPTION_DRAFT`); lớp `application` thực thi và lưu kết quả.
- Lưu mọi chuyển trạng thái vào bảng `PlanStateHistory` (`planId`, `from`, `event`, `to`, `actorId`, `at`, `reason?`). Trạng thái hiện tại luôn suy ra được từ lịch sử.
- Kiểm tra vai trò của người thực hiện trong guard, không chỉ ở UI.
- Sự kiện không hợp lệ trả lỗi có mã (`ILLEGAL_TRANSITION`, `GUARD_FAILED`) — UI hiển thị thông điệp thân thiện.

## Nhật ký trị liệu (Treatment Tracker)

- `SessionLog`: `appointmentId`, `therapistId`, `notes`, chỉ số tiến triển 1–10 theo nhóm (da / căng thẳng / cơ), `adjustments`, `nextSessionAdvice`.
- `HomeCarePrescription`: `planId`, `productSlug`, `instructions`, `frequency`, `startDate`, `endDate`. Chỉ tạo bởi THERAPIST; sản phẩm phải thuộc danh sách gắn với dịch vụ của liệu trình và không vi phạm chống chỉ định của khách.
- Tài khoản khách hiển thị: dòng thời gian trạng thái, biểu đồ chỉ số theo buổi, toa chăm sóc hiện tại, nút hành động tiếp theo (đặt buổi kế, tái đánh giá).

## Ánh xạ UI

Mỗi trạng thái có: nhãn tiếng Việt, màu huy hiệu, mô tả một câu, và "việc tiếp theo" cho từng vai trò. Đặt bảng ánh xạ này ở `src/domain/lifecycle/presentation.ts` (dữ liệu thuần, dễ test).

## Test bắt buộc

- Mọi cặp (trạng thái × sự kiện): hợp lệ → đúng trạng thái đích; không hợp lệ → `ILLEGAL_TRANSITION`.
- Mỗi guard: một ca qua, một ca không qua.
- Chuỗi hành trình đầy đủ từ `ASSESSED` đến `COMPLETED`.
- Hành trình có `REASSESSMENT → CONTINUE_PLAN` rồi `COMPLETE_PLAN`.
