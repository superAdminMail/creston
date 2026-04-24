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
