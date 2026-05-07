import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import type {
  WithdrawalCommissionPaymentSnapshot,
  WithdrawalCommissionReviewStatus,
} from "@/lib/types/payments/withdrawalCommission.types";

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

function readReviewStatus(
  value: unknown,
): WithdrawalCommissionReviewStatus | null {
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

export function readWithdrawalCommissionPaymentSnapshot(
  payoutSnapshot: unknown,
): WithdrawalCommissionPaymentSnapshot | null {
  if (!payoutSnapshot || typeof payoutSnapshot !== "object") {
    return null;
  }

  const snapshot = payoutSnapshot as Record<string, unknown>;
  const commissionPayment =
    snapshot.commissionPayment && typeof snapshot.commissionPayment === "object"
      ? (snapshot.commissionPayment as Record<string, unknown>)
      : null;

  if (!commissionPayment) {
    return null;
  }

  const claimedAmount =
    readNumber(commissionPayment.claimedAmount) ||
    readNumber(commissionPayment.submittedAmount);
  const paidAmount = readNumber(commissionPayment.paidAmount);
  const remainingAmount = readNumber(commissionPayment.remainingAmount);

  return {
    claimedAmount,
    paidAmount,
    remainingAmount,
    proofMode: readFundingMode(commissionPayment.proofMode),
    platformPaymentMethodId: readNullableString(
      commissionPayment.platformPaymentMethodId,
    ),
    depositorName: readNullableString(commissionPayment.depositorName),
    depositorAccountName: readNullableString(
      commissionPayment.depositorAccountName,
    ),
    depositorAccountNo: readNullableString(
      commissionPayment.depositorAccountNo,
    ),
    transferReference: readNullableString(
      commissionPayment.transferReference,
    ),
    note: readNullableString(commissionPayment.note),
    receiptFileId: readNullableString(commissionPayment.receiptFileId),
    submittedAt: readNullableString(commissionPayment.submittedAt),
    reviewStatus: readReviewStatus(commissionPayment.reviewStatus),
    approvedAmount:
      commissionPayment.approvedAmount === null ||
      commissionPayment.approvedAmount === undefined
        ? null
        : readNumber(commissionPayment.approvedAmount),
    reviewedAt: readNullableString(commissionPayment.reviewedAt),
    reviewedByUserId: readNullableString(commissionPayment.reviewedByUserId),
    reviewNote: readNullableString(commissionPayment.reviewNote),
    rejectionReason: readNullableString(commissionPayment.rejectionReason),
  };
}

export function hasPendingWithdrawalCommissionReview(
  payoutSnapshot: unknown,
) {
  return (
    readWithdrawalCommissionPaymentSnapshot(payoutSnapshot)?.reviewStatus ===
    "PENDING_REVIEW"
  );
}
