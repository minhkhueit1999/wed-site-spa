import { prisma } from '@/infrastructure/db/prisma';
import { transition } from '@/domain/lifecycle/transition';
import { Result, ok, err } from '@/domain/shared/result';

export interface ConfirmCareBundleInput {
  userId?: string;
  guestInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
  serviceSlug: string;
  startAt: string | Date;
  therapistId?: string;
  safetyFlags?: string[];
  notes?: string;
}

export interface ConfirmCareBundleResult {
  planId: string;
  appointmentId: string;
  careBundleId: string;
  status: 'CONFIRMED' | 'PENDING_REVIEW';
  planState: string;
  serviceName: string;
  therapistName: string;
  startAt: string;
  endAt: string;
  homeCareProducts: Array<{ slug: string; name: string }>;
  totalVnd: number;
  requiresReview: boolean;
  message: string;
}

export async function confirmCareBundle(
  input: ConfirmCareBundleInput,
): Promise<Result<ConfirmCareBundleResult, string>> {
  // 1. Xác định hoặc tạo thông tin khách hàng
  let effectiveUserId = input.userId;
  let customerProfileId: string | null = null;

  if (effectiveUserId) {
    const user = await prisma.user.findUnique({
      where: { id: effectiveUserId },
      include: { profile: true },
    });
    if (!user) {
      return err('Không tìm thấy tài khoản người dùng.');
    }
    if (!user.profile) {
      const newProfile = await prisma.customerProfile.create({
        data: {
          userId: user.id,
          safetyFlags: JSON.stringify(input.safetyFlags || []),
          consentAt: new Date(),
        },
      });
      customerProfileId = newProfile.id;
    } else {
      customerProfileId = user.profile.id;
    }
  } else if (input.guestInfo) {
    const { email, name, phone } = input.guestInfo;
    if (!email || !name) {
      return err('Vui lòng cung cấp họ tên và email để xác nhận đặt hẹn.');
    }

    let existingUser = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: 'GUEST_NO_PASSWORD',
          role: 'CUSTOMER',
          profile: {
            create: {
              safetyFlags: JSON.stringify(input.safetyFlags || []),
              consentAt: new Date(),
              notes: phone ? `SĐT: ${phone}` : undefined,
            },
          },
        },
        include: { profile: true },
      });
    }

    effectiveUserId = existingUser.id;
    customerProfileId = existingUser.profile!.id;
  } else {
    return err('Cần đăng nhập hoặc cung cấp thông tin liên hệ để hoàn tất đặt phác đồ.');
  }

  // 2. Kiểm tra dịch vụ
  const service = await prisma.service.findUnique({
    where: { slug: input.serviceSlug },
    include: {
      serviceProducts: {
        include: { product: true },
      },
    },
  });

  if (!service) {
    return err(`Dịch vụ không tồn tại: ${input.serviceSlug}`);
  }

  // 3. Kiểm tra thời gian hẹn
  const startAtDate = new Date(input.startAt);
  if (isNaN(startAtDate.getTime())) {
    return err('Thời gian hẹn không hợp lệ.');
  }

  if (startAtDate.getTime() < Date.now() - 60000) {
    return err('Thời gian hẹn phải ở trong tương lai.');
  }

  const endAtDate = new Date(startAtDate.getTime() + service.durationMin * 60 * 1000);

  // 4. Kiểm tra chống chỉ định & cảnh báo an toàn
  const flags = input.safetyFlags ?? [];
  let requiresReview = false;

  if (flags.length > 0) {
    const contraindications = await prisma.contraindication.findMany({
      where: { flag: { in: flags } },
    });

    for (const c of contraindications) {
      const blockedServices: string[] = JSON.parse(c.blocksServiceSlugs || '[]');
      if (blockedServices.includes(service.slug)) {
        return err(`Dịch vụ này bị chống chỉ định đối với tình trạng của bạn: ${c.message}`);
      }
      if (c.requiresStaffReview) {
        requiresReview = true;
      }
    }
  }

  // 5. Lựa chọn kỹ thuật viên & kiểm tra trùng lịch
  let selectedTherapistId = input.therapistId;

  if (!selectedTherapistId) {
    const therapists = await prisma.user.findMany({
      where: { role: 'THERAPIST' },
    });

    if (therapists.length === 0) {
      return err('Hiện không có kỹ thuật viên nào khả dụng.');
    }

    for (const th of therapists) {
      const conflict = await prisma.appointment.findFirst({
        where: {
          therapistId: th.id,
          status: 'SCHEDULED',
          startAt: { lt: endAtDate },
          endAt: { gt: startAtDate },
        },
      });
      if (!conflict) {
        selectedTherapistId = th.id;
        break;
      }
    }

    if (!selectedTherapistId) {
      return err(
        'Tất cả kỹ thuật viên đều có lịch bận vào khung giờ này. Vui lòng chọn khung giờ khác.',
      );
    }
  } else {
    const therapist = await prisma.user.findUnique({
      where: { id: selectedTherapistId, role: 'THERAPIST' },
    });

    if (!therapist) {
      return err('Kỹ thuật viên được chọn không tồn tại hoặc không hợp lệ.');
    }

    const conflict = await prisma.appointment.findFirst({
      where: {
        therapistId: selectedTherapistId,
        status: 'SCHEDULED',
        startAt: { lt: endAtDate },
        endAt: { gt: startAtDate },
      },
    });

    if (conflict) {
      return err(
        'Kỹ thuật viên đã có lịch hẹn trùng lịch trong khung giờ được chọn. Vui lòng chọn khung giờ khác.',
      );
    }
  }

  const therapist = await prisma.user.findUniqueOrThrow({
    where: { id: selectedTherapistId },
  });

  // 6. Lọc sản phẩm dưỡng tại nhà đi kèm
  const blockedProductSlugs = new Set<string>();
  if (flags.length > 0) {
    const contraindications = await prisma.contraindication.findMany({
      where: { flag: { in: flags } },
    });
    for (const c of contraindications) {
      const blocked: string[] = JSON.parse(c.blocksProductSlugs || '[]');
      blocked.forEach((slug) => blockedProductSlugs.add(slug));
    }
  }

  const includedProducts = service.serviceProducts
    .map((sp) => sp.product)
    .filter((p) => !blockedProductSlugs.has(p.slug));

  const totalVnd = service.priceVnd;
  const targetPlanState = requiresReview ? 'RECOMMENDED' : 'BUNDLE_CONFIRMED';
  const bundleStatus = requiresReview ? 'PENDING_REVIEW' : 'CONFIRMED';

  // Kiểm tra chuyển đổi trạng thái bằng Domain State Machine khi không có cảnh báo
  if (!requiresReview) {
    const guardRes = transition('RECOMMENDED', 'CONFIRM_BUNDLE', {
      actorRole: 'CUSTOMER',
      actorId: effectiveUserId,
      hasValidAppointment: true,
      unreviewedWarningsCount: 0,
    });
    if (!guardRes.ok) {
      return err(guardRes.error.message);
    }
  }

  // 7. Thực hiện Prisma Transaction nguyên tử
  try {
    const result = await prisma.$transaction(async (tx) => {
      // a. Tạo phác đồ điều trị
      const plan = await tx.treatmentPlan.create({
        data: {
          customerId: customerProfileId!,
          serviceSlug: service.slug,
          totalSessions: service.sessionsRecommended,
          state: targetPlanState,
        },
      });

      // b. Ghi lịch sử chuyển trạng thái
      await tx.planStateHistory.create({
        data: {
          planId: plan.id,
          from: 'RECOMMENDED',
          event: requiresReview ? 'SUBMIT_FOR_REVIEW' : 'CONFIRM_BUNDLE',
          to: targetPlanState,
          actorId: effectiveUserId!,
          reason: requiresReview
            ? 'Đã tiếp nhận túi liệu trình; có cờ cảnh báo sức khỏe cần chuyên viên thẩm định.'
            : 'Khách hàng xác nhận túi liệu trình và lịch hẹn.',
        },
      });

      // c. Tạo lịch hẹn buổi 1
      const appointment = await tx.appointment.create({
        data: {
          planId: plan.id,
          therapistId: selectedTherapistId!,
          startAt: startAtDate,
          endAt: endAtDate,
          status: 'SCHEDULED',
        },
      });

      // d. Tạo bản ghi Túi liệu trình (CareBundle)
      const careBundle = await tx.careBundle.create({
        data: {
          customerId: customerProfileId!,
          planId: plan.id,
          status: bundleStatus,
          items: JSON.stringify({
            service: {
              slug: service.slug,
              name: service.name,
              priceVnd: service.priceVnd,
            },
            appointment: {
              id: appointment.id,
              startAt: startAtDate.toISOString(),
              endAt: endAtDate.toISOString(),
              therapistName: therapist.name,
            },
            homeCareProducts: includedProducts.map((p) => ({
              slug: p.slug,
              name: p.name,
              priceVnd: p.priceVnd,
            })),
          }),
          totalVnd,
        },
      });

      // e. Tạo chỉ định toa dưỡng tại nhà khởi đầu cho từng sản phẩm trong túi
      for (const product of includedProducts) {
        await tx.homeCarePrescription.create({
          data: {
            planId: plan.id,
            productSlug: product.slug,
            instructions: 'Sử dụng đều đặn theo toa phác đồ dưỡng tại nhà đính kèm.',
            frequency: 'Hàng ngày theo chỉ định chuyên viên',
            prescribedBy: selectedTherapistId!,
          },
        });
      }

      // f. Ghi AuditLog
      await tx.auditLog.create({
        data: {
          actorId: effectiveUserId!,
          action: 'CONFIRM_CARE_BUNDLE',
          targetType: 'TREATMENT_PLAN',
          targetId: plan.id,
          metadata: JSON.stringify({
            bundleStatus,
            serviceSlug: service.slug,
            requiresReview,
          }),
        },
      });

      return {
        planId: plan.id,
        appointmentId: appointment.id,
        careBundleId: careBundle.id,
        status: bundleStatus as 'CONFIRMED' | 'PENDING_REVIEW',
        planState: targetPlanState,
        serviceName: service.name,
        therapistName: therapist.name,
        startAt: startAtDate.toISOString(),
        endAt: endAtDate.toISOString(),
        homeCareProducts: includedProducts.map((p) => ({
          slug: p.slug,
          name: p.name,
        })),
        totalVnd,
        requiresReview,
        message: requiresReview
          ? 'Lịch hẹn và túi liệu trình đã tiếp nhận thành công. Do có lưu ý thể trạng, chuyên viên sẽ liên hệ với bạn trước buổi hẹn để đảm bảo an toàn tuyệt đối.'
          : 'Túi liệu trình và lịch hẹn đã được xác nhận thành công! Toa chăm sóc tại nhà sẽ được trao tận tay khi bạn đến spa.',
      };
    });

    return ok(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể hoàn tất xác nhận túi liệu trình: ${msg}`);
  }
}
