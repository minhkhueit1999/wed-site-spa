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
    return err('Vui lòng đăng nhập bằng tài khoản quản trị.');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return err('Chỉ quản trị viên (ADMIN) mới có quyền truy cập khu vực này.');
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
