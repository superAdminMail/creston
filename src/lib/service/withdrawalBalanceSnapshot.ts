import {
  InvestmentModel,
  InvestmentOrderStatus,
  Prisma,
  SavingsStatus,
  WithdrawalAllocationSourceType,
  WithdrawalStatus,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import {
  toDecimal,
  ZERO_DECIMAL,
} from "@/lib/services/investment/decimal";
import { computeInvestmentOrderRecognizedProfit } from "@/lib/services/investment/valuationService";

export type WithdrawalSourceType = "INVESTMENT_POOL" | "SAVINGS_POOL";

export type WithdrawalBalanceInvestmentOrder = {
  id: string;
  investmentAccountId: string;
  investmentModel: InvestmentModel;
  investmentPlanName: string;
  principal: Prisma.Decimal;
  profit: Prisma.Decimal;
  availableAmount: Prisma.Decimal;
  currentValue: Prisma.Decimal | null;
  currency: string;
  maturityDate: Date | null;
  isMatured: boolean;
  penaltyType: "FIXED" | "PERCENT" | null;
  earlyWithdrawalPenaltyValue: Prisma.Decimal | null;
  maxPenaltyAmount: Prisma.Decimal | null;
};

export type WithdrawalBalanceSavingsAccount = {
  id: string;
  name: string;
  availableAmount: Prisma.Decimal;
  currency: string;
};

export type WithdrawalBalanceSnapshot = {
  investmentOrders: WithdrawalBalanceInvestmentOrder[];
  savingsAccounts: WithdrawalBalanceSavingsAccount[];
  accountBalance: Prisma.Decimal;
  savingsBalance: Prisma.Decimal;
  totalBalance: Prisma.Decimal;
  currency: string;
};

export type WithdrawalAllocationPlanItem =
  | {
      sourceType: WithdrawalAllocationSourceType.INVESTMENT_ORDER;
      sourceId: string;
      sourceLabel: string;
      investmentOrderId: string;
      savingsAccountId: null;
      sourceGrossAmount: Prisma.Decimal;
      sourcePenaltyAmount: Prisma.Decimal;
      sourceNetAmount: Prisma.Decimal;
      currency: string;
    }
  | {
      sourceType: WithdrawalAllocationSourceType.SAVINGS_ACCOUNT;
      sourceId: string;
      sourceLabel: string;
      investmentOrderId: null;
      savingsAccountId: string;
      sourceGrossAmount: Prisma.Decimal;
      sourcePenaltyAmount: Prisma.Decimal;
      sourceNetAmount: Prisma.Decimal;
      currency: string;
    };

export type WithdrawalAllocationPlan = {
  requestedAmount: Prisma.Decimal;
  netPayoutAmount: Prisma.Decimal;
  penaltyAmount: Prisma.Decimal;
  allocations: WithdrawalAllocationPlanItem[];
};

function calculateBaseWithdrawableAmount(order: {
  amountPaid: Prisma.Decimal;
  accruedProfit: Prisma.Decimal;
  investmentEarnings?: Array<{
    amount: Prisma.Decimal;
  }>;
}) {
  return toDecimal(order.amountPaid).add(
    computeInvestmentOrderRecognizedProfit(order),
  );
}

export function calculateInvestmentOrderWithdrawalPenalty(
  order: {
    amount: Prisma.Decimal;
    accruedProfit: Prisma.Decimal;
    currentValue: Prisma.Decimal | null;
    isMatured: boolean;
    investmentPlan: {
      penaltyType: "FIXED" | "PERCENT" | null;
      earlyWithdrawalPenaltyValue: Prisma.Decimal | null;
      maxPenaltyAmount: Prisma.Decimal | null;
    };
  },
  grossAmount?: Prisma.Decimal,
) {
  if (order.isMatured) {
    return ZERO_DECIMAL;
  }

  const penaltyType = order.investmentPlan.penaltyType;
  const penaltyValue = order.investmentPlan.earlyWithdrawalPenaltyValue;

  if (!penaltyType || !penaltyValue || penaltyValue.lessThanOrEqualTo(0)) {
    return ZERO_DECIMAL;
  }

  const fullGross = toDecimal(order.currentValue).greaterThan(0)
    ? toDecimal(order.currentValue)
    : toDecimal(order.amount).add(toDecimal(order.accruedProfit));

  if (!fullGross.greaterThan(0)) {
    return ZERO_DECIMAL;
  }

  const fullPenalty =
    penaltyType === "PERCENT"
      ? fullGross.mul(toDecimal(penaltyValue)).div(100)
      : toDecimal(penaltyValue);

  if (order.investmentPlan.maxPenaltyAmount && fullPenalty.greaterThan(order.investmentPlan.maxPenaltyAmount)) {
    return grossAmount && grossAmount.lessThan(fullGross)
      ? toDecimal(order.investmentPlan.maxPenaltyAmount).mul(
          toDecimal(grossAmount).div(fullGross),
        )
      : toDecimal(order.investmentPlan.maxPenaltyAmount);
  }

  if (!grossAmount || grossAmount.greaterThanOrEqualTo(fullGross)) {
    return fullPenalty;
  }

  return fullPenalty.mul(toDecimal(grossAmount).div(fullGross));
}

export async function buildWithdrawalBalanceSnapshot(
  investorProfileId: string,
): Promise<WithdrawalBalanceSnapshot> {
  const [investmentOrders, savingsAccounts, completedWithdrawalOrders] =
    await Promise.all([
      prisma.investmentOrder.findMany({
        where: {
          investorProfileId,
          status: {
            in: [InvestmentOrderStatus.PAID, InvestmentOrderStatus.CONFIRMED],
          },
        },
        orderBy: {
          maturityDate: "asc",
        },
        select: {
          id: true,
          investmentAccountId: true,
          investmentModel: true,
          amount: true,
          amountPaid: true,
          accruedProfit: true,
          currentValue: true,
          isMatured: true,
          maturityDate: true,
          currency: true,
          investmentPlan: {
            select: {
              name: true,
              penaltyType: true,
              earlyWithdrawalPenaltyValue: true,
              maxPenaltyAmount: true,
            },
          },
          investmentEarnings: {
            select: {
              amount: true,
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
          name: true,
          balance: true,
          currency: true,
        },
      }),
      prisma.withdrawalOrder.findMany({
        where: {
          investorProfileId,
          status: WithdrawalStatus.COMPLETED,
        },
        select: {
          allocations: {
            select: {
              sourceType: true,
              sourceId: true,
              sourceGrossAmount: true,
              investmentOrderId: true,
              savingsAccountId: true,
            },
          },
        },
      }),
    ]);

  const consumedInvestmentByOrderId = new Map<string, Prisma.Decimal>();
  const consumedSavingsByAccountId = new Map<string, Prisma.Decimal>();

  for (const withdrawal of completedWithdrawalOrders) {
    for (const allocation of withdrawal.allocations) {
      if (
        allocation.sourceType === WithdrawalAllocationSourceType.INVESTMENT_ORDER &&
        allocation.investmentOrderId
      ) {
        const current =
          consumedInvestmentByOrderId.get(allocation.investmentOrderId) ??
          ZERO_DECIMAL;
        consumedInvestmentByOrderId.set(
          allocation.investmentOrderId,
          current.add(toDecimal(allocation.sourceGrossAmount)),
        );
      }

      if (
        allocation.sourceType === WithdrawalAllocationSourceType.SAVINGS_ACCOUNT &&
        allocation.savingsAccountId
      ) {
        const current =
          consumedSavingsByAccountId.get(allocation.savingsAccountId) ??
          ZERO_DECIMAL;
        consumedSavingsByAccountId.set(
          allocation.savingsAccountId,
          current.add(toDecimal(allocation.sourceGrossAmount)),
        );
      }
    }
  }

  const investmentEntries = investmentOrders
    .map<WithdrawalBalanceInvestmentOrder>((order) => {
      const baseWithdrawable = calculateBaseWithdrawableAmount(order);
      const consumed = consumedInvestmentByOrderId.get(order.id) ?? ZERO_DECIMAL;
      const availableAmount = baseWithdrawable.sub(consumed);

      return {
        id: order.id,
        investmentAccountId: order.investmentAccountId,
        investmentModel: order.investmentModel,
        investmentPlanName: order.investmentPlan.name,
        principal: toDecimal(order.amountPaid),
        profit: computeInvestmentOrderRecognizedProfit(order),
        availableAmount: availableAmount.greaterThan(0)
          ? availableAmount
          : ZERO_DECIMAL,
        currentValue: order.currentValue,
        currency: order.currency,
        maturityDate: order.maturityDate,
        isMatured: order.isMatured,
        penaltyType: order.investmentPlan.penaltyType,
        earlyWithdrawalPenaltyValue:
          order.investmentPlan.earlyWithdrawalPenaltyValue,
        maxPenaltyAmount: order.investmentPlan.maxPenaltyAmount,
      };
    })
    .filter((order) => order.availableAmount.greaterThan(0));

  const savingsEntries = savingsAccounts
    .map<WithdrawalBalanceSavingsAccount>((account) => {
      const consumed = consumedSavingsByAccountId.get(account.id) ?? ZERO_DECIMAL;
      const availableAmount = toDecimal(account.balance).sub(consumed);

      return {
        id: account.id,
        name: account.name,
        availableAmount: availableAmount.greaterThan(0)
          ? availableAmount
          : ZERO_DECIMAL,
        currency: account.currency,
      };
    })
    .filter((account) => account.availableAmount.greaterThan(0));

  const accountBalance = investmentEntries.reduce(
    (sum, order) => sum.add(order.availableAmount),
    ZERO_DECIMAL,
  );
  const savingsBalance = savingsEntries.reduce(
    (sum, account) => sum.add(account.availableAmount),
    ZERO_DECIMAL,
  );
  const totalBalance = accountBalance.add(savingsBalance);
  const currency =
    savingsEntries[0]?.currency ?? investmentEntries[0]?.currency ?? "USD";

  return {
    investmentOrders: investmentEntries,
    savingsAccounts: savingsEntries,
    accountBalance,
    savingsBalance,
    totalBalance,
    currency,
  };
}

export function buildWithdrawalAllocationPlan(
  snapshot: WithdrawalBalanceSnapshot,
  sourceType: WithdrawalSourceType,
  requestedAmount: Prisma.Decimal,
): WithdrawalAllocationPlan {
  let remaining = toDecimal(requestedAmount);
  const allocations: WithdrawalAllocationPlanItem[] = [];
  let penaltyAmount = ZERO_DECIMAL;

  if (!remaining.greaterThan(0)) {
    return {
      requestedAmount: ZERO_DECIMAL,
      netPayoutAmount: ZERO_DECIMAL,
      penaltyAmount: ZERO_DECIMAL,
      allocations,
    };
  }

  if (sourceType === "INVESTMENT_POOL") {
    for (const order of snapshot.investmentOrders) {
      if (!remaining.greaterThan(0)) {
        break;
      }

      const grossAmount = remaining.lessThan(order.availableAmount)
        ? remaining
        : order.availableAmount;

      const penalty = calculateInvestmentOrderWithdrawalPenalty(
        {
          amount: order.principal,
          accruedProfit: order.profit,
          currentValue: order.currentValue,
          isMatured: order.isMatured,
          investmentPlan: {
            penaltyType: order.penaltyType,
            earlyWithdrawalPenaltyValue: order.earlyWithdrawalPenaltyValue,
            maxPenaltyAmount: order.maxPenaltyAmount,
          },
        },
        grossAmount,
      );

      allocations.push({
        sourceType: WithdrawalAllocationSourceType.INVESTMENT_ORDER,
        sourceId: order.id,
        sourceLabel: order.investmentPlanName,
        investmentOrderId: order.id,
        savingsAccountId: null,
        sourceGrossAmount: grossAmount,
        sourcePenaltyAmount: penalty,
        sourceNetAmount: grossAmount.sub(penalty),
        currency: order.currency,
      });

      penaltyAmount = penaltyAmount.add(penalty);
      remaining = remaining.sub(grossAmount);
    }
  } else {
    for (const account of snapshot.savingsAccounts) {
      if (!remaining.greaterThan(0)) {
        break;
      }

      const grossAmount = remaining.lessThan(account.availableAmount)
        ? remaining
        : account.availableAmount;

      allocations.push({
        sourceType: WithdrawalAllocationSourceType.SAVINGS_ACCOUNT,
        sourceId: account.id,
        sourceLabel: account.name,
        investmentOrderId: null,
        savingsAccountId: account.id,
        sourceGrossAmount: grossAmount,
        sourcePenaltyAmount: ZERO_DECIMAL,
        sourceNetAmount: grossAmount,
        currency: account.currency,
      });

      remaining = remaining.sub(grossAmount);
    }
  }

  if (remaining.greaterThan(0)) {
    throw new Error("Insufficient withdrawable balance.");
  }

  const netPayoutAmount = allocations.reduce(
    (sum, item) => sum.add(item.sourceNetAmount),
    ZERO_DECIMAL,
  );

  return {
    requestedAmount: toDecimal(requestedAmount),
    netPayoutAmount,
    penaltyAmount,
    allocations,
  };
}
