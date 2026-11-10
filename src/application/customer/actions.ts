'use server';

import { auth } from '@/infrastructure/auth/auth';
import { getCustomerDashboard, CustomerDashboardData } from './getCustomerDashboard';
import { exportCustomerData } from './exportCustomerData';
import { deleteCustomerAccount } from './deleteCustomerAccount';
import { Result, err } from '@/domain/shared/result';

export async function getCustomerDashboardAction(): Promise<Result<CustomerDashboardData, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập để xem thông tin tài khoản.');
  }

  return getCustomerDashboard(session.user.id);
}

export async function exportCustomerDataAction(): Promise<Result<object, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập để xuất dữ liệu.');
  }

  return exportCustomerData(session.user.id);
}

export async function deleteCustomerAccountAction(): Promise<Result<{ message: string }, string>> {
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lòng đăng nhập để thực hiện thao tác này.');
  }

  return deleteCustomerAccount({
    targetUserId: session.user.id,
    actorId: session.user.id,
  });
}
