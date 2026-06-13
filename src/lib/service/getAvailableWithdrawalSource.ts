import { buildWithdrawalBalanceSnapshot } from "@/lib/service/withdrawalBalanceSnapshot";

export type AvailableWithdrawalSource =
  | {
      type: "INVESTMENT_POOL";
      id: "INVESTMENT_POOL";
      amount: number;
      currency: string;
      label: string;
      investmentAccountId: null;
      maturityDate: string | null;
      hasEarlyWithdrawal: boolean;
    }
  | {
      type: "SAVINGS_POOL";
      id: "SAVINGS_POOL";
      amount: number;
      currency: string;
      label: string;
      investmentAccountId: null;
    }
  | null;

export type WithdrawalSourceOption = Exclude<AvailableWithdrawalSource, null>;

export async function getWithdrawalSourceOptions(
  investorProfileId: string,
): Promise<WithdrawalSourceOption[]> {
  const snapshot = await buildWithdrawalBalanceSnapshot(investorProfileId);
  const sources: WithdrawalSourceOption[] = [];

  if (snapshot.accountBalance.greaterThan(0)) {
    sources.push({
      type: "INVESTMENT_POOL",
      id: "INVESTMENT_POOL",
      amount: Number(snapshot.accountBalance.toString()),
      currency: snapshot.currency,
      label: "Investment balance",
      investmentAccountId: null,
      maturityDate:
        snapshot.investmentOrders[0]?.maturityDate?.toISOString() ?? null,
      hasEarlyWithdrawal: snapshot.investmentOrders.some(
        (order) => !order.isMatured,
      ),
    });
  }

  if (snapshot.savingsBalance.greaterThan(0)) {
    sources.push({
      type: "SAVINGS_POOL",
      id: "SAVINGS_POOL",
      amount: Number(snapshot.savingsBalance.toString()),
      currency: snapshot.currency,
      label: "Savings balance",
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
