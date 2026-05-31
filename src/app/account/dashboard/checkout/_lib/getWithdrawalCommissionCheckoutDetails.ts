import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { getPublicPlatformPaymentMethodForCheckout } from "@/lib/services/platform-wallets/getPlatformWallets";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import type { WithdrawalCommissionCheckoutDetails } from "@/lib/types/payments/withdrawalCommission.types";
import { getWithdrawalCommissionSourceType } from "@/lib/payments/withdrawals/withdrawalCommissionSettings";
import { isWithdrawalTerminalStatus } from "@/lib/payments/withdrawals/withdrawalStatusWorkflow";
import {
  isWithdrawalCommissionSettledStatus,
} from "@/lib/payments/withdrawals/withdrawalCommissionStatusWorkflow";
import {
  readWithdrawalCommissionPaymentSnapshot,
} from "@/lib/withdrawals/withdrawalCommissionSnapshot";

function normalizeFundingMethodType(
  value: string | null | undefined,
): CheckoutFundingMethodType | null {
  if (value === "BANK_TRANSFER" || value === "CRYPTO_PROVIDER") {
    return value;
  }

  return null;
}

export async function getWithdrawalCommissionCheckoutDetails(
  withdrawalId: string,
  fundingMethodType?: CheckoutFundingMethodType | null,
): Promise<WithdrawalCommissionCheckoutDetails | null> {
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
      commissionStatus: true,
      hasCommissionFees: true,
      commissionPercent: true,
      savingsFeeAmount: true,
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

  if (!withdrawal || !withdrawal.hasCommissionFees) {
    return null;
  }

  const sourceType = getWithdrawalCommissionSourceType({
    investmentOrderId: withdrawal.investmentOrderId,
  });

  const sourceLabel = withdrawal.investmentOrder
    ? `Investment order - ${withdrawal.investmentOrder.investmentPlan.name}`
    : withdrawal.investmentAccount
      ? `Investment account - ${withdrawal.investmentAccount.investmentPlan.name}`
      : "Withdrawal source";

  if (sourceType === "SAVINGS_ACCOUNT" && withdrawal.savingsFeeAmount === null) {
    return null;
  }

  const savingsFeeAmount = withdrawal.savingsFeeAmount;
  const commissionAmount =
    sourceType === "SAVINGS_ACCOUNT"
      ? decimalToNumber(savingsFeeAmount)
      : decimalToNumber(withdrawal.amount) *
        (decimalToNumber(withdrawal.commissionPercent) / 100);

  const commissionPayment = readWithdrawalCommissionPaymentSnapshot(
    withdrawal.payoutSnapshot,
  );
  const paidCommissionAmount = commissionPayment?.paidAmount ?? 0;
  const remainingCommissionAmount = Math.max(
    0,
    commissionAmount - paidCommissionAmount,
  );
  const isUnderReview =
    commissionPayment?.reviewStatus === "PENDING_REVIEW" &&
    !isWithdrawalCommissionSettledStatus(withdrawal.commissionStatus);
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

  return {
    withdrawal: {
      id: withdrawal.id,
      amount: decimalToNumber(withdrawal.amount),
      currency: withdrawal.currency,
      status: withdrawal.status,
      rejectionReason: withdrawal.rejectionReason,
      commissionStatus: withdrawal.commissionStatus,
      hasCommissionFees: withdrawal.hasCommissionFees,
      commissionPercent: decimalToNumber(withdrawal.commissionPercent),
      savingsFeeAmount:
        savingsFeeAmount !== null ? decimalToNumber(savingsFeeAmount) : null,
      sourceType,
      sourceLabel,
      requestedAt: withdrawal.requestedAt.toISOString(),
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
    commissionPayment,
    commissionAmount,
    paidCommissionAmount,
    remainingCommissionAmount,
    isSettled:
      isClosedWithdrawal ||
      remainingCommissionAmount <= 0 ||
      isWithdrawalCommissionSettledStatus(withdrawal.commissionStatus),
    isUnderReview,
    isClosedWithdrawal,
  };
}
