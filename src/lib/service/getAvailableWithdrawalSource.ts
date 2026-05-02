import {
  InvestmentOrderStatus,
  SavingsStatus,
  WithdrawalStatus,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import { resolveInvestmentOrderWithdrawalAmount } from "@/lib/service/getAvailableWithdrawalBalance";

export type AvailableWithdrawalSource =
  | {
      type: "INVESTMENT_ORDER";
      id: string;
      amount: number;
      currency: string;
      label: string;
      investmentAccountId: string;
    }
  | {
      type: "SAVINGS_ACCOUNT";
      id: string;
      amount: number;
      currency: string;
      label: string;
      investmentAccountId: null;
    }
  | null;

export type WithdrawalSourceOption = Exclude<AvailableWithdrawalSource, null>;

function isEarlyWithdrawal(order: { isMatured: boolean; maturityDate: Date | null }, now: Date) {
  if (order.isMatured) {
    return false;
  }

  if (!order.maturityDate) {
    return true;
  }

  return order.maturityDate > now;
}

export async function getWithdrawalSourceOptions(
  investorProfileId: string,
): Promise<WithdrawalSourceOption[]> {
  const now = new Date();

  const [investmentOrders, savingsAccounts, activeWithdrawals] =
    await Promise.all([
      prisma.investmentOrder.findMany({
        where: {
          investorProfileId,
          status: {
            in: [InvestmentOrderStatus.PAID, InvestmentOrderStatus.CONFIRMED],
          },
          isWithdrawn: false,
        },
        orderBy: {
          maturityDate: "asc",
        },
        select: {
          id: true,
          investmentAccountId: true,
          investmentModel: true,
          amount: true,
          accruedProfit: true,
          currentValue: true,
          currency: true,
          maturityDate: true,
          isMatured: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.savingsAccount.findMany({
        where: {
          investorProfileId,
          status: SavingsStatus.ACTIVE,
          isLocked: false,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          balance: true,
          currency: true,
          name: true,
        },
      }),
      prisma.withdrawalOrder.findMany({
        where: {
          investorProfileId,
          status: {
            in: [
              WithdrawalStatus.PENDING,
              WithdrawalStatus.APPROVED,
              WithdrawalStatus.PROCESSING,
              WithdrawalStatus.COMPLETED,
            ],
          },
        },
        select: {
          status: true,
          investmentOrderId: true,
          payoutSnapshot: true,
        },
        orderBy: {
          requestedAt: "desc",
        },
      }),
    ]);

  const sources: WithdrawalSourceOption[] = [];

  const blockedInvestmentOrderIds = new Set<string>();
  const blockedSavingsSourceIds = new Set<string>();
  let hasLegacyActiveSavingsWithdrawal = false;

  for (const withdrawal of activeWithdrawals) {
    if (withdrawal.investmentOrderId) {
      blockedInvestmentOrderIds.add(withdrawal.investmentOrderId);
      continue;
    }

    if (withdrawal.status === WithdrawalStatus.COMPLETED) {
      continue;
    }

    const snapshot = withdrawal.payoutSnapshot;

    if (!snapshot || typeof snapshot !== "object") {
      hasLegacyActiveSavingsWithdrawal = true;
      continue;
    }

    const sourceType =
      "sourceType" in snapshot ? String(snapshot.sourceType ?? "") : "";
    const sourceId =
      "sourceId" in snapshot ? String(snapshot.sourceId ?? "") : "";

    if (sourceType === "SAVINGS_ACCOUNT" && sourceId) {
      blockedSavingsSourceIds.add(sourceId);
      continue;
    }

    hasLegacyActiveSavingsWithdrawal = true;
  }

  const availableInvestmentOrder = investmentOrders.find(
    (order) => !blockedInvestmentOrderIds.has(order.id),
  );

  if (availableInvestmentOrder) {
    const earlyWithdrawal = isEarlyWithdrawal(availableInvestmentOrder, now);
    sources.push({
      type: "INVESTMENT_ORDER",
      id: availableInvestmentOrder.id,
      amount: decimalToNumber(
        resolveInvestmentOrderWithdrawalAmount(availableInvestmentOrder),
      ),
      currency: availableInvestmentOrder.currency,
      label: earlyWithdrawal
        ? `Early withdrawal: ${availableInvestmentOrder.investmentPlan.name}`
        : `Matured order: ${availableInvestmentOrder.investmentPlan.name}`,
      investmentAccountId: availableInvestmentOrder.investmentAccountId,
    });
  }

  const availableSavings = savingsAccounts.find(
    (account) =>
      !hasLegacyActiveSavingsWithdrawal &&
      !blockedSavingsSourceIds.has(account.id),
  );

  if (availableSavings) {
    sources.push({
      type: "SAVINGS_ACCOUNT",
      id: availableSavings.id,
      amount: decimalToNumber(availableSavings.balance),
      currency: availableSavings.currency,
      label: `Savings account: ${availableSavings.name}`,
      investmentAccountId: null,
    });
  }

  return sources;
}

export async function getAvailableWithdrawalSource(
  investorProfileId: string,
): Promise<AvailableWithdrawalSource> {
  const sources = await getWithdrawalSourceOptions(investorProfileId);

  return sources[0] ?? null;
}
