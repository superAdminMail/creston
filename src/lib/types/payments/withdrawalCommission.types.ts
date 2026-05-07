import type { SavingsFundingBankMethod } from "@/lib/types/payments/savingsFunding.types";

export type WithdrawalCommissionCheckoutDetails = {
  withdrawal: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    commissionStatus: string;
    hasCommissionFees: boolean;
    commissionPercent: number;
    savingsFeeAmount: number | null;
    sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT";
    sourceLabel: string;
    requestedAt: string;
  };
  paymentMethod: SavingsFundingBankMethod | null;
  commissionAmount: number;
  paidCommissionAmount: number;
  remainingCommissionAmount: number;
  isSettled: boolean;
};
