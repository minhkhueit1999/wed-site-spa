# DOMAIN — Mô hình nghiệp vụ

> Nội dung chuyên môn spa trong tài liệu này là **NỘI DUNG MẪU để dựng hệ thống**. Cần chuyên gia spa/y tế duyệt trước khi dùng thật.

## 1. Thực thể chính (gợi ý lược đồ Prisma)

| Thực thể                      | Trường chính                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| User                          | id, email, passwordHash, name, role (CUSTOMER/THERAPIST/ADMIN), createdAt                    |
| CustomerProfile               | userId, safetyFlags (mảng chuỗi), consentAt, notes                                           |
| Concern (triệu chứng)         | slug, name, category, description, searchKeywords                                            |
| Service (dịch vụ/phác đồ)     | slug, name, description, durationMin, sessionsRecommended, priceVnd, active                  |
| Product (sản phẩm tại nhà)    | slug, name, description, usageGuide, priceVnd, active                                        |
| ServiceProduct                | serviceSlug, productSlug (sản phẩm nào đi kèm dịch vụ nào)                                   |
| Rule                          | id, concernSlug, minSeverity, serviceSlug, productSlugs, priority, rationale, active         |
| Contraindication              | flag, blocksServiceSlugs, blocksProductSlugs, requiresStaffReview, message                   |
| Assessment                    | id, customerId, type, answers (JSON), concernScores (JSON), createdAt                        |
| TreatmentPlan                 | id, customerId, serviceSlug, totalSessions, state, createdAt                                 |
| PlanStateHistory              | planId, from, event, to, actorId, at, reason                                                 |
| Appointment                   | id, planId, therapistId, startAt, endAt, status (SCHEDULED/COMPLETED/CANCELLED/NO_SHOW)      |
| SessionLog                    | id, appointmentId, therapistId, notes, progressScores (JSON), adjustments, nextSessionAdvice |
| HomeCarePrescription          | id, planId, productSlug, instructions, frequency, startDate, endDate, prescribedBy           |
| CareBundle                    | id, customerId, planId, status, items (buổi hẹn + toa), totalVnd (mô phỏng)                  |
| KnowledgeDoc / KnowledgeChunk | slug, title, type, text, embedding, reviewedBy, updatedAt                                    |
| AuditLog                      | id, actorId, action, targetType, targetId, at                                                |

## 2. Vòng đời (TreatmentPlan)

`ASSESSED → RECOMMENDED → BUNDLE_CONFIRMED → IN_TREATMENT → HOME_CARE → REASSESSMENT → COMPLETED` (+ `CANCELLED`, `LAPSED`). Bảng sự kiện/guard đầy đủ ở skill `treatment-lifecycle`.

```
ASSESSED ──► RECOMMENDED ──► BUNDLE_CONFIRMED ──► IN_TREATMENT ◄──┐
                                                   │              │ CONTINUE_PLAN
                                          FINISH_SESSIONS         │
                                                   ▼              │
                                               HOME_CARE ──► REASSESSMENT ──► COMPLETED
```

## 3. Ví dụ dữ liệu mẫu để seed (mẫu, cần duyệt)

### Triệu chứng

| slug          | Tên                        | Nhóm                  |
| ------------- | -------------------------- | --------------------- |
| `mat-ngu`     | Khó ngủ, ngủ chập chờn     | giấc ngủ / căng thẳng |
| `cang-thang`  | Căng thẳng kéo dài         | căng thẳng            |
| `moi-vai-gay` | Mỏi vai gáy                | cơ xương              |
| `da-kich-ung` | Da dễ kích ứng, nhạy cảm   | da                    |
| `da-kho`      | Da khô, thiếu ẩm           | da                    |
| `da-xin-mau`  | Da xỉn màu, thiếu sức sống | da                    |

### Dịch vụ (ví dụ)

| slug                   | Tên                                | Số buổi gợi ý |
| ---------------------- | ---------------------------------- | ------------- |
| `thu-gian-sau`         | Liệu trình thư giãn sâu & ngủ ngon | 6             |
| `giai-toa-vai-gay`     | Liệu trình giải tỏa vai gáy        | 6             |
| `phuc-hoi-da-nhay-cam` | Liệu trình phục hồi da nhạy cảm    | 8             |
| `cap-am-sang-da`       | Liệu trình cấp ẩm & làm sáng da    | 6             |

