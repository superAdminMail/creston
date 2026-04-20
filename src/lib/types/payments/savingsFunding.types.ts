export type SavingsFundingBankMethod = {
  id: string;
  label: string;
  bankName: string | null;
  bankCode: string | null;
  accountName: string | null;
  accountNumber: string | null;
  instructions: string | null;
  notes: string | null;
  currency: string;
};

export type SavingsFundingLatestPayment = {
  id: string;
  status: string;
  claimedAmount: number;
  approvedAmount: number | null;
  currency: string;
  depositorName: string | null;
  depositorAccountName: string | null;
  depositorAccountNo: string | null;
  transferReference: string | null;
  note: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  receipt: {
    id: string;
    url: string | null;
    fileName: string;
  } | null;
};

export type SavingsFundingIntentView = {
  id: string;
  status: string;
  fundingMethodType: string;
  targetAmount: number;
  creditedAmount: number;
  paymentReference: string | null;
  submittedAt: string | null;
  paidAt: string | null;
  creditedAt: string | null;
  latestPayment: SavingsFundingLatestPayment | null;
};

export type SavingsFundingDetails = {
  account: {
    id: string;
    name: string;
    description: string | null;
    balance: number;
    targetAmount: number | null;
    currency: string;
    status: string;
    isLocked: boolean;
    lockedUntil: string | null;
    createdAt: string;
    product: {
      id: string;
      name: string;
      description: string | null;
      interestEnabled: boolean;
      interestRatePercent: number | null;
      interestPayoutFrequency: string | null;
      allowsDeposits: boolean;
      allowsWithdrawals: boolean;
      isLockable: boolean;
    };
  };
  bankMethod: SavingsFundingBankMethod | null;
  latestIntent: SavingsFundingIntentView | null;
  hasPendingSubmission: boolean;
  hasExistingBankInfoRequest: boolean;
  canSubmitFundingProof: boolean;
  fundingAmountSuggestion: number;
  remainingToTargetAmount: number | null;
  balanceLabel: string;
  targetAmountLabel: string;
  remainingToTargetAmountLabel: string | null;
};
