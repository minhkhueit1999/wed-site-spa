export type PlanState =
  | 'ASSESSED'
  | 'RECOMMENDED'
  | 'BUNDLE_CONFIRMED'
  | 'IN_TREATMENT'
  | 'HOME_CARE'
  | 'REASSESSMENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'LAPSED';

export type PlanEvent =
  | 'SUBMIT_ASSESSMENT'
  | 'GENERATE_RECOMMENDATION'
  | 'CONFIRM_BUNDLE'
  | 'COMPLETE_SESSION'
  | 'FINISH_SESSIONS'
  | 'REQUEST_REASSESSMENT'
  | 'CONTINUE_PLAN'
  | 'COMPLETE_PLAN'
  | 'CANCEL'
  | 'MARK_LAPSED'
  | 'REACTIVATE';

export type UserRole = 'CUSTOMER' | 'THERAPIST' | 'ADMIN' | 'SYSTEM';

export interface TransitionContext {
  actorRole: UserRole;
  actorId: string;
  consentGiven?: boolean;
  recommendationCount?: number;
  requiresDirectConsultation?: boolean;
  hasValidAppointment?: boolean;
  unreviewedWarningsCount?: number;
  hasSessionLog?: boolean;
  completedSessions?: number;
  totalSessions?: number;
  hasPrescription?: boolean;
  daysInHomeCare?: number;
  minHomeCareDays?: number;
  customerRequested?: boolean;
  additionalSessionsAdded?: number;
  progressTargetMet?: boolean;
  cancelReason?: string;
  inactiveDays?: number;
  lapseDaysThreshold?: number;
}

export type Effect =
  | { type: 'SEND_NOTIFICATION'; template: string }
  | { type: 'CREATE_PRESCRIPTION_DRAFT' }
  | { type: 'SCHEDULE_REASSESSMENT_REMINDER'; inDays: number }
  | { type: 'LOG_AUDIT'; action: string };

export type TransitionError =
  | { code: 'ILLEGAL_TRANSITION'; from: PlanState | 'NEW'; event: PlanEvent; message: string }
  | { code: 'GUARD_FAILED'; guard: string; message: string };