### Sản phẩm tại nhà (ví dụ, tên minh họa)

| slug                  | Tên                           | Gắn với dịch vụ                      |
| --------------------- | ----------------------------- | ------------------------------------ |
| `tinh-dau-thu-gian`   | Tinh dầu thư giãn buổi tối    | thu-gian-sau                         |
| `tra-thao-moc-toi`    | Trà thảo mộc buổi tối         | thu-gian-sau                         |
| `dau-massage-vai-gay` | Dầu massage ấm vai gáy        | giai-toa-vai-gay                     |
| `mieng-dan-nhiet`     | Miếng dán ấm vai gáy          | giai-toa-vai-gay                     |
| `serum-phuc-hoi`      | Serum phục hồi dịu nhẹ        | phuc-hoi-da-nhay-cam                 |
| `kem-duong-am`        | Kem dưỡng ẩm không hương liệu | phuc-hoi-da-nhay-cam, cap-am-sang-da |

### Luật (ví dụ)

| id    | Triệu chứng | minSeverity | Dịch vụ              | Sản phẩm                             | priority |
| ----- | ----------- | ----------- | -------------------- | ------------------------------------ | -------- |
| R-001 | mat-ngu     | 2           | thu-gian-sau         | tinh-dau-thu-gian, tra-thao-moc-toi  | 5        |
| R-002 | cang-thang  | 3           | thu-gian-sau         | tinh-dau-thu-gian                    | 4        |
| R-003 | moi-vai-gay | 2           | giai-toa-vai-gay     | dau-massage-vai-gay, mieng-dan-nhiet | 5        |
| R-004 | da-kich-ung | 2           | phuc-hoi-da-nhay-cam | serum-phuc-hoi, kem-duong-am         | 6        |
| R-005 | da-kho      | 2           | cap-am-sang-da       | kem-duong-am                         | 4        |

### Chống chỉ định / cờ an toàn (ví dụ)

| Cờ                          | Tác động                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `pregnant`                  | Chặn các sản phẩm có tinh dầu mạnh và dịch vụ massage cường độ mạnh; yêu cầu nhân viên xem xét |
| `allergy-essential-oil`     | Chặn sản phẩm tinh dầu; yêu cầu nhân viên xem xét                                              |
| `open-wound-skin-infection` | Chặn dịch vụ tác động lên da vùng liên quan; khuyên gặp bác sĩ                                 |
| `fever-acute-illness`       | Khuyên hoãn dịch vụ; yêu cầu nhân viên xem xét                                                 |
| `recent-surgery`            | Yêu cầu nhân viên xem xét trước khi đặt lịch                                                   |

## 4. Trắc nghiệm

Cấu hình dưới dạng dữ liệu (`src/data/quizzes.ts`): mỗi câu có `id`, nội dung, danh sách đáp án, và `weights` (đáp án → cộng điểm cho triệu chứng nào). Bộ điểm triệu chứng đầu ra (1–5) đưa vào rule engine. Có 3 nhánh: da, căng thẳng/giấc ngủ, cơ vai gáy. Câu an toàn (mang thai, dị ứng, vết thương, sốt, phẫu thuật gần đây) tạo `safetyFlags`.

## 5. Quy tắc nghiệp vụ quan trọng

1. Sản phẩm trong túi liệu trình/toa phải thuộc `ServiceProduct` của dịch vụ đang theo và không bị chống chỉ định.
2. Chỉ THERAPIST được tạo `HomeCarePrescription` và `SessionLog`.
3. Gợi ý có cảnh báo `requiresStaffReview` phải được nhân viên duyệt trước khi `CONFIRM_BUNDLE`.
4. Tái đánh giá khi đủ số buổi hoặc sau N ngày ở `HOME_CARE` (N cấu hình, mặc định 21).
5. Hủy/hoãn lịch: trước giờ hẹn tối thiểu 12 giờ (cấu hình), quá hạn đánh dấu theo chính sách.
