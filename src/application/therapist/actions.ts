'use server';

import { auth } from '@/infrastructure/auth/auth';
import {
  getTherapistSchedule,
  getAppointmentDetail,
  TherapistAppointmentItem,
  AppointmentDetailData,
} from './getTherapistSchedule';

export type { TherapistAppointmentItem, AppointmentDetailData };
import { submitSessionLog, SubmitSessionLogInput } from './submitSessionLog';
import { prescribeProduct, PrescribeProductInput } from './prescribeProduct';
import { finishSessions, FinishSessionsInput } from './finishSessions';
import { Result, err } from '@/domain/shared/result';

export async function getTherapistScheduleAction(): Promise<
  Result<TherapistAppointmentItem[], string>
> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập bằng tài khoản kỹ thuật viên.');
  }

  return getTherapistSchedule(session.user.id);
}

export async function getAppointmentDetailAction(
  appointmentId: string,
): Promise<Result<AppointmentDetailData, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập.');
  }

  return getAppointmentDetail(appointmentId, session.user.id);
}

export async function submitSessionLogAction(
  input: Omit<SubmitSessionLogInput, 'therapistId'>,
): Promise<Result<{ sessionLogId: string; planState: string }, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập.');
  }

  return submitSessionLog({
    ...input,
    therapistId: session.user.id,
  });
}

export async function prescribeProductAction(
  input: Omit<PrescribeProductInput, 'therapistId'>,
): Promise<Result<{ prescriptionId: string }, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập.');
  }

  return prescribeProduct({
    ...input,
    therapistId: session.user.id,
  });
}

export async function finishSessionsAction(
  input: Omit<FinishSessionsInput, 'therapistId'>,
): Promise<Result<{ nextState: string }, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập.');
  }

  return finishSessions({
    ...input,
    therapistId: session.user.id,
  });
}
