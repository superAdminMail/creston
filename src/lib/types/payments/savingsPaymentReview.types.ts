import type {
  SavingsFundingIntentStatus,
  SavingsTransactionPaymentStatus,
  SavingsTransactionPaymentType,
  SavingsStatus,
} from "@/generated/prisma";

export type SavingsPaymentReviewListItem = {
  id: string;
  intentId: string;
  intentStatus: SavingsFundingIntentStatus;
  paymentStatus: SavingsTransactionPaymentStatus;
  type: SavingsTransactionPaymentType;
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
  account: {
    id: string;
    name: string;
    status: SavingsStatus;
    balance: number;
    targetAmount: number | null;
    currency: string;
    product: {
      name: string;
    };
  };
};

export type SavingsPaymentReviewDetails = {
  id: string;
  type: SavingsTransactionPaymentType;
  status: SavingsTransactionPaymentStatus;
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
    reference: string | null;
    bankAddress: string | null;
    routingNumber: string | null;
    instructions: string | null;
  } | null;

  fundingIntent: {
    id: string;
    status: SavingsFundingIntentStatus;
    targetAmount: number;
    creditedAmount: number;
    paymentReference: string | null;
    paidAt: string | null;
    creditedAt: string | null;
    account: {
      id: string;
      name: string;
      status: SavingsStatus;
      balance: number;
      targetAmount: number | null;
      currency: string;
      product: {
        id: string;
        name: string;
        maxBalance: number | null;
      };
    };
  };
};
