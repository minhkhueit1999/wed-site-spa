import { describe, it, expect } from 'vitest';
import { STATE_PRESENTATIONS } from './presentation';
import { PlanState, UserRole } from './types';

describe('State Presentation Mappings', () => {
  const allStates: PlanState[] = [
    'ASSESSED',
    'RECOMMENDED',
    'BUNDLE_CONFIRMED',
    'IN_TREATMENT',
    'HOME_CARE',
    'REASSESSMENT',
    'COMPLETED',
    'CANCELLED',
    'LAPSED',
  ];

  const allRoles: UserRole[] = ['CUSTOMER', 'THERAPIST', 'ADMIN', 'SYSTEM'];

  it.each(allStates)(
    'trạng thái %s có đầy đủ nhãn, mô tả và hành động cho mọi vai trò',
    (state) => {
      const pres = STATE_PRESENTATIONS[state];
      expect(pres).toBeDefined();
      expect(pres.label.length).toBeGreaterThan(0);
      expect(pres.description.length).toBeGreaterThan(0);
      expect(pres.badgeVariant).toBeDefined();

      for (const role of allRoles) {
        expect(pres.nextAction[role]).toBeDefined();
        expect(pres.nextAction[role].length).toBeGreaterThan(0);
      }
    },
  );
});
