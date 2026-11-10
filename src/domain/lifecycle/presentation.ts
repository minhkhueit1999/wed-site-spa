import { PlanState, UserRole } from './types';

export interface StatePresentation {
  label: string;
  badgeVariant:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'terracotta'
    | 'success'
    | 'warning'
    | 'error'
    | 'outline';
  description: string;
  nextAction: Record<UserRole, string>;
}

export const STATE_PRESENTATIONS: Record<PlanState, StatePresentation> = {
  ASSESSED: {
    label: 'Đã khảo sát',
    badgeVariant: 'secondary',
    description: 'Bài trắc nghiệm đã được ghi nhận và đang chờ phân tích phác đồ.',
    nextAction: {
      CUSTOMER: 'Xem gợi ý phác đồ cá nhân hóa',
      THERAPIST: 'Xem kết quả khảo sát của khách',
      ADMIN: 'Kiểm tra luật gợi ý',
      SYSTEM: 'Tự động tạo danh sách gợi ý',
    },
  },
  RECOMMENDED: {
    label: 'Đã gợi ý phác đồ',
    badgeVariant: 'terracotta',
    description: 'Hệ thống đã đề xuất phác đồ điều trị và toa chăm sóc tại nhà phù hợp.',
    nextAction: {
      CUSTOMER: 'Xác nhận túi liệu trình và chọn buổi hẹn',
      THERAPIST: 'Hỗ trợ khách hàng giải đáp thắc mắc',
      ADMIN: 'Theo dõi tỷ lệ chuyển đổi',
      SYSTEM: 'Theo dõi hạn xác nhận',
    },
  },
  BUNDLE_CONFIRMED: {
    label: 'Đã xác nhận túi liệu trình',
    badgeVariant: 'primary',
    description: 'Lịch hẹn tại spa và toa chăm sóc tại nhà đã được kích hoạt thành công.',
    nextAction: {
      CUSTOMER: 'Đến đúng giờ theo lịch hẹn tại spa',
      THERAPIST: 'Chuẩn bị phòng và đón tiếp khách hàng',
      ADMIN: 'Quản lý lịch cơ sở',
      SYSTEM: 'Gửi nhắc nhở lịch hẹn',
    },
  },
  IN_TREATMENT: {
    label: 'Đang trong liệu trình',
    badgeVariant: 'primary',
    description: 'Khách hàng đang theo học phần trị liệu tại cơ sở cùng chuyên viên.',
    nextAction: {
      CUSTOMER: 'Theo dõi nhật ký sau mỗi buổi trị liệu',
      THERAPIST: 'Ghi nhật ký tiến triển và cập nhật toa dưỡng',
      ADMIN: 'Giám sát chất lượng phục vụ',
      SYSTEM: 'Nhắc lịch buổi tiếp theo',
    },
  },
  HOME_CARE: {
    label: 'Chăm sóc tại nhà',
    badgeVariant: 'secondary',
    description: 'Đã hoàn thành các buổi tại spa; đang duy trì toa dưỡng chuyên biệt tại nhà.',
    nextAction: {
      CUSTOMER: 'Sử dụng toa dưỡng đúng hướng dẫn và ghi nhận cảm giác',
      THERAPIST: 'Theo dõi phản hồi và chuẩn bị tái đánh giá',
      ADMIN: 'Theo dõi kết quả phác đồ',
      SYSTEM: 'Nhắc lịch tái đánh giá sau 21 ngày',
    },
  },
  REASSESSMENT: {
    label: 'Tái đánh giá',
    badgeVariant: 'warning',
    description: 'Đến kỳ đo lường lại chỉ số phục hồi để quyết định hoàn tất hoặc bổ sung buổi.',
    nextAction: {
      CUSTOMER: 'Làm bài đánh giá lại chỉ số cải thiện',
      THERAPIST: 'Đánh giá tiến triển: Hoàn tất hoặc kê thêm buổi',
      ADMIN: 'Xem báo cáo hiệu quả điều trị',
      SYSTEM: 'Tổng hợp chỉ số trước/sau',
    },
  },
  COMPLETED: {
    label: 'Hoàn thành liệu trình',
    badgeVariant: 'success',
    description: 'Liệu trình đã đạt mục tiêu phục hồi dự kiến thành công tốt đẹp.',
    nextAction: {
      CUSTOMER: 'Xem tổng kết hành trình và toa duy trì dài hạn',
      THERAPIST: 'Lưu trữ hồ sơ hoàn thành',
      ADMIN: 'Lưu trữ chỉ số thành công',
      SYSTEM: 'Gửi thư cảm ơn',
    },
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeVariant: 'error',
    description: 'Liệu trình đã dừng theo yêu cầu của khách hàng hoặc lý do bất khả kháng.',
    nextAction: {
      CUSTOMER: 'Khảo sát lại khi có nhu cầu',
      THERAPIST: 'Cập nhật lý do hủy vào hồ sơ',
      ADMIN: 'Ghi nhận phân tích nguyên nhân hủy',
      SYSTEM: 'Giải phóng khung giờ kỹ thuật viên',
    },
  },
  LAPSED: {
    label: 'Tạm gián đoạn',
    badgeVariant: 'outline',
    description: 'Quá hạn chưa đặt buổi hẹn hoặc chưa quay lại tái đánh giá.',
    nextAction: {
      CUSTOMER: 'Kích hoạt lại liệu trình với đánh giá nhanh',
      THERAPIST: 'Liên hệ chăm sóc khách hàng',
      ADMIN: 'Theo dõi khách hàng gián đoạn',
      SYSTEM: 'Gửi thông báo tái kích hoạt',
    },
  },
};
