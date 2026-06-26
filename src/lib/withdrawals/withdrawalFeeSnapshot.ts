import { asJsonObject } from "@/lib/payments/paymentJson";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import type {
  WithdrawalFeePaymentSnapshot,
  WithdrawalFeeReviewStatus,
} from "@/lib/types/payments/withdrawalFee.types";

function readNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function readNullableString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function readReviewStatus(value: unknown): WithdrawalFeeReviewStatus | null {
  if (
    value === "PENDING_REVIEW" ||
    value === "APPROVED" ||
    value === "REJECTED"
  ) {
    return value;
  }

  return null;
}

function readFundingMode(
  value: unknown,
): CheckoutFundingMethodType | null {
  if (value === "BANK_TRANSFER" || value === "CRYPTO_PROVIDER") {
    return value;
  }

  return null;
}

export function readWithdrawalFeePaymentSnapshot(
  payoutSnapshot: unknown,
): WithdrawalFeePaymentSnapshot | null {
  if (!payoutSnapshot || typeof payoutSnapshot !== "object") {
    return null;
  }

  const snapshot = asJsonObject(payoutSnapshot);
  const feePayment =
    snapshot.withdrawalFeePayment && typeof snapshot.withdrawalFeePayment === "object"
      ? (snapshot.withdrawalFeePayment as Record<string, unknown>)
      : null;

  if (!feePayment) {
    return null;
  }

  const feeAmount =
    readNumber(feePayment.feeAmount) ||
    readNumber(feePayment.submittedAmount) ||
    readNumber(feePayment.claimedAmount);
  const submittedAmount =
    readNumber(feePayment.submittedAmount) ||
    readNumber(feePayment.claimedAmount) ||
    feeAmount;

  return {
    feeAmount,
    submittedAmount,
    paidAmount: readNumber(feePayment.paidAmount),
    remainingAmount: readNumber(feePayment.remainingAmount),
    proofMode: readFundingMode(feePayment.proofMode),
    platformPaymentMethodId: readNullableString(
      feePayment.platformPaymentMethodId,
    ),
    depositorName: readNullableString(feePayment.depositorName),
    depositorAccountName: readNullableString(
      feePayment.depositorAccountName,
    ),
    depositorAccountNo: readNullableString(feePayment.depositorAccountNo),
    transferReference: readNullableString(feePayment.transferReference),
    note: readNullableString(feePayment.note),
    receiptFileId: readNullableString(feePayment.receiptFileId),
    submittedAt: readNullableString(feePayment.submittedAt),
    reviewStatus: readReviewStatus(feePayment.reviewStatus),
    approvedAmount:
      feePayment.approvedAmount === null ||
      feePayment.approvedAmount === undefined
        ? null
        : readNumber(feePayment.approvedAmount),
    reviewedAt: readNullableString(feePayment.reviewedAt),
    reviewedByUserId: readNullableString(feePayment.reviewedByUserId),
    reviewNote: readNullableString(feePayment.reviewNote),
    rejectionReason: readNullableString(feePayment.rejectionReason),
  };
}

export function hasPendingWithdrawalFeeReview(payoutSnapshot: unknown) {
  return (
    readWithdrawalFeePaymentSnapshot(payoutSnapshot)?.reviewStatus ===
    "PENDING_REVIEW"
  );
}
