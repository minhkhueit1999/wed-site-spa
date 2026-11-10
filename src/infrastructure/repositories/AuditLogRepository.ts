import { prisma } from '@/infrastructure/db/prisma';

export interface CreateAuditLogInput {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogRepository {
  async record(input: CreateAuditLogInput) {
    try {
      return await prisma.auditLog.create({
        data: {
          actorId: input.actorId,
          action: input.action,
          targetType: input.targetType,
          targetId: input.targetId,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Không thể ghi nhận AuditLog:', error);
      return null;
    }
  }

  async listRecent(limit = 50) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { at: 'desc' },
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }
}

export const auditLogRepository = new AuditLogRepository();
