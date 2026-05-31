export type WithdrawalRequestPaymentMethodDto = {
  id: string;
  type: "BANK" | "CRYPTO";
  bankName: string | null;
  network: string | null;
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
  payoutMethod: WithdrawalRequestPaymentMethodDto | null;
  payoutSnapshot: {
    withdrawalMode: "EARLY_WITHDRAWAL" | "NORMAL" | null;
    earlyWithdrawalPenalty: string | null;
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
