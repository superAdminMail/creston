import {
  InvestmentModel,
  InvestmentOrderStatus,
  Prisma,
  SavingsStatus,
  WithdrawalStatus,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { toDecimal } from "@/lib/services/investment/decimal";

export type AvailableWithdrawalInvestmentOrder = {
  id: string;
  investmentAccountId: string;
  investmentModel: InvestmentModel;
  principal: number;
  profit: number;
  availableAmount: number;
  currentValue: number | null;
  currency: string;
};

export type AvailableWithdrawalBalanceSummary = {
  totalBalance: number;
  investmentBalance: number;
  savingsBalance: number;
  currency: string;
  investmentOrders: AvailableWithdrawalInvestmentOrder[];
};

export function resolveInvestmentOrderWithdrawalAmount(order: {
  investmentModel: InvestmentModel;
  amount: Prisma.Decimal;
  accruedProfit: Prisma.Decimal;
  currentValue: Prisma.Decimal | null;
}) {
  if (order.investmentModel === InvestmentModel.FIXED) {
    return toDecimal(order.amount).add(toDecimal(order.accruedProfit));
  }

  return toDecimal(order.currentValue).greaterThan(0)
    ? toDecimal(order.currentValue)
    : toDecimal(order.amount).add(toDecimal(order.accruedProfit));
}

export async function getAvailableWithdrawalBalance(
  investorProfileId: string,
): Promise<AvailableWithdrawalBalanceSummary> {
  const [investmentOrders, savingsAccounts, completedWithdrawals] =
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
        },
      }),
      prisma.savingsAccount.findMany({
        where: {
          investorProfileId,
          status: SavingsStatus.ACTIVE,
          isLocked: false,
        },
        select: {
          balance: true,
          currency: true,
        },
      }),
      prisma.withdrawalOrder.findMany({
        where: {
          investorProfileId,
          status: WithdrawalStatus.COMPLETED,
          investmentOrderId: {
            not: null,
          },
        },
        select: {
          investmentOrderId: true,
        },
      }),
    ]);

  const completedWithdrawalOrderIds = new Set(
    completedWithdrawals
      .map((withdrawal) => withdrawal.investmentOrderId)
      .filter((value): value is string => Boolean(value)),
  );

  const eligibleInvestmentOrders = investmentOrders.filter(
    (order) => !completedWithdrawalOrderIds.has(order.id),
  );

  const investmentOrderEntries = eligibleInvestmentOrders.map((order) => {
    const principal = toDecimal(order.amount);
    const availableAmount = resolveInvestmentOrderWithdrawalAmount(order);

    return {
      id: order.id,
      investmentAccountId: order.investmentAccountId,
      investmentModel: order.investmentModel,
      principal: principal.toNumber(),
      profit: availableAmount.minus(principal).toNumber(),
      availableAmount: availableAmount.toNumber(),
      currentValue: order.currentValue
        ? toDecimal(order.currentValue).toNumber()
        : null,
      currency: order.currency,
    };
  });

  const investmentBalance = eligibleInvestmentOrders.reduce(
    (sum, order) =>
      sum + resolveInvestmentOrderWithdrawalAmount(order).toNumber(),
    0,
  );

  const savingsBalance = savingsAccounts.reduce(
    (sum, account) => sum + toDecimal(account.balance).toNumber(),
    0,
  );

  const totalBalance = investmentBalance + savingsBalance;
  const currency =
    savingsAccounts[0]?.currency ??
    eligibleInvestmentOrders[0]?.currency ??
    "USD";

  return {
    totalBalance,
    investmentBalance,
    savingsBalance,
    currency,
    investmentOrders: investmentOrderEntries,
  };
}
