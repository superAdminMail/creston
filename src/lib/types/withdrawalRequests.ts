export type WithdrawalRequestPaymentMethodDto = {
  id: string;
  type: "BANK" | "CRYPTO";
  bankName: string | null;
  network: string | null;
};

export type WithdrawalRequestAllocationDto = {
  sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT";
  sourceLabel: string;
  sourceGrossAmount: string;
  sourcePenaltyAmount: string;
  sourceNetAmount: string;
  currency: string;
};

export type WithdrawalRequestItemDto = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  rejectionReason: string | null;
  hasCommissionFees: boolean;
  commissionStatus: string;
  commissionReviewStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | null;
  commissionSubmittedAmount: string | null;
  requestedAt: string;
  paymentMethodLabel: string;
  paymentMethodStatus: "AVAILABLE" | "UNAVAILABLE" | "UPDATED";
  payoutMethod: WithdrawalRequestPaymentMethodDto | null;
  payoutSnapshot: {
    sourceType: string | null;
    sourceLabel: string | null;
    allocationMode: "AUTO" | "SINGLE" | null;
    withdrawalMode: "EARLY_WITHDRAWAL" | "NORMAL" | null;
    earlyWithdrawalPenalty: string | null;
    allocations?: WithdrawalRequestAllocationDto[];
  } | null;
  investmentOrder: {
    investmentPlan: {
      name: string;
    } | null;
  } | null;
  investmentAccount: {
    investmentPlan: {
      name: string;
    } | null;
  } | null;
};
