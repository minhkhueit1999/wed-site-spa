'use server';

import { auth } from '@/infrastructure/auth/auth';
import { prisma } from '@/infrastructure/db/prisma';
import { getAdminStats, AdminStatsData } from './getAdminStats';
import { createService, deleteService, CreateServiceInput } from './serviceCrud';
import { createProduct, deleteProduct, CreateProductInput } from './productCrud';
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
  const session = await auth();
  if (!session?.user?.id) {
    return err('Vui lĂ²ng Ä‘Äƒng nháº­p báº±ng tĂ i khoáº£n quáº£n trá»‹.');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return err('Chá»‰ quáº£n trá»‹ viĂªn (ADMIN) má»›i cĂ³ quyá»n truy cáº­p khu vá»±c nĂ y.');
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

// --- ANALYTICS DASHBOARD ACTION ---
export async function getAnalyticsDashboardAction(): Promise<
  Result<AnalyticsDashboardData, string>
> {
  const authRes = await checkAdmin();
  if (!authRes.ok) return err(authRes.error);

  return getAnalyticsDashboard();
}
