import { prisma } from '@/infrastructure/db/prisma';

export class CustomerRepository {
  async getProfile(userId: string) {
    return prisma.customerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        },
      },
    });
  }

  async getTreatmentPlans(userId: string) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) return [];

    return prisma.treatmentPlan.findMany({
      where: { customerId: profile.id },
      include: {
        service: true,
        stateHistory: {
          orderBy: { at: 'asc' },
        },
        appointments: {
          include: {
            therapist: { select: { id: true, name: true } },
            sessionLog: true,
          },
          orderBy: { startAt: 'asc' },
        },
        prescriptions: {
          include: { product: true },
          orderBy: { startDate: 'desc' },
        },
        careBundles: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTreatmentPlanById(userId: string, planId: string) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!profile) return null;

    return prisma.treatmentPlan.findFirst({
      where: {
        id: planId,
        customerId: profile.id, // Đảm bảo cô lập tuyệt đối dữ liệu khách hàng
      },
      include: {
        service: true,
        stateHistory: { orderBy: { at: 'asc' } },
        appointments: {
          include: {
            therapist: { select: { id: true, name: true } },
            sessionLog: true,
          },
        },
        prescriptions: { include: { product: true } },
        careBundles: true,
      },
    });
  }

  async exportCustomerData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          include: {
            assessments: true,
            treatmentPlans: {
              include: {
                service: true,
                stateHistory: true,
                appointments: { include: { sessionLog: true } },
                prescriptions: { include: { product: true } },
                careBundles: true,
              },
            },
          },
        },
      },
    });

    return user;
  }

  async deleteCustomerAccountAndData(userId: string) {
    // Cascade delete trong SQLite xoá toàn bộ profile, kế hoạch, nhật ký liên quan
    return prisma.user.delete({
      where: { id: userId },
    });
  }
}

export const customerRepository = new CustomerRepository();
