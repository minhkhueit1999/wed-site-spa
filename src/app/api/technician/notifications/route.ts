import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/infrastructure/auth/auth';
import { prisma } from '@/infrastructure/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sinceParam = searchParams.get('since');
    const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 60 * 1000);

    // Tìm các lịch hẹn hôm nay của KTV này được cập nhật hoặc tạo mới gần đây
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const recentAppointments = await prisma.appointment.findMany({
      where: {
        therapistId: session.user.id,
        updatedAt: { gte: since },
        startAt: { gte: todayStart },
      },
      include: {
        plan: {
          include: {
            service: { select: { name: true } },
            customer: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const notifications = recentAppointments.map((apt) => {
      let message = `Lịch hẹn với khách ${apt.plan.customer.user.name} (${apt.plan.service.name})`;
      if (apt.status === 'CHECKED_IN') {
        message = `🔔 Khách ${apt.plan.customer.user.name} đã check-in tại quầy! Hãy bấm Nhận khách.`;
      } else if (apt.status === 'IN_PROGRESS') {
        message = `⚡ Buổi trị liệu với ${apt.plan.customer.user.name} đang diễn ra.`;
      } else if (apt.status === 'COMPLETED') {
        message = `✓ Đã hoàn thành buổi trị liệu cho ${apt.plan.customer.user.name}.`;
      }

      return {
        id: `${apt.id}-${apt.updatedAt.getTime()}`,
        appointmentId: apt.id,
        status: apt.status,
        customerName: apt.plan.customer.user.name,
        serviceName: apt.plan.service.name,
        message,
        timestamp: apt.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      notifications,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi kiểm tra thông báo';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
