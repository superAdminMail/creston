import type {
  InvestmentOrderPaymentStatus,
  InvestmentOrderPaymentType,
  InvestmentOrderStatus,
} from "@/generated/prisma";

export type InvestmentPaymentReviewListItem = {
  id: string;
  orderId: string;
  orderStatus: InvestmentOrderStatus;
  paymentStatus: InvestmentOrderPaymentStatus;
  type: InvestmentOrderPaymentType;
  claimedAmount: number;
  approvedAmount: number | null;
  currency: string;
  depositorName: string | null;
  transferReference: string | null;
  submittedAt: string;
  submittedBy: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
  plan: {
    name: string;
  };
};

export type InvestmentPaymentReviewDetails = {
  id: string;
  type: InvestmentOrderPaymentType;
  status: InvestmentOrderPaymentStatus;
  claimedAmount: number;
  approvedAmount: number | null;
  currency: string;
  depositorName: string | null;
  depositorAccountName: string | null;
  depositorAccountNo: string | null;
  transferReference: string | null;
  blockchainTxHash: string | null;
  note: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;

  submittedBy: {
    id: string | null;
    name: string | null;
    email: string | null;
  };

  reviewedBy: {
    id: string | null;
    name: string | null;
    email: string | null;
  } | null;

  receipt: {
    id: string;
    fileName: string;
    url: string | null;
  } | null;

  bankMethod: {
    id: string;
    label: string;
    bankName: string | null;
    bankCode: string | null;
    accountName: string | null;
    accountNumber: string | null;
    instructions: string | null;
  } | null;

  order: {
    id: string;
    status: InvestmentOrderStatus;
    amount: number;
    amountPaid: number;
    remainingAmount: number;
    currency: string;
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
      roiPercent: number;
    };
    investor: {
      id: string;
      name: string | null;
      email: string | null;
    };
  };
};

export type InvestmentBankInfoRequestItem = {
  requestNotificationId: string;
  requestedAt: string;
  orderId: string;
  requester: {
    id: string;
    name: string | null;
    email: string | null;
  };
  order: {
    id: string;
    status: InvestmentOrderStatus;
    amount: number;
    amountPaid: number;
    remainingAmount: number;
    currency: string;
    plan: {
      name: string;
      period: string;
    };
  };
};
