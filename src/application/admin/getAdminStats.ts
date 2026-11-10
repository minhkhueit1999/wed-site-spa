import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface AdminStatsData {
  counts: {
    customers: number;
    therapists: number;
    treatmentPlans: number;
    appointments: number;
    services: number;
    products: number;
    rules: number;
    contraindications: number;
  };
  plansByStatus: Array<{ status: string; count: number }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    actorName: string;
    actorEmail: string;
    targetType: string;
    targetId: string | null;
    at: string;
  }>;
}

export async function getAdminStats(): Promise<Result<AdminStatsData, string>> {
  try {
    const [
      customers,
      therapists,
      treatmentPlans,
      appointments,
      services,
      products,
      rules,
      contraindications,
      plansGrouped,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'THERAPIST' } }),
      prisma.treatmentPlan.count(),
      prisma.appointment.count(),
      prisma.service.count(),
      prisma.product.count(),
      prisma.rule.count(),
      prisma.contraindication.count(),
      prisma.treatmentPlan.groupBy({
        by: ['state'],
        _count: { _all: true },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { at: 'desc' },
        include: {
          actor: { select: { name: true, email: true } },
        },
      }),
    ]);

    return ok({
      counts: {
        customers,
        therapists,
        treatmentPlans,
        appointments,
        services,
        products,
        rules,
        contraindications,
      },
      plansByStatus: plansGrouped.map((pg) => ({
        status: pg.state,
        count: pg._count?._all ?? 0,
      })),
      recentAuditLogs: recentAuditLogs.map((log) => ({
        id: log.id,
        action: log.action,
        actorName: log.actor.name,
        actorEmail: log.actor.email,
        targetType: log.targetType,
        targetId: log.targetId,
        at: log.at.toISOString(),
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cơ sở dữ liệu';
    return err(`Không thể tải số liệu thống kê: ${msg}`);
  }
}
