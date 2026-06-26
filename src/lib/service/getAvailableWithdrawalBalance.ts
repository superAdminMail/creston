import { InvestmentModel } from "@/generated/prisma";

import { decimalToNumber } from "@/lib/services/investment/decimal";
import { buildWithdrawalBalanceSnapshot } from "@/lib/service/withdrawalBalanceSnapshot";

export type AvailableWithdrawalInvestmentOrder = {
  id: string;
  investmentAccountId: string;
  investmentModel: InvestmentModel;
  principal: number;
  profit: number;
  availableAmount: number;
  currentValue: number | null;
  maturityDate: string | null;
  isMatured: boolean;
  penaltyType: "FIXED" | "PERCENT" | null;
  earlyWithdrawalPenaltyValue: number | null;
  maxPenaltyAmount: number | null;
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
  availableAmount: number | string | { toString(): string };
}) {
  return Number(order.availableAmount.toString());
}

export async function getAvailableWithdrawalBalance(
  investorProfileId: string,
): Promise<AvailableWithdrawalBalanceSummary> {
  const snapshot = await buildWithdrawalBalanceSnapshot(investorProfileId);

  const investmentOrderEntries = snapshot.investmentOrders.map((order) => {
    const availableAmount = order.availableAmount;

    return {
      id: order.id,
      investmentAccountId: order.investmentAccountId,
      investmentModel: order.investmentModel,
      principal: decimalToNumber(order.principal),
      profit: decimalToNumber(order.profit),
      availableAmount: decimalToNumber(availableAmount),
      currentValue: order.currentValue
        ? decimalToNumber(order.currentValue)
        : null,
      maturityDate: order.maturityDate?.toISOString() ?? null,
      isMatured: order.isMatured,
      penaltyType: order.penaltyType,
      earlyWithdrawalPenaltyValue: order.earlyWithdrawalPenaltyValue
        ? decimalToNumber(order.earlyWithdrawalPenaltyValue)
        : null,
      maxPenaltyAmount: order.maxPenaltyAmount
        ? decimalToNumber(order.maxPenaltyAmount)
        : null,
      currency: order.currency,
    };
  });

  return {
    totalBalance: decimalToNumber(snapshot.totalBalance),
    accountBalance: decimalToNumber(snapshot.accountBalance),
    savingsBalance: decimalToNumber(snapshot.savingsBalance),
    currency: snapshot.currency,
    investmentOrders: investmentOrderEntries,
  };
}
