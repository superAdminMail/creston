import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { getPublicPlatformPaymentMethodForCheckout } from "@/lib/services/platform-wallets/getPlatformWallets";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import type { WithdrawalCommissionCheckoutDetails } from "@/lib/types/payments/withdrawalCommission.types";

function normalizeFundingMethodType(
  value: string | null | undefined,
): CheckoutFundingMethodType | null {
  if (value === "BANK_TRANSFER" || value === "CRYPTO_PROVIDER") {
    return value;
  }

  return null;
}

function readCommissionPaymentSnapshot(payoutSnapshot: unknown) {
  if (!payoutSnapshot || typeof payoutSnapshot !== "object") {
    return 0;
  }

  const snapshot = payoutSnapshot as Record<string, unknown>;
  const commissionPayment =
    snapshot.commissionPayment && typeof snapshot.commissionPayment === "object"
      ? (snapshot.commissionPayment as Record<string, unknown>)
      : null;

  if (!commissionPayment) {
    return 0;
  }

  const paidAmount = Number(commissionPayment.paidAmount ?? 0);
  return Number.isFinite(paidAmount) && paidAmount > 0 ? paidAmount : 0;
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

  const sourceType = withdrawal.investmentOrderId
    ? "INVESTMENT_ORDER"
    : "SAVINGS_ACCOUNT";

  const sourceLabel = withdrawal.investmentOrder
    ? `Investment order - ${withdrawal.investmentOrder.investmentPlan.name}`
    : withdrawal.investmentAccount
      ? `Investment account - ${withdrawal.investmentAccount.investmentPlan.name}`
      : "Withdrawal source";

  const commissionAmount =
    withdrawal.savingsFeeAmount !== null
      ? decimalToNumber(withdrawal.savingsFeeAmount)
      : decimalToNumber(withdrawal.amount) *
        (decimalToNumber(withdrawal.commissionPercent) / 100);

  const paidCommissionAmount = readCommissionPaymentSnapshot(
    withdrawal.payoutSnapshot,
  );
  const remainingCommissionAmount = Math.max(
    0,
    commissionAmount - paidCommissionAmount,
  );

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
      commissionStatus: withdrawal.commissionStatus,
      hasCommissionFees: withdrawal.hasCommissionFees,
      commissionPercent: decimalToNumber(withdrawal.commissionPercent),
      savingsFeeAmount: withdrawal.savingsFeeAmount
        ? decimalToNumber(withdrawal.savingsFeeAmount)
        : null,
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
    commissionAmount,
    paidCommissionAmount,
    remainingCommissionAmount,
    isSettled:
      remainingCommissionAmount <= 0 || withdrawal.commissionStatus === "PAID",
  };
}
