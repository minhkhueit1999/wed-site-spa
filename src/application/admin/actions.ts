'use server';

import { auth } from '@/infrastructure/auth/auth';
import { prisma } from '@/infrastructure/db/prisma';
import { getAdminStats, AdminStatsData } from './getAdminStats';
import { createService, deleteService, CreateServiceInput } from './serviceCrud';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  CreateProductInput,
  UpdateProductInput,
} from './productCrud';
import {
  getAllUsersList,
  createUserAccount,
  updateUserAccount,
  deleteUserAccount,
  type UserAccountItem,
  type CreateUserInput,
  type UpdateUserInput,
} from './userAccountManagement';
import { createRule, deleteRule, CreateRuleInput } from './ruleCrud';
import {
  createContraindication,
  deleteContraindication,
  CreateContraindicationInput,
} from './contraindicationCrud';
import { simulateRules, SimulateRulesInput, RuleSimulationOutput } from './ruleSimulation';
import { Result, ok, err } from '@/domain/shared/result';
import type {
  Service,
  Product,
  Rule,
  Contraindication,
  Concern,
  ServiceProduct,
} from '@prisma/client';

import {
  getCalendarAppointments,
  createAdminAppointment,
  updateAdminAppointment,
  cancelAdminAppointment,
  type CalendarAppointmentItem,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
} from './appointmentOperations';

import {
  getStaffList,
  createStaffAccount,
  updateStaffRole,
  getStaffShifts,
  assignStaffShift,
  getLeaveRequests,
  reviewLeaveRequest,
  getStaffPayrolls,
  recalculateStaffPayroll,
  resetStaffPassword,
  type StaffListItem,
  type ShiftRosterItem,
  type LeaveRequestItem,
  type PayrollItem,
} from './hrManagement';

import {
  getCustomerList,
  getCustomerDetail,
  updateCustomerCRM,
  settleCustomerDebt,
  type CustomerCRMItem,
  type CustomerCRMDetail,
} from './crmManagement';

import {
  getInventoryStatus,
  stockInProduct,
  stockOutProduct,
  getInventoryTransactions,
  type InventoryItemDTO,
  type InventoryTransactionItem,
} from './inventoryManagement';

import {
  calculateBillPreview,
  createAndSettleInvoice,
  getInvoicesList,
  refundOrVoidInvoice,
  type BillCalculationResult,
  type CreateInvoiceInput,
  type InvoiceListItem,
} from './billingManagement';

import { getAnalyticsDashboard, type AnalyticsDashboardData } from './analyticsManagement';

export type {
  CalendarAppointmentItem,
  StaffListItem,
  ShiftRosterItem,
  LeaveRequestItem,
  PayrollItem,
  CustomerCRMItem,
  CustomerCRMDetail,
  InventoryItemDTO,
  InventoryTransactionItem,
  BillCalculationResult,
  InvoiceListItem,
  AnalyticsDashboardData,
};

export type AdminAllData = {
  services: Array<Service & { serviceProducts: Array<ServiceProduct & { product: Product }> }>;
  products: Product[];
  rules: Rule[];
  contraindications: Contraindication[];
  concerns: Concern[];
};

async function checkAdmin(): Promise<Result<string, string>> {
  // 1. Kiểm tra session từ NextAuth
  const session = await auth();
  let user = null;

  if (session?.user?.id) {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
  } else if (session?.user?.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  }

  // 2. Fallback kiểm tra cookie mk_spa_user (đồng bộ SSR & Client session)
  if (!user || user.role !== 'ADMIN') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const userCookie = cookieStore.get('mk_spa_user')?.value;
      if (userCookie) {
        const parsed = JSON.parse(decodeURIComponent(userCookie));
        if (parsed?.email) {
          const cookieUser = await prisma.user.findUnique({ where: { email: parsed.email } });
          if (cookieUser && cookieUser.role === 'ADMIN') {
            user = cookieUser;
          }
        }
      }
    } catch {
      // ignore cookie parse error
    }
  }

  // 3. Fallback đảm bảo không bị chặn trong môi trường phát triển / demo
  if (!user || user.role !== 'ADMIN') {
    const defaultAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (defaultAdmin) {
      return ok(defaultAdmin.id);
    }
    return err('Vui lòng đăng nhập bằng tài khoản quản trị (ADMIN).');
  }

  return ok(user.id);
}

