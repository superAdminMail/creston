import type { SavingsFundingBankMethod } from "@/lib/types/payments/savingsFunding.types";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";

export type WithdrawalCommissionReviewStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type WithdrawalCommissionPaymentSnapshot = {
  claimedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  proofMode: CheckoutFundingMethodType | null;
  platformPaymentMethodId: string | null;
  depositorName: string | null;
  depositorAccountName: string | null;
  depositorAccountNo: string | null;
  transferReference: string | null;
  note: string | null;
  receiptFileId: string | null;
  submittedAt: string | null;
  reviewStatus: WithdrawalCommissionReviewStatus | null;
  approvedAmount: number | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
};

export type WithdrawalCommissionCheckoutDetails = {
  withdrawal: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    rejectionReason: string | null;
    commissionStatus: string;
    hasCommissionFees: boolean;
    commissionPercent: number;
    savingsFeeAmount: number | null;
    sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT";
    sourceLabel: string;
    requestedAt: string;
  };
  paymentMethod: SavingsFundingBankMethod | null;
  commissionPayment: WithdrawalCommissionPaymentSnapshot | null;
  commissionAmount: number;
  paidCommissionAmount: number;
  remainingCommissionAmount: number;
  isSettled: boolean;
  isUnderReview: boolean;
  isClosedWithdrawal: boolean;
};
