'use server';

import { auth } from '@/infrastructure/auth/auth';
import { prisma } from '@/infrastructure/db/prisma';
import {
  getTherapistSchedule,
  getAppointmentDetail,
  TherapistAppointmentItem,
  AppointmentDetailData,
} from './getTherapistSchedule';
import { submitSessionLog, SubmitSessionLogInput } from './submitSessionLog';
import { prescribeProduct, PrescribeProductInput } from './prescribeProduct';
import { finishSessions, FinishSessionsInput } from './finishSessions';
import { Result, ok, err } from '@/domain/shared/result';

import {
  getTechnicianMobileSchedule,
  type TechnicianScheduleMobileData,
  type TechnicianMobileAppointment,
} from './technicianScheduleExtended';

import {
  transitionAppointmentStatus,
  type SessionWorkflowStatus,
} from './sessionStatusTransitions';

import {
  getInRoomUpsellCatalog,
  addInRoomUpsellToAppointment,
  type UpsellProductItem,
} from './inRoomUpsell';

import { getTechnicianEarnings, type TechnicianEarningsMobileData } from './technicianEarnings';

import {
  getMyLeaveRequests,
  getColleagueTherapists,
  submitLeaveOrSwapRequest,
  type MyLeaveRequestItem,
  type ColleagueTherapistItem,
} from './shiftRequests';

export type {
  TherapistAppointmentItem,
  AppointmentDetailData,
  TechnicianScheduleMobileData,
  TechnicianMobileAppointment,
  SessionWorkflowStatus,
  UpsellProductItem,
  TechnicianEarningsMobileData,
  MyLeaveRequestItem,
  ColleagueTherapistItem,
};

async function checkTherapist(): Promise<Result<string, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập bằng tài khoản kỹ thuật viên.');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || (user.role !== 'THERAPIST' && user.role !== 'ADMIN')) {
    return err('Chỉ kỹ thuật viên hoặc quản trị viên mới có quyền thao tác.');
  }

  return ok(user.id);
}

export async function getTherapistScheduleAction(): Promise<
  Result<TherapistAppointmentItem[], string>
> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return getTherapistSchedule(authRes.value);
}

export async function getAppointmentDetailAction(
  appointmentId: string,
): Promise<Result<AppointmentDetailData, string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return getAppointmentDetail(appointmentId, authRes.value);
}

export async function submitSessionLogAction(
  input: Omit<SubmitSessionLogInput, 'therapistId'>,
): Promise<Result<{ sessionLogId: string; planState: string }, string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return submitSessionLog({
    ...input,
    therapistId: authRes.value,
  });
}

export async function prescribeProductAction(
  input: Omit<PrescribeProductInput, 'therapistId'>,
): Promise<Result<{ prescriptionId: string }, string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return prescribeProduct({
    ...input,
    therapistId: authRes.value,
  });
}

export async function finishSessionsAction(
  input: Omit<FinishSessionsInput, 'therapistId'>,
): Promise<Result<{ nextState: string }, string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return finishSessions({
    ...input,
    therapistId: authRes.value,
  });
}

// --- NEW MOBILE TECHNICIAN ACTIONS ---
export async function getTechnicianMobileScheduleAction(): Promise<
  Result<TechnicianScheduleMobileData, string>
> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return getTechnicianMobileSchedule(authRes.value);
}

export async function transitionAppointmentStatusAction(
  appointmentId: string,
  targetStatus: SessionWorkflowStatus,
  notes?: string,
): Promise<Result<{ newStatus: string; message: string }, string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return transitionAppointmentStatus(appointmentId, authRes.value, targetStatus, notes);
}

export async function getInRoomUpsellCatalogAction(): Promise<Result<UpsellProductItem[], string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return getInRoomUpsellCatalog();
}

export async function addInRoomUpsellToAppointmentAction(input: {
  appointmentId: string;
  productSlug: string;
  quantity?: number;
}): Promise<Result<{ addedItemName: string; commissionEarnedVnd: number }, string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return addInRoomUpsellToAppointment({
    appointmentId: input.appointmentId,
    therapistId: authRes.value,
    productSlug: input.productSlug,
    quantity: input.quantity,
  });
}

export async function getTechnicianEarningsAction(
  monthStr?: string,
): Promise<Result<TechnicianEarningsMobileData, string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return getTechnicianEarnings(authRes.value, monthStr);
}

export async function getMyLeaveRequestsAction(): Promise<Result<MyLeaveRequestItem[], string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return getMyLeaveRequests(authRes.value);
}

export async function getColleagueTherapistsAction(): Promise<
  Result<ColleagueTherapistItem[], string>
> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return getColleagueTherapists(authRes.value);
}

export async function submitLeaveOrSwapRequestAction(input: {
  type: 'SICK' | 'VACATION' | 'PERSONAL' | 'SWAP_SHIFT';
  startDateStr: string;
  endDateStr: string;
  reason: string;
  swapWithStaffId?: string;
}): Promise<Result<{ requestId: string; message: string }, string>> {
  const authRes = await checkTherapist();
  if (!authRes.ok) return err(authRes.error);

  return submitLeaveOrSwapRequest({
    therapistId: authRes.value,
    type: input.type,
    startDate: new Date(input.startDateStr),
    endDate: new Date(input.endDateStr),
    reason: input.reason,
    swapWithStaffId: input.swapWithStaffId,
  });
}
