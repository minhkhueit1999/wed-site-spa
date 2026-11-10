import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/infrastructure/db/prisma';
import { auditLogRepository } from './AuditLogRepository';

describe('AuditLogRepository', () => {
  let actorId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `audit-actor-${Date.now()}@test.com`,
        name: 'Audit Actor',
        passwordHash: 'hash',
        role: 'ADMIN',
      },
    });
    actorId = user.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: actorId } });
  });

  it('ghi nhật ký hành vi hệ thống và truy xuất danh sách gần nhất', async () => {
    const log = await auditLogRepository.record({
      actorId,
      action: 'TEST_ACTION',
      targetType: 'SYSTEM',
      targetId: 'config-1',
      metadata: { test: true },
    });

    expect(log).not.toBeNull();
    expect(log?.action).toBe('TEST_ACTION');

    const recent = await auditLogRepository.listRecent(5);
    expect(recent.length).toBeGreaterThanOrEqual(1);
    expect(recent.some((l) => l.action === 'TEST_ACTION')).toBe(true);
  });
});
