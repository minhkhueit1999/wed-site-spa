import { describe, it, expect } from 'vitest';
import { transition } from './transition';
import { PlanState, PlanEvent } from './types';

describe('State Machine Vòng đời Liệu trình (transition)', () => {
  describe('Các chuyển trạng thái hợp lệ trong luồng chính', () => {
    it('SUBMIT_ASSESSMENT từ NEW -> ASSESSED khi có đồng ý', () => {
      const res = transition('NEW', 'SUBMIT_ASSESSMENT', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        consentGiven: true,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('ASSESSED');
      }
    });

    it('GENERATE_RECOMMENDATION từ ASSESSED -> RECOMMENDED', () => {
      const res = transition('ASSESSED', 'GENERATE_RECOMMENDATION', {
        actorRole: 'SYSTEM',
        actorId: 'sys',
        recommendationCount: 2,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('RECOMMENDED');
      }
    });

    it('GENERATE_RECOMMENDATION khi requiresDirectConsultation=true', () => {
      const res = transition('ASSESSED', 'GENERATE_RECOMMENDATION', {
        actorRole: 'SYSTEM',
        actorId: 'sys',
        recommendationCount: 0,
        requiresDirectConsultation: true,
      });
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.value.next).toBe('RECOMMENDED');
    });

    it('CONFIRM_BUNDLE từ RECOMMENDED -> BUNDLE_CONFIRMED', () => {
      const res = transition('RECOMMENDED', 'CONFIRM_BUNDLE', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        hasValidAppointment: true,
        unreviewedWarningsCount: 0,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('BUNDLE_CONFIRMED');
      }
    });

    it('COMPLETE_SESSION từ BUNDLE_CONFIRMED -> IN_TREATMENT khi KTV hoàn thành buổi 1', () => {
      const res = transition('BUNDLE_CONFIRMED', 'COMPLETE_SESSION', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        hasSessionLog: true,
        completedSessions: 1,
        totalSessions: 6,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('IN_TREATMENT');
      }
    });

    it('COMPLETE_SESSION từ IN_TREATMENT -> IN_TREATMENT ở các buổi tiếp theo', () => {
      const res = transition('IN_TREATMENT', 'COMPLETE_SESSION', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        hasSessionLog: true,
        completedSessions: 2,
        totalSessions: 6,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('IN_TREATMENT');
      }
    });

    it('FINISH_SESSIONS từ IN_TREATMENT -> HOME_CARE khi đã xong đủ số buổi', () => {
      const res = transition('IN_TREATMENT', 'FINISH_SESSIONS', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        completedSessions: 6,
        totalSessions: 6,
        hasPrescription: true,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('HOME_CARE');
        expect(res.value.effects.some((e) => e.type === 'SCHEDULE_REASSESSMENT_REMINDER')).toBe(
          true,
        );
      }
    });

    it('REQUEST_REASSESSMENT từ HOME_CARE -> REASSESSMENT', () => {
      const res = transition('HOME_CARE', 'REQUEST_REASSESSMENT', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        customerRequested: true,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('REASSESSMENT');
      }
    });

    it('COMPLETE_PLAN từ REASSESSMENT -> COMPLETED khi đạt mục tiêu', () => {
      const res = transition('REASSESSMENT', 'COMPLETE_PLAN', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        progressTargetMet: true,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('COMPLETED');
      }
    });

    it('CONTINUE_PLAN từ REASSESSMENT -> IN_TREATMENT khi KTV kê thêm buổi', () => {
      const res = transition('REASSESSMENT', 'CONTINUE_PLAN', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        additionalSessionsAdded: 2,
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.next).toBe('IN_TREATMENT');
      }
    });
  });

  describe('Kiểm tra các Guard điều kiện (1 ca qua, 1 ca không qua)', () => {
    it('SUBMIT_ASSESSMENT: thất bại nếu chưa có sự đồng ý hoặc không phải từ NEW', () => {
      const failConsent = transition('NEW', 'SUBMIT_ASSESSMENT', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        consentGiven: false,
      });
      expect(failConsent.ok).toBe(false);
      if (!failConsent.ok) expect(failConsent.error.code).toBe('GUARD_FAILED');

      const failState = transition('ASSESSED', 'SUBMIT_ASSESSMENT', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        consentGiven: true,
      });
      expect(failState.ok).toBe(false);
      if (!failState.ok) expect(failState.error.code).toBe('ILLEGAL_TRANSITION');
    });

    it('GENERATE_RECOMMENDATION: thất bại nếu recCount < 1', () => {
      const fail = transition('ASSESSED', 'GENERATE_RECOMMENDATION', {
        actorRole: 'SYSTEM',
        actorId: 'sys',
        recommendationCount: 0,
      });
      expect(fail.ok).toBe(false);
      if (!fail.ok) expect(fail.error.code).toBe('GUARD_FAILED');
    });

    it('CONFIRM_BUNDLE: thất bại nếu vai trò sai hoặc thiếu lịch hẹn', () => {
      const failRole = transition('RECOMMENDED', 'CONFIRM_BUNDLE', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        hasValidAppointment: true,
      });
      expect(failRole.ok).toBe(false);
      if (!failRole.ok) expect(failRole.error.code).toBe('GUARD_FAILED');

      const failAppt = transition('RECOMMENDED', 'CONFIRM_BUNDLE', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        hasValidAppointment: false,
      });
      expect(failAppt.ok).toBe(false);
      if (!failAppt.ok) expect(failAppt.error.code).toBe('GUARD_FAILED');

      const failWarnings = transition('RECOMMENDED', 'CONFIRM_BUNDLE', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        hasValidAppointment: true,
        unreviewedWarningsCount: 2,
      });
      expect(failWarnings.ok).toBe(false);
      if (!failWarnings.ok) expect(failWarnings.error.code).toBe('GUARD_FAILED');
    });

    it('COMPLETE_SESSION: thất bại nếu thiếu nhật ký hoặc sai vai trò', () => {
      const failLog = transition('BUNDLE_CONFIRMED', 'COMPLETE_SESSION', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        hasSessionLog: false,
      });
      expect(failLog.ok).toBe(false);
      if (!failLog.ok) expect(failLog.error.code).toBe('GUARD_FAILED');

      const failRole = transition('BUNDLE_CONFIRMED', 'COMPLETE_SESSION', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        hasSessionLog: true,
      });
      expect(failRole.ok).toBe(false);
      if (!failRole.ok) expect(failRole.error.code).toBe('GUARD_FAILED');
    });

    it('FINISH_SESSIONS: thất bại nếu chưa xong đủ số buổi hoặc thiếu toa', () => {
      const failSessions = transition('IN_TREATMENT', 'FINISH_SESSIONS', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        completedSessions: 3,
        totalSessions: 6,
        hasPrescription: true,
      });
      expect(failSessions.ok).toBe(false);
      if (!failSessions.ok) expect(failSessions.error.code).toBe('GUARD_FAILED');

      const failPrescription = transition('IN_TREATMENT', 'FINISH_SESSIONS', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        completedSessions: 6,
        totalSessions: 6,
        hasPrescription: false,
      });
      expect(failPrescription.ok).toBe(false);
      if (!failPrescription.ok) expect(failPrescription.error.code).toBe('GUARD_FAILED');

      const failRole = transition('IN_TREATMENT', 'FINISH_SESSIONS', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        completedSessions: 6,
        totalSessions: 6,
        hasPrescription: true,
      });
      expect(failRole.ok).toBe(false);
      if (!failRole.ok) expect(failRole.error.code).toBe('GUARD_FAILED');
    });

    it('CONTINUE_PLAN: thất bại nếu không phải THERAPIST hoặc thêm 0 buổi', () => {
      const failRole = transition('REASSESSMENT', 'CONTINUE_PLAN', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        additionalSessionsAdded: 2,
      });
      expect(failRole.ok).toBe(false);
      if (!failRole.ok) expect(failRole.error.code).toBe('GUARD_FAILED');

      const failCount = transition('REASSESSMENT', 'CONTINUE_PLAN', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        additionalSessionsAdded: 0,
      });
      expect(failCount.ok).toBe(false);
      if (!failCount.ok) expect(failCount.error.code).toBe('GUARD_FAILED');
    });

    it('COMPLETE_PLAN: thất bại nếu chưa đạt mục tiêu hoặc sai vai trò', () => {
      const failTarget = transition('REASSESSMENT', 'COMPLETE_PLAN', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        progressTargetMet: false,
      });
      expect(failTarget.ok).toBe(false);
      if (!failTarget.ok) expect(failTarget.error.code).toBe('GUARD_FAILED');

      const failRole = transition('REASSESSMENT', 'COMPLETE_PLAN', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        progressTargetMet: true,
      });
      expect(failRole.ok).toBe(false);
      if (!failRole.ok) expect(failRole.error.code).toBe('GUARD_FAILED');
    });

    it('CANCEL: thất bại nếu đã COMPLETED hoặc sai vai trò', () => {
      const failCompleted = transition('COMPLETED', 'CANCEL', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
        cancelReason: 'Lý do',
      });
      expect(failCompleted.ok).toBe(false);
      if (!failCompleted.ok) expect(failCompleted.error.code).toBe('ILLEGAL_TRANSITION');

      const failRole = transition('RECOMMENDED', 'CANCEL', {
        actorRole: 'THERAPIST',
        actorId: 'ktv-1',
        cancelReason: 'Lý do',
      });
      expect(failRole.ok).toBe(false);
      if (!failRole.ok) expect(failRole.error.code).toBe('GUARD_FAILED');
    });
  });

  describe('Bảng kiểm tra chuyển trạng thái bất hợp pháp (ILLEGAL_TRANSITION)', () => {
    it.each([
      ['ASSESSED', 'FINISH_SESSIONS'],
      ['RECOMMENDED', 'COMPLETE_PLAN'],
      ['COMPLETED', 'CONFIRM_BUNDLE'],
      ['CANCELLED', 'COMPLETE_SESSION'],
      ['BUNDLE_CONFIRMED', 'CONTINUE_PLAN'],
      ['HOME_CARE', 'COMPLETE_SESSION'],
      ['RECOMMENDED', 'REQUEST_REASSESSMENT'],
      ['IN_TREATMENT', 'CONTINUE_PLAN'],
      ['IN_TREATMENT', 'COMPLETE_PLAN'],
      ['HOME_CARE', 'CONTINUE_PLAN'],
      ['HOME_CARE', 'COMPLETE_PLAN'],
      ['REASSESSMENT', 'SUBMIT_ASSESSMENT'],
      ['REASSESSMENT', 'CONFIRM_BUNDLE'],
      ['COMPLETED', 'MARK_LAPSED'],
      ['IN_TREATMENT', 'REACTIVATE'],
      ['NEW', 'CONTINUE_PLAN'],
      ['NEW', 'CONFIRM_BUNDLE'],
      ['NEW', 'COMPLETE_SESSION'],
    ] as const)('từ %s với sự kiện %s phải trả về ILLEGAL_TRANSITION', (from, event) => {
      const res = transition(from as PlanState, event as PlanEvent, {
        actorRole: 'THERAPIST',
        actorId: 'id',
      });
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe('ILLEGAL_TRANSITION');
      }
    });
  });

  describe('Luồng LAPSED và REACTIVATE', () => {
    it('chuyển sang LAPSED khi quá hạn không hoạt động từ BUNDLE_CONFIRMED hoặc HOME_CARE', () => {
      const resHome = transition('HOME_CARE', 'MARK_LAPSED', {
        actorRole: 'SYSTEM',
        actorId: 'sys',
      });
      expect(resHome.ok).toBe(true);
      if (resHome.ok) expect(resHome.value.next).toBe('LAPSED');

      const resBundle = transition('BUNDLE_CONFIRMED', 'MARK_LAPSED', {
        actorRole: 'SYSTEM',
        actorId: 'sys',
      });
      expect(resBundle.ok).toBe(true);
      if (resBundle.ok) expect(resBundle.value.next).toBe('LAPSED');
    });

    it('tái kích hoạt từ LAPSED -> RECOMMENDED khi khách quay lại', () => {
      const res = transition('LAPSED', 'REACTIVATE', {
        actorRole: 'CUSTOMER',
        actorId: 'cust-1',
      });
      expect(res.ok).toBe(true);
      if (res.ok) expect(res.value.next).toBe('RECOMMENDED');
    });
  });
});
