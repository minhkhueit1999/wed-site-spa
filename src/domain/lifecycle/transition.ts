import { Result, ok, err } from '@/domain/shared/result';
import { PlanState, PlanEvent, TransitionContext, Effect, TransitionError } from './types';

export function transition(
  state: PlanState | 'NEW',
  event: PlanEvent,
  context: TransitionContext,
): Result<{ next: PlanState; effects: Effect[] }, TransitionError> {
  const { actorRole } = context;

  // Xử lý sự kiện HỦY (CANCEL) áp dụng cho mọi trạng thái chưa kết thúc
  if (event === 'CANCEL') {
    if (state === 'COMPLETED' || state === 'CANCELLED') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Không thể hủy liệu trình khi đã ở trạng thái ${state}.`,
      });
    }

    if (!context.cancelReason || context.cancelReason.trim().length === 0) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'cancelReason',
        message: 'Cần cung cấp lý do khi yêu cầu hủy liệu trình.',
      });
    }

    if (actorRole !== 'CUSTOMER' && actorRole !== 'ADMIN') {
      return err({
        code: 'GUARD_FAILED',
        guard: 'actorRole',
        message: 'Chỉ khách hàng hoặc quản trị viên mới có quyền hủy liệu trình.',
      });
    }

    return ok({
      next: 'CANCELLED',
      effects: [
        { type: 'SEND_NOTIFICATION', template: 'NOTIFY_PLAN_CANCELLED' },
        { type: 'LOG_AUDIT', action: 'PLAN_CANCELLED' },
      ],
    });
  }

  // 1. SUBMIT_ASSESSMENT: NEW -> ASSESSED
  if (event === 'SUBMIT_ASSESSMENT') {
    if (state !== 'NEW') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện SUBMIT_ASSESSMENT chỉ áp dụng cho trạng thái ban đầu (NEW).`,
      });
    }

    if (!context.consentGiven) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'consentGiven',
        message: 'Khách hàng phải đồng ý xử lý dữ liệu trước khi nộp bài khảo sát.',
      });
    }

    return ok({
      next: 'ASSESSED',
      effects: [{ type: 'LOG_AUDIT', action: 'ASSESSMENT_SUBMITTED' }],
    });
  }

  // 2. GENERATE_RECOMMENDATION: ASSESSED -> RECOMMENDED
  if (event === 'GENERATE_RECOMMENDATION') {
    if (state !== 'ASSESSED') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện GENERATE_RECOMMENDATION chỉ áp dụng khi đã hoàn thành ASSESSED.`,
      });
    }

    const recCount = context.recommendationCount ?? 0;
    if (recCount < 1 && !context.requiresDirectConsultation) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'recommendationCount',
        message: 'Rule engine cần trả về ít nhất 1 gợi ý hoặc đánh dấu cần tư vấn trực tiếp.',
      });
    }

    return ok({
      next: 'RECOMMENDED',
      effects: [{ type: 'SEND_NOTIFICATION', template: 'RECOMMENDATION_READY' }],
    });
  }

  // 3. CONFIRM_BUNDLE: RECOMMENDED -> BUNDLE_CONFIRMED
  if (event === 'CONFIRM_BUNDLE') {
    if (state !== 'RECOMMENDED') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện CONFIRM_BUNDLE chỉ áp dụng từ trạng thái RECOMMENDED.`,
      });
    }

    if (actorRole !== 'CUSTOMER') {
      return err({
        code: 'GUARD_FAILED',
        guard: 'actorRole',
        message: 'Chỉ khách hàng mới có quyền xác nhận túi liệu trình của mình.',
      });
    }

    if (!context.hasValidAppointment) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'hasValidAppointment',
        message: 'Cần có ít nhất một buổi hẹn hợp lệ để xác nhận túi liệu trình.',
      });
    }

    if ((context.unreviewedWarningsCount ?? 0) > 0) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'unreviewedWarningsCount',
        message: 'Túi liệu trình còn cảnh báo an toàn cần nhân viên chuyên môn duyệt trước.',
      });
    }

    return ok({
      next: 'BUNDLE_CONFIRMED',
      effects: [
        { type: 'SEND_NOTIFICATION', template: 'BUNDLE_CONFIRMED_SUCCESS' },
        { type: 'CREATE_PRESCRIPTION_DRAFT' },
      ],
    });
  }

  // 4. COMPLETE_SESSION: BUNDLE_CONFIRMED -> IN_TREATMENT hoặc IN_TREATMENT -> IN_TREATMENT
  if (event === 'COMPLETE_SESSION') {
    if (state !== 'BUNDLE_CONFIRMED' && state !== 'IN_TREATMENT') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện COMPLETE_SESSION chỉ áp dụng khi đang ở BUNDLE_CONFIRMED hoặc IN_TREATMENT.`,
      });
    }

    if (actorRole !== 'THERAPIST') {
      return err({
        code: 'GUARD_FAILED',
        guard: 'actorRole',
        message: 'Chỉ kỹ thuật viên (THERAPIST) mới được quyền hoàn thành buổi trị liệu.',
      });
    }

    if (!context.hasSessionLog) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'hasSessionLog',
        message: 'Phải có nhật ký trị liệu (SessionLog) trước khi hoàn tất buổi.',
      });
    }

    return ok({
      next: 'IN_TREATMENT',
      effects: [{ type: 'LOG_AUDIT', action: 'SESSION_COMPLETED' }],
    });
  }

  // 5. FINISH_SESSIONS: IN_TREATMENT -> HOME_CARE
  if (event === 'FINISH_SESSIONS') {
    if (state !== 'IN_TREATMENT') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện FINISH_SESSIONS chỉ áp dụng từ trạng thái IN_TREATMENT.`,
      });
    }

    if (actorRole !== 'THERAPIST') {
      return err({
        code: 'GUARD_FAILED',
        guard: 'actorRole',
        message: 'Chỉ kỹ thuật viên mới có quyền kết thúc chuỗi buổi trị liệu.',
      });
    }

    const completed = context.completedSessions ?? 0;
    const total = context.totalSessions ?? 0;
    if (completed < total) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'completedSessions',
        message: `Chưa hoàn thành đủ số buổi (${completed}/${total}).`,
      });
    }

    if (!context.hasPrescription) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'hasPrescription',
        message: 'Cần chỉ định toa dưỡng tại nhà trước khi chuyển sang giai đoạn HOME_CARE.',
      });
    }

    return ok({
      next: 'HOME_CARE',
      effects: [
        { type: 'SEND_NOTIFICATION', template: 'HOME_CARE_STARTED' },
        { type: 'SCHEDULE_REASSESSMENT_REMINDER', inDays: 21 },
      ],
    });
  }

  // 6. REQUEST_REASSESSMENT: HOME_CARE -> REASSESSMENT
  if (event === 'REQUEST_REASSESSMENT') {
    if (state !== 'HOME_CARE') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện REQUEST_REASSESSMENT chỉ áp dụng từ trạng thái HOME_CARE.`,
      });
    }

    return ok({
      next: 'REASSESSMENT',
      effects: [{ type: 'SEND_NOTIFICATION', template: 'REASSESSMENT_INVITATION' }],
    });
  }

  // 7. CONTINUE_PLAN: REASSESSMENT -> IN_TREATMENT
  if (event === 'CONTINUE_PLAN') {
    if (state !== 'REASSESSMENT') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện CONTINUE_PLAN chỉ áp dụng từ trạng thái REASSESSMENT.`,
      });
    }

    if (actorRole !== 'THERAPIST') {
      return err({
        code: 'GUARD_FAILED',
        guard: 'actorRole',
        message: 'Chỉ kỹ thuật viên mới có quyền kê thêm buổi trị liệu.',
      });
    }

    if ((context.additionalSessionsAdded ?? 0) <= 0) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'additionalSessionsAdded',
        message: 'Cần kê thêm ít nhất 1 buổi để tiếp tục liệu trình.',
      });
    }

    return ok({
      next: 'IN_TREATMENT',
      effects: [{ type: 'LOG_AUDIT', action: 'PLAN_EXTENDED' }],
    });
  }

  // 8. COMPLETE_PLAN: REASSESSMENT -> COMPLETED
  if (event === 'COMPLETE_PLAN') {
    if (state !== 'REASSESSMENT') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện COMPLETE_PLAN chỉ áp dụng từ trạng thái REASSESSMENT.`,
      });
    }

    if (actorRole !== 'THERAPIST') {
      return err({
        code: 'GUARD_FAILED',
        guard: 'actorRole',
        message: 'Chỉ kỹ thuật viên mới có quyền xác nhận hoàn thành liệu trình.',
      });
    }

    if (!context.progressTargetMet) {
      return err({
        code: 'GUARD_FAILED',
        guard: 'progressTargetMet',
        message: 'Cần xác nhận các chỉ số tiến triển đã đạt mục tiêu trước khi hoàn tất.',
      });
    }

    return ok({
      next: 'COMPLETED',
      effects: [
        { type: 'SEND_NOTIFICATION', template: 'TREATMENT_COMPLETED' },
        { type: 'LOG_AUDIT', action: 'PLAN_COMPLETED' },
      ],
    });
  }

  // 9. MARK_LAPSED: BUNDLE_CONFIRMED hoặc HOME_CARE -> LAPSED
  if (event === 'MARK_LAPSED') {
    if (state !== 'BUNDLE_CONFIRMED' && state !== 'HOME_CARE') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện MARK_LAPSED chỉ áp dụng khi đang ở BUNDLE_CONFIRMED hoặc HOME_CARE.`,
      });
    }

    return ok({
      next: 'LAPSED',
      effects: [{ type: 'SEND_NOTIFICATION', template: 'PLAN_LAPSED_NOTICE' }],
    });
  }

  // 10. REACTIVATE: LAPSED -> RECOMMENDED
  if (event === 'REACTIVATE') {
    if (state !== 'LAPSED') {
      return err({
        code: 'ILLEGAL_TRANSITION',
        from: state,
        event,
        message: `Sự kiện REACTIVATE chỉ áp dụng từ trạng thái LAPSED.`,
      });
    }

    return ok({
      next: 'RECOMMENDED',
      effects: [{ type: 'LOG_AUDIT', action: 'PLAN_REACTIVATED' }],
    });
  }

  // Mọi trường hợp còn lại đều là chuyển trạng thái không hợp lệ
  return err({
    code: 'ILLEGAL_TRANSITION',
    from: state,
    event,
    message: `Không có đường chuyển trạng thái hợp lệ từ ${state} với sự kiện ${event}.`,
  });
}