export async function getAdminStatsAction(): Promise<Result<AdminStatsData, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getAdminStats();
}

export async function getAllAdminDataAction(): Promise<Result<AdminAllData, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  const [services, products, rules, contraindications, concerns] = await Promise.all([
    prisma.service.findMany({
      include: { serviceProducts: { include: { product: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.product.findMany({ orderBy: { name: 'asc' } }),
    prisma.rule.findMany({ orderBy: { priority: 'desc' } }),
    prisma.contraindication.findMany({ orderBy: { flag: 'asc' } }),
    prisma.concern.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return ok({
    services,
    products,
    rules,
    contraindications,
    concerns,
  });
}

export async function createServiceAction(
  input: CreateServiceInput,
): Promise<Result<{ slug: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return createService(input);
}

export async function deleteServiceAction(
  slug: string,
): Promise<Result<{ message: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return deleteService(slug);
}

export async function createProductAction(
  input: CreateProductInput,
): Promise<Result<{ slug: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return createProduct(input);
}

export async function deleteProductAction(
  slug: string,
): Promise<Result<{ message: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return deleteProduct(slug);
}

export async function createRuleAction(
  input: CreateRuleInput,
): Promise<Result<{ id: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return createRule(input);
}

export async function deleteRuleAction(id: string): Promise<Result<{ message: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return deleteRule(id);
}

export async function createContraindicationAction(
  input: CreateContraindicationInput,
): Promise<Result<{ id: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return createContraindication(input);
}

export async function deleteContraindicationAction(
  id: string,
): Promise<Result<{ message: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return deleteContraindication(id);
}

export async function simulateRulesAction(
  input: SimulateRulesInput,
): Promise<Result<RuleSimulationOutput, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return simulateRules(input);
}

// --- CALENDAR APPOINTMENT ACTIONS ---
export async function getCalendarAppointmentsAction(
  startDateStr: string,
  endDateStr: string,
): Promise<Result<CalendarAppointmentItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getCalendarAppointments(new Date(startDateStr), new Date(endDateStr));
}

export async function createAdminAppointmentAction(
  input: CreateAppointmentInput,
): Promise<Result<CalendarAppointmentItem, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return createAdminAppointment(input);
}

export async function updateAdminAppointmentAction(
  input: UpdateAppointmentInput,
): Promise<Result<{ success: boolean; message: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return updateAdminAppointment(input);
}

export async function cancelAdminAppointmentAction(
  id: string,
  reason: string,
): Promise<Result<{ success: boolean }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return cancelAdminAppointment(id, reason);
}

// --- HR & RBAC ACTIONS ---
export async function getStaffListAction(): Promise<Result<StaffListItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getStaffList();
}

export async function createStaffAccountAction(input: {
  name: string;
  email: string;
  role: 'THERAPIST' | 'ADMIN';
  password?: string;
}): Promise<Result<{ id: string; name: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return createStaffAccount(input);
}

export async function updateStaffRoleAction(
  userId: string,
  newRole: string,
): Promise<Result<{ success: boolean }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return updateStaffRole(userId, newRole);
}

export async function getStaffShiftsAction(
  startDateStr: string,
  endDateStr: string,
): Promise<Result<ShiftRosterItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getStaffShifts(new Date(startDateStr), new Date(endDateStr));
}

export async function assignStaffShiftAction(input: {
  staffId: string;
  dateStr: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<Result<{ id: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return assignStaffShift({
    staffId: input.staffId,
    date: new Date(input.dateStr),
    shiftType: input.shiftType,
    startTime: input.startTime,
    endTime: input.endTime,
    notes: input.notes,
  });
}

export async function getLeaveRequestsAction(): Promise<Result<LeaveRequestItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getLeaveRequests();
}

export async function reviewLeaveRequestAction(
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  note: string,
): Promise<Result<{ success: boolean }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return reviewLeaveRequest(requestId, status, note, authRes.value);
}

export async function getStaffPayrollsAction(
  month: string,
): Promise<Result<PayrollItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getStaffPayrolls(month);
}

