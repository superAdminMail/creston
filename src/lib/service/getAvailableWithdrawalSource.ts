import { InvestmentModel, Prisma, SavingsStatus } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { toDecimal } from "@/lib/services/investment/decimal";

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

function resolveInvestmentOrderAmount(order: {
  investmentModel: InvestmentModel;
  amount: Prisma.Decimal;
  accruedProfit: Prisma.Decimal;
  currentValue: Prisma.Decimal | null;
}) {
  if (order.investmentModel === InvestmentModel.MARKET) {
    return toDecimal(order.currentValue).greaterThan(0)
      ? toDecimal(order.currentValue)
      : toDecimal(order.amount);
  }

  return toDecimal(order.amount).add(toDecimal(order.accruedProfit));
}

export async function getWithdrawalSourceOptions(
  investorProfileId: string,
): Promise<WithdrawalSourceOption[]> {
  const now = new Date();

  const [maturedOrder, unlockedSavings] = await Promise.all([
    prisma.investmentOrder.findFirst({
      where: {
        investorProfileId,
        status: "CONFIRMED",
        isWithdrawn: false,
        isMatured: true,
        maturityDate: {
          lte: now,
        },
      },
      orderBy: {
        maturityDate: "asc",
      },
      select: {
        id: true,
        investmentAccountId: true,
        amount: true,
        accruedProfit: true,
        currentValue: true,
        currency: true,
        investmentModel: true,
        investmentPlan: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.savingsAccount.findFirst({
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
  ]);

  const sources: WithdrawalSourceOption[] = [];

  if (maturedOrder) {
    sources.push({
      type: "INVESTMENT_ORDER",
      id: maturedOrder.id,
      amount: resolveInvestmentOrderAmount(maturedOrder).toNumber(),
      currency: maturedOrder.currency,
      label: `Matured order: ${maturedOrder.investmentPlan.name}`,
      investmentAccountId: maturedOrder.investmentAccountId,
    });
  }

  if (unlockedSavings) {
    sources.push({
      type: "SAVINGS_ACCOUNT",
      id: unlockedSavings.id,
      amount: toDecimal(unlockedSavings.balance).toNumber(),
      currency: unlockedSavings.currency,
      label: `Savings account: ${unlockedSavings.name}`,
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
