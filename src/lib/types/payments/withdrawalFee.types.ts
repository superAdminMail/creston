import type { SavingsFundingBankMethod } from "@/lib/types/payments/savingsFunding.types";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";

export type WithdrawalFeeReviewStatus =
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type WithdrawalFeePaymentSnapshot = {
  feeAmount: number;
  submittedAmount: number;
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
  reviewStatus: WithdrawalFeeReviewStatus | null;
  approvedAmount: number | null;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
};

export type WithdrawalFeeCheckoutDetails = {
  withdrawal: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    rejectionReason: string | null;
    requestedAt: string;
    sourceType: "INVESTMENT_ORDER" | "SAVINGS_ACCOUNT" | "MIXED";
    sourceLabel: string;
    netPayoutAmount: number | null;
  };
  paymentMethod: SavingsFundingBankMethod | null;
  feePayment: WithdrawalFeePaymentSnapshot | null;
  feeAmount: number;
  paidFeeAmount: number;
  remainingFeeAmount: number;
  isSettled: boolean;
  isUnderReview: boolean;
  isClosedWithdrawal: boolean;
};