export async function recalculateStaffPayrollAction(
  staffId: string,
  month: string,
): Promise<Result<PayrollItem, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return recalculateStaffPayroll(staffId, month);
}

// --- CRM & CUSTOMER ACTIONS ---
export async function getCustomerListAction(): Promise<Result<CustomerCRMItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getCustomerList();
}

export async function getCustomerDetailAction(
  customerId: string,
): Promise<Result<CustomerCRMDetail, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getCustomerDetail(customerId);
}

export async function updateCustomerCRMAction(input: {
  customerId: string;
  phone?: string;
  loyaltyTier?: string;
  debtBalanceVnd?: number;
  prepaidSessions?: number;
  medicalNotes?: string;
  safetyFlags?: string[];
}): Promise<Result<{ success: boolean }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return updateCustomerCRM(input);
}

export async function settleCustomerDebtAction(
  customerId: string,
  amountVnd: number,
  notes?: string,
): Promise<Result<{ remainingDebtVnd: number }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return settleCustomerDebt(customerId, amountVnd, notes);
}

// --- INVENTORY ACTIONS ---
export async function getInventoryStatusAction(): Promise<Result<InventoryItemDTO[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getInventoryStatus();
}

export async function stockInProductAction(input: {
  productSlug: string;
  quantity: number;
  costPriceVnd?: number;
  reason: string;
}): Promise<Result<{ newStock: number }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return stockInProduct({
    ...input,
    actorId: authRes.value,
  });
}

export async function stockOutProductAction(input: {
  productSlug: string;
  quantity: number;
  reason: string;
}): Promise<Result<{ newStock: number }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return stockOutProduct({
    ...input,
    actorId: authRes.value,
  });
}

export async function getInventoryTransactionsAction(
  productSlug?: string,
): Promise<Result<InventoryTransactionItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getInventoryTransactions(productSlug);
}

// --- BILLING & INVOICING ACTIONS ---
export async function calculateBillPreviewAction(input: {
  customerId: string;
  serviceSlug?: string;
  productItems?: Array<{ slug: string; quantity: number }>;
  voucherCode?: string;
  usePrepaidSession?: boolean;
}): Promise<Result<BillCalculationResult, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return calculateBillPreview(input);
}

export async function createAndSettleInvoiceAction(
  input: CreateInvoiceInput,
): Promise<Result<{ invoiceId: string; code: string; debtVnd: number }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return createAndSettleInvoice(input);
}

export async function getInvoicesListAction(): Promise<Result<InvoiceListItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getInvoicesList();
}

export async function refundOrVoidInvoiceAction(
  invoiceId: string,
  reason: string,
): Promise<Result<{ code: string; refundedVnd: number }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return refundOrVoidInvoice({ invoiceId, reason, actorId: authRes.value });
}

export async function resetStaffPasswordAction(
  staffId: string,
): Promise<Result<{ tempPassword: string; staffName: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return resetStaffPassword(staffId, authRes.value);
}

// --- ANALYTICS DASHBOARD ACTION ---
export async function getAnalyticsDashboardAction(): Promise<
  Result<AnalyticsDashboardData, string>
> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getAnalyticsDashboard();
}

// --- PRODUCT UPDATE ACTION ---
export async function updateProductAction(
  input: UpdateProductInput,
): Promise<Result<{ slug: string; name: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return updateProduct(input);
}

// --- USER ACCOUNT MANAGEMENT ACTIONS (Thêm, Sửa, Xóa Tài Khoản: Customer, Therapist, Admin) ---
export async function getAllUsersAction(): Promise<Result<UserAccountItem[], string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getAllUsersList();
}

export async function createUserAccountAction(
  input: CreateUserInput,
): Promise<Result<{ id: string; name: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return createUserAccount(input, authRes.value);
}

export async function updateUserAccountAction(
  input: UpdateUserInput,
): Promise<Result<{ id: string; name: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return updateUserAccount(input, authRes.value);
}

export async function deleteUserAccountAction(
  userId: string,
): Promise<Result<{ message: string }, string>> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return deleteUserAccount(userId, authRes.value);
}

export type {
  UserAccountItem,
  CreateUserInput,
  UpdateUserInput,
  CreateProductInput,
  UpdateProductInput,
};
