export type InvestmentOrderPaymentDetails = {
  id: string;
  amount: number;
  amountPaid: number;
  remainingAmount: number;
  currency: string;
  status: string;
  paymentMethodType: string | null;
  createdAt: string;
  paymentReference: string | null;
  paidAt: string | null;
  confirmedAt: string | null;

  plan: {
    id: string;
    name: string;
    period: string;
  };

  tier: {
    id: string;
    level: string;
    minAmount: number;
    maxAmount: number;
    roiPercent: number;
  };

  bankMethod: {
    id: string;
    label: string;
    bankName: string | null;
    bankCode: string | null;
    accountName: string | null;
    reference: string | null;
    bankAddress: string | null;
    accountNumber: string | null;
    instructions: string | null;
    notes: string | null;
    currency: string;
  } | null;

  hasBankMethod: boolean;
  hasExistingBankInfoRequest: boolean;

  bankInfoRequest: {
    id: string;
    createdAt: string;
    status: string;
  } | null;

  recentPayments: Array<{
    id: string;
    type: string;
    status: string;
    claimedAmount: number;
    approvedAmount: number | null;
    currency: string;
    depositorName: string | null;
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
  }>;

  amountLabel: string;
  amountPaidLabel: string;
  remainingAmountLabel: string;
};
