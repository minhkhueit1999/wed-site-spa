import { prisma } from '@/infrastructure/db/prisma';
import { Result, ok, err } from '@/domain/shared/result';

export interface CustomerCRMItem {
  id: string; // customerProfile.id
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  loyaltyTier: string;
  loyaltyPoints: number;
  totalSpentVnd: number;
  debtBalanceVnd: number;
  prepaidSessions: number;
  safetyFlags: string[];
  medicalNotes?: string | null;
  totalAppointments: number;
  lastVisitAt?: string | null;
  createdAt: string;
}

export interface CustomerCRMDetail extends CustomerCRMItem {
  treatmentPlans: Array<{
    id: string;
    serviceName: string;
    totalSessions: number;
    state: string;
    createdAt: string;
  }>;
  appointments: Array<{
    id: string;
    serviceName: string;
    therapistName: string;
    startAt: string;
    status: string;
    room: string;
    notes?: string | null;
  }>;
  invoices: Array<{
    id: string;
    code: string;
    finalVnd: number;
    paidVnd: number;
    debtVnd: number;
    paymentMethod: string;
    status: string;
    createdAt: string;
  }>;
}

/**
 * Lấy danh sách khách hàng CRM (phân hạng thẻ, công nợ, dị ứng)
 */
export async function getCustomerList(): Promise<Result<CustomerCRMItem[], string>> {
  try {
    const customers = await prisma.customerProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        treatmentPlans: {
          include: {
            appointments: {
              orderBy: { startAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { totalSpentVnd: 'desc' },
    });

    const items: CustomerCRMItem[] = customers.map((c) => {
      let flags: string[] = [];
      try {
        flags = JSON.parse(c.safetyFlags);
      } catch {
        flags = [];
      }

      // Tìm ngày ghé thăm gần nhất
      let lastVisit: Date | null = null;
      let totalApts = 0;
      for (const p of c.treatmentPlans) {
        totalApts += p.appointments.length;
        if (p.appointments[0]) {
          const d = p.appointments[0].startAt;
          if (!lastVisit || d > lastVisit) {
            lastVisit = d;
          }
        }
      }

      return {
        id: c.id,
        userId: c.userId,
        name: c.user.name,
        email: c.user.email,
        phone: c.phone,
        loyaltyTier: c.loyaltyTier,
        loyaltyPoints: c.loyaltyPoints,
        totalSpentVnd: c.totalSpentVnd,
        debtBalanceVnd: c.debtBalanceVnd,
        prepaidSessions: c.prepaidSessions,
        safetyFlags: flags,
        medicalNotes: c.medicalNotes,
        totalAppointments: totalApts,
        lastVisitAt: lastVisit ? lastVisit.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
      };
    });

    return ok(items);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy danh sách CRM';
    return err(msg);
  }
}

/**
 * Lấy chi tiết hồ sơ khách hàng
 */
export async function getCustomerDetail(
  customerId: string,
): Promise<Result<CustomerCRMDetail, string>> {
  try {
    const customer = await prisma.customerProfile.findUnique({
      where: { id: customerId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        treatmentPlans: {
          include: {
            service: { select: { name: true } },
            appointments: {
              include: {
                therapist: { select: { name: true } },
              },
              orderBy: { startAt: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) return err('Không tìm thấy khách hàng.');

    let flags: string[] = [];
    try {
      flags = JSON.parse(customer.safetyFlags);
    } catch {
      flags = [];
    }

    const allAppointments: CustomerCRMDetail['appointments'] = [];
    for (const plan of customer.treatmentPlans) {
      for (const apt of plan.appointments) {
        allAppointments.push({
          id: apt.id,
          serviceName: plan.service.name,
          therapistName: apt.therapist.name,
          startAt: apt.startAt.toISOString(),
          status: apt.status,
          room: apt.room,
          notes: apt.notes,
        });
      }
    }

    return ok({
      id: customer.id,
      userId: customer.userId,
      name: customer.user.name,
      email: customer.user.email,
      phone: customer.phone,
      loyaltyTier: customer.loyaltyTier,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpentVnd: customer.totalSpentVnd,
      debtBalanceVnd: customer.debtBalanceVnd,
      prepaidSessions: customer.prepaidSessions,
      safetyFlags: flags,
      medicalNotes: customer.medicalNotes,
      totalAppointments: allAppointments.length,
      lastVisitAt: allAppointments[0]?.startAt || null,
      createdAt: customer.createdAt.toISOString(),
      treatmentPlans: customer.treatmentPlans.map((tp) => ({
        id: tp.id,
        serviceName: tp.service.name,
        totalSessions: tp.totalSessions,
        state: tp.state,
        createdAt: tp.createdAt.toISOString(),
      })),
      appointments: allAppointments,
      invoices: customer.invoices.map((inv) => ({
        id: inv.id,
        code: inv.code,
        finalVnd: inv.finalVnd,
        paidVnd: inv.paidVnd,
        debtVnd: inv.debtVnd,
        paymentMethod: inv.paymentMethod,
        status: inv.status,
        createdAt: inv.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi lấy chi tiết khách hàng';
    return err(msg);
  }
}

/**
 * Cập nhật thông tin y khoa, thẻ thành viên, công nợ
 */
export async function updateCustomerCRM(input: {
  customerId: string;
  phone?: string;
  loyaltyTier?: string;
  debtBalanceVnd?: number;
  prepaidSessions?: number;
  medicalNotes?: string;
  safetyFlags?: string[];
}): Promise<Result<{ success: boolean }, string>> {
  try {
    const data: Record<string, unknown> = {};
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.loyaltyTier !== undefined) data.loyaltyTier = input.loyaltyTier;
    if (input.debtBalanceVnd !== undefined) data.debtBalanceVnd = input.debtBalanceVnd;
    if (input.prepaidSessions !== undefined) data.prepaidSessions = input.prepaidSessions;
    if (input.medicalNotes !== undefined) data.medicalNotes = input.medicalNotes;
    if (input.safetyFlags !== undefined) data.safetyFlags = JSON.stringify(input.safetyFlags);

    await prisma.customerProfile.update({
      where: { id: input.customerId },
      data,
    });

    return ok({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi cập nhật CRM';
    return err(msg);
  }
}

/**
 * Thanh toán công nợ cho khách hàng
 */
export async function settleCustomerDebt(
  customerId: string,
  amountVnd: number,
  notes?: string,
): Promise<Result<{ remainingDebtVnd: number }, string>> {
  try {
    return await prisma.$transaction(async (tx) => {
      const profile = await tx.customerProfile.findUnique({
        where: { id: customerId },
      });
      if (!profile) return err('Không tìm thấy hồ sơ khách.');

      const newDebt = Math.max(0, profile.debtBalanceVnd - amountVnd);

      await tx.customerProfile.update({
        where: { id: customerId },
        data: { debtBalanceVnd: newDebt },
      });

      // Tạo hóa đơn thu nợ để lưu vết kế toán
      const code = `TN-${Date.now().toString().slice(-6)}`;
      await tx.invoice.create({
        data: {
          code,
          customerId,
          subtotalVnd: amountVnd,
          discountVnd: 0,
          finalVnd: amountVnd,
          paidVnd: amountVnd,
          debtVnd: 0,
          paymentMethod: 'CASH',
          status: 'PAID',
          notes:
            notes || `Thu hồi công nợ khách hàng (Số dư nợ còn: ${newDebt.toLocaleString()} đ)`,
        },
      });

      return ok({ remainingDebtVnd: newDebt });
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi tất toán công nợ';
    return err(msg);
  }
}
