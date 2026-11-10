'use server';

import { auth } from '@/infrastructure/auth/auth';
import { prisma } from '@/infrastructure/db/prisma';
import {
  confirmCareBundle,
  ConfirmCareBundleInput,
  ConfirmCareBundleResult,
} from './confirmCareBundle';
import { Result, ok, err } from '@/domain/shared/result';

export interface BookingDetails {
  service: {
    slug: string;
    name: string;
    description: string;
    durationMin: number;
    sessions: number;
    priceVnd: number;
  };
  homeCareProducts: Array<{
    slug: string;
    name: string;
    description: string;
    usageGuide: string;
    priceVnd: number;
  }>;
  therapists: Array<{
    id: string;
    name: string;
  }>;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export async function getBookingDetailsAction(
  serviceSlug: string,
): Promise<Result<BookingDetails, string>> {
  try {
    const session = await auth();
    const service = await prisma.service.findUnique({
      where: { slug: serviceSlug },
      include: {
        serviceProducts: {
          include: { product: true },
        },
      },
    });

    if (!service) {
      return err('Không tìm thấy phác đồ dịch vụ được yêu cầu.');
    }

    const therapists = await prisma.user.findMany({
      where: { role: 'THERAPIST' },
      select: { id: true, name: true },
    });

    return ok({
      service: {
        slug: service.slug,
        name: service.name,
        description: service.description,
        durationMin: service.durationMin,
        sessions: service.sessionsRecommended,
        priceVnd: service.priceVnd,
      },
      homeCareProducts: service.serviceProducts.map((sp) => ({
        slug: sp.product.slug,
        name: sp.product.name,
        description: sp.product.description,
        usageGuide: sp.product.usageGuide,
        priceVnd: sp.product.priceVnd,
      })),
      therapists,
      currentUser: session?.user
        ? {
            id: session.user.id!,
            name: session.user.name || '',
            email: session.user.email || '',
          }
        : undefined,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Không thể tải thông tin túi liệu trình: ${msg}`);
  }
}

export async function submitCareBundleBookingAction(
  input: Omit<ConfirmCareBundleInput, 'userId'>,
): Promise<Result<ConfirmCareBundleResult, string>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    return await confirmCareBundle({
      ...input,
      userId,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi hệ thống';
    return err(`Đặt túi liệu trình thất bại: ${msg}`);
  }
}
