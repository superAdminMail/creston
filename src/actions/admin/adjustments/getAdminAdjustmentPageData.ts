"use server";

import {
  InvestmentOrderStatus,
  Prisma,
  RuntimeStatus,
} from "@/generated/prisma";
import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type {
  AdminAdjustmentPageData,
  AdminAdjustmentTargetOption,
} from "@/lib/types/adminAdjustments";

const investmentOrderSelect =
  Prisma.validator<Prisma.InvestmentOrderSelect>()({
    id: true,
    accruedProfit: true,
    currency: true,
    status: true,
    runtimeStatus: true,
    confirmedAt: true,
    updatedAt: true,
    investorProfile: {
      select: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    },
    investmentPlan: {
      select: {
        name: true,
      },
    },
  });

const savingsAccountSelect =
  Prisma.validator<Prisma.SavingsAccountSelect>()({
    id: true,
    balance: true,
    currency: true,
    status: true,
    updatedAt: true,
    investorProfile: {
      select: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    },
    savingsProduct: {
      select: {
        name: true,
      },
    },
  });

function mapInvestmentOrder(
  order: Prisma.InvestmentOrderGetPayload<{
    select: typeof investmentOrderSelect;
  }>,
): AdminAdjustmentTargetOption {
  const ownerName = order.investorProfile.user.name?.trim() || "Unnamed user";
  const ownerEmail = order.investorProfile.user.email;
  const balance = decimalToNumber(order.accruedProfit);
  const currency = order.currency;

  return {
    id: order.id,
    targetType: "INVESTMENT_ORDER",
    title: `${ownerName} · ${order.investmentPlan.name}`,
    subtitle: ownerEmail,
    meta: [
      `Profit ${formatCurrency(balance, currency)}`,
      formatEnumLabel(order.status),
      formatEnumLabel(order.runtimeStatus),
      order.confirmedAt ? "Confirmed" : "Unconfirmed",
    ].join(" · "),
    balance,
    currency,
    status: order.status,
    ownerName,
    ownerEmail,
    updatedAt: order.updatedAt.toISOString(),
  };
}

function mapSavingsAccount(
  account: Prisma.SavingsAccountGetPayload<{
    select: typeof savingsAccountSelect;
  }>,
): AdminAdjustmentTargetOption {
  const ownerName = account.investorProfile.user.name?.trim() || "Unnamed user";
  const ownerEmail = account.investorProfile.user.email;
  const balance = decimalToNumber(account.balance);
  const currency = account.currency;

  return {
    id: account.id,
    targetType: "SAVINGS_ACCOUNT",
    title: `${ownerName} · ${account.savingsProduct.name}`,
    subtitle: ownerEmail,
    meta: `${formatCurrency(balance, currency)} · ${formatEnumLabel(account.status)}`,
    balance,
    currency,
    status: account.status,
    ownerName,
    ownerEmail,
    updatedAt: account.updatedAt.toISOString(),
  };
}

export async function getAdminAdjustmentPageData(): Promise<AdminAdjustmentPageData> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const [investmentOrders, savingsAccounts] = await Promise.all([
    prisma.investmentOrder.findMany({
      where: {
        status: InvestmentOrderStatus.CONFIRMED,
        runtimeStatus: {
          in: [RuntimeStatus.ACTIVE, RuntimeStatus.ONGOING],
        },
        isMatured: false,
        confirmedAt: {
          not: null,
        },
      },
      select: investmentOrderSelect,
      orderBy: {
        updatedAt: "desc",
      },
      take: 200,
    }),
    prisma.savingsAccount.findMany({
      where: {
        status: {
          not: "CLOSED",
        },
      },
      select: savingsAccountSelect,
      orderBy: {
        updatedAt: "desc",
      },
      take: 200,
    }),
  ]);

  const targets = [
    ...investmentOrders.map(mapInvestmentOrder),
    ...savingsAccounts.map(mapSavingsAccount),
  ].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  const defaultTarget =
    targets.find((target) => target.targetType === "INVESTMENT_ORDER") ??
    targets[0] ??
    null;

  return {
    targets,
    defaultTargetType: defaultTarget?.targetType ?? null,
    defaultTargetId: defaultTarget?.id ?? null,
    stats: {
      totalTargets: targets.length,
      investmentOrders: investmentOrders.length,
      savingsAccounts: savingsAccounts.length,
    },
  };
}
