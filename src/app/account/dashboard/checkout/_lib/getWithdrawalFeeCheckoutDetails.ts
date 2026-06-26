import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { getPublicPlatformPaymentMethodForCheckout } from "@/lib/services/platform-wallets/getPlatformWallets";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import type { WithdrawalFeeCheckoutDetails } from "@/lib/types/payments/withdrawalFee.types";
import {
  calculateWithdrawalAppliedFeeAmount,
  getWithdrawalAppliedFeeBaseAmount,
} from "@/lib/withdrawals/withdrawalFeeCheckout";
import {
  readWithdrawalFeePaymentSnapshot,
} from "@/lib/withdrawals/withdrawalFeeSnapshot";
import { isWithdrawalTerminalStatus } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import { resolveWithdrawalSourceDisplayLabel } from "@/lib/withdrawals/withdrawalSourceDisplay";
import {
  getWithdrawalCommissionSourceType,
  readWithdrawalSnapshotString,
} from "@/lib/payments/withdrawals/withdrawalCommissionSettings";

function normalizeFundingMethodType(
  value: string | null | undefined,
): CheckoutFundingMethodType | null {
  if (value === "BANK_TRANSFER" || value === "CRYPTO_PROVIDER") {
    return value;
  }

  return null;
}

export async function getWithdrawalFeeCheckoutDetails(
  withdrawalId: string,
  fundingMethodType?: CheckoutFundingMethodType | null,
): Promise<WithdrawalFeeCheckoutDetails | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const withdrawal = await prisma.withdrawalOrder.findFirst({
    where: {
      id: withdrawalId,
      investorProfile: {
        userId,
      },
    },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      rejectionReason: true,
      payoutSnapshot: true,
      requestedAt: true,
      investmentOrderId: true,
      investmentAccountId: true,
      investmentOrder: {
        select: {
          id: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
      investmentAccount: {
        select: {
          id: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!withdrawal) {
    return null;
  }

  const requestedAmount = decimalToNumber(withdrawal.amount);
  const baseAmount = getWithdrawalAppliedFeeBaseAmount(
    withdrawal.payoutSnapshot,
    requestedAmount,
  );
  const feeAmount = calculateWithdrawalAppliedFeeAmount(baseAmount);
  const feePayment = readWithdrawalFeePaymentSnapshot(withdrawal.payoutSnapshot);
  const paidFeeAmount = feePayment?.paidAmount ?? 0;
  const remainingFeeAmount = Math.max(0, feeAmount - paidFeeAmount);
  const isUnderReview = feePayment?.reviewStatus === "PENDING_REVIEW";
  const isClosedWithdrawal = isWithdrawalTerminalStatus(withdrawal.status);
  const selectedFundingMethod =
    normalizeFundingMethodType(fundingMethodType) ?? "BANK_TRANSFER";

  const paymentMethod = await getPublicPlatformPaymentMethodForCheckout({
    currency: withdrawal.currency,
    preferredType:
      selectedFundingMethod === "CRYPTO_PROVIDER"
        ? "WALLET_ADDRESS"
        : "BANK_INFO",
  });

  const sourceType = getWithdrawalCommissionSourceType({
    investmentOrderId: withdrawal.investmentOrderId,
    sourceType: readWithdrawalSnapshotString(withdrawal.payoutSnapshot, "sourceType"),
    allocationMode: readWithdrawalSnapshotString(
      withdrawal.payoutSnapshot,
      "allocationMode",
    ),
  });
  const sourceLabel =
    readWithdrawalSnapshotString(withdrawal.payoutSnapshot, "sourceLabel") ??
    (withdrawal.investmentOrder
      ? `Investment order - ${withdrawal.investmentOrder.investmentPlan.name}`
      : withdrawal.investmentAccount
        ? `Investment account - ${withdrawal.investmentAccount.investmentPlan.name}`
        : "Withdrawal source");

  return {
    withdrawal: {
      id: withdrawal.id,
      amount: requestedAmount,
      currency: withdrawal.currency,
      status: withdrawal.status,
      rejectionReason: withdrawal.rejectionReason,
      requestedAt: withdrawal.requestedAt.toISOString(),
      sourceType,
      sourceLabel: resolveWithdrawalSourceDisplayLabel(
        withdrawal.payoutSnapshot &&
          typeof withdrawal.payoutSnapshot === "object"
          ? {
              sourceType: readWithdrawalSnapshotString(
                withdrawal.payoutSnapshot,
                "sourceType",
              ),
              sourceLabel: readWithdrawalSnapshotString(
                withdrawal.payoutSnapshot,
                "sourceLabel",
              ),
              allocations: null,
            }
          : null,
        sourceLabel,
      ),
      netPayoutAmount:
        baseAmount > 0 ? baseAmount : null,
    },
    paymentMethod: paymentMethod
      ? {
          id: paymentMethod.id,
          label: paymentMethod.label,
          bankName: paymentMethod.bankName,
          bankCode: paymentMethod.bankCode,
          accountName: paymentMethod.accountName,
          reference: paymentMethod.reference,
          bankAddress: paymentMethod.bankAddress,
          accountNumber: paymentMethod.accountNumber,
          routingNumber: paymentMethod.routingNumber,
          instructions: paymentMethod.instructions,
          notes: paymentMethod.notes,
          walletAddress: paymentMethod.walletAddress,
          currency: paymentMethod.currency ?? withdrawal.currency,
        }
      : null,
    feePayment,
    feeAmount,
    paidFeeAmount,
    remainingFeeAmount,
    isSettled:
      isClosedWithdrawal ||
      remainingFeeAmount <= 0 ||
      feePayment?.reviewStatus === "APPROVED",
    isUnderReview,
    isClosedWithdrawal,
  };
}
