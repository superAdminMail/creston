import {
  InvestmentModel,
  InvestmentOrderStatus,
  Prisma,
  SavingsStatus,
  WithdrawalStatus,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { decimalToNumber, toDecimal } from "@/lib/services/investment/decimal";
import {
  calculateInvestmentAccountBalance,
  isActiveInvestmentBalanceOrder,
} from "@/lib/services/investment/investmentBalanceService";
import { computeInvestmentOrderRecognizedProfit } from "@/lib/services/investment/valuationService";

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
  accountBalance: number;
  savingsBalance: number;
  currency: string;
  investmentOrders: AvailableWithdrawalInvestmentOrder[];
};

export function resolveInvestmentOrderWithdrawalAmount(order: {
  investmentModel: InvestmentModel;
  amount: Prisma.Decimal;
  amountPaid: Prisma.Decimal;
  accruedProfit: Prisma.Decimal;
  currentValue: Prisma.Decimal | null;
  investmentEarnings?: Array<{
    amount: Prisma.Decimal;
  }>;
}) {
  return toDecimal(order.amountPaid).add(
    computeInvestmentOrderRecognizedProfit(order),
  );
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
          status: true,
          amount: true,
          amountPaid: true,
          accruedProfit: true,
          currentValue: true,
          investmentEarnings: {
            select: {
              amount: true,
            },
          },
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
    (order) =>
      !completedWithdrawalOrderIds.has(order.id) &&
      isActiveInvestmentBalanceOrder(order),
  );

  const balanceSummary = calculateInvestmentAccountBalance(eligibleInvestmentOrders);

  const investmentOrderEntries = eligibleInvestmentOrders.map((order) => {
    const availableAmount = resolveInvestmentOrderWithdrawalAmount(order);

    return {
      id: order.id,
      investmentAccountId: order.investmentAccountId,
      investmentModel: order.investmentModel,
      principal: decimalToNumber(toDecimal(order.amountPaid)),
      profit: decimalToNumber(
        availableAmount.minus(toDecimal(order.amountPaid)),
      ),
      availableAmount: decimalToNumber(availableAmount),
      currentValue: order.currentValue
        ? decimalToNumber(order.currentValue)
        : null,
      currency: order.currency,
    };
  });

  const accountBalance = balanceSummary.accountBalanceNumber;

  const savingsBalance = savingsAccounts.reduce(
    (sum, account) => sum + decimalToNumber(account.balance),
    0,
  );

  const totalBalance = accountBalance + savingsBalance;
  const currency =
    savingsAccounts[0]?.currency ??
    eligibleInvestmentOrders[0]?.currency ??
    "USD";

  return {
    totalBalance,
    accountBalance,
    savingsBalance,
    currency,
    investmentOrders: investmentOrderEntries,
  };
}
