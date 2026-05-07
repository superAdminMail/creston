"use server";

import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { getPublicPlatformPaymentMethodForCheckout } from "@/lib/services/platform-wallets/getPlatformWallets";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";

type CreateWithdrawalCommissionSubmissionInput = {
  withdrawalId: string;
  userId: string;
  claimedAmount: number;
  proofMode?: CheckoutFundingMethodType;
  depositorName?: string | null;
  depositorAccountName?: string | null;
  depositorAccountNo?: string | null;
  transferReference?: string | null;
  note?: string | null;
  receiptFileId?: string | null;
  platformPaymentMethodId: string;
};

export type CreateWithdrawalCommissionSubmissionResult = {
  withdrawalId: string;
  commissionStatus: string;
  claimedAmount: string;
  remainingAmount: string;
  currency: string;
  platformPaymentMethodId: string;
  platformPaymentMethodLabel: string;
};

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

export async function createWithdrawalCommissionSubmission({
  withdrawalId,
  userId,
  claimedAmount,
  proofMode = "BANK_TRANSFER",
  depositorName,
  depositorAccountName,
  depositorAccountNo,
  transferReference,
  note,
  receiptFileId,
  platformPaymentMethodId,
}: CreateWithdrawalCommissionSubmissionInput): Promise<CreateWithdrawalCommissionSubmissionResult> {
  if (!Number.isFinite(claimedAmount) || claimedAmount <= 0) {
    throw new Error("Claim amount is required");
  }

  const initialWithdrawal = await prisma.withdrawalOrder.findFirst({
    where: {
      id: withdrawalId,
      investorProfile: {
        userId,
      },
    },
    select: {
      id: true,
      currency: true,
      hasCommissionFees: true,
      investmentOrderId: true,
    },
  });

  if (!initialWithdrawal) {
    throw new Error("Withdrawal order not found");
  }

  if (!initialWithdrawal.hasCommissionFees) {
    throw new Error("This withdrawal does not have commission fees enabled");
  }

  const sourceType = initialWithdrawal.investmentOrderId
    ? "INVESTMENT_ORDER"
    : "SAVINGS_ACCOUNT";

  const paymentMethod = await getPublicPlatformPaymentMethodForCheckout({
    currency: initialWithdrawal.currency,
    preferredType:
      proofMode === "CRYPTO_PROVIDER" ? "WALLET_ADDRESS" : "BANK_INFO",
  });

  if (!paymentMethod || paymentMethod.id !== platformPaymentMethodId) {
    throw new Error(
      proofMode === "CRYPTO_PROVIDER"
        ? "Selected crypto payment method is not available"
        : "Selected bank transfer method is not available",
    );
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const withdrawal = await tx.withdrawalOrder.findFirst({
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
        },
      });

      if (!withdrawal) {
        throw new Error("Withdrawal order not found");
      }

      if (!withdrawal.hasCommissionFees) {
        throw new Error("This withdrawal does not have commission fees enabled");
      }

      const commissionDueAmount =
        sourceType === "SAVINGS_ACCOUNT"
          ? (() => {
              if (withdrawal.savingsFeeAmount === null) {
                throw new Error("Withdrawal fee amount is not configured");
              }

              return decimalToNumber(withdrawal.savingsFeeAmount);
            })()
          : decimalToNumber(withdrawal.amount) *
            (decimalToNumber(withdrawal.commissionPercent) / 100);
      const alreadyPaidAmount = readCommissionPaymentSnapshot(
        withdrawal.payoutSnapshot,
      );
      const remainingBeforeClaim = Math.max(
        0,
        commissionDueAmount - alreadyPaidAmount,
      );

      if (remainingBeforeClaim <= 0) {
        throw new Error("This withdrawal commission has already been settled");
      }

      if (claimedAmount > remainingBeforeClaim) {
        throw new Error("Claim amount cannot exceed the remaining commission");
      }

      const now = new Date();
      const nextPaidAmount = alreadyPaidAmount + claimedAmount;
      const nextRemainingAmount = Math.max(0, commissionDueAmount - nextPaidAmount);
      const nextStatus = nextRemainingAmount <= 0 ? "PAID" : "PARTIALLY_PAID";

      const updatedSnapshot =
        withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
          ? {
              ...(withdrawal.payoutSnapshot as Record<string, unknown>),
              commissionPayment: {
                claimedAmount,
                paidAmount: nextPaidAmount,
                remainingAmount: nextRemainingAmount,
                proofMode,
                platformPaymentMethodId,
                depositorName: depositorName?.trim() || null,
                depositorAccountName: depositorAccountName?.trim() || null,
                depositorAccountNo: depositorAccountNo?.trim() || null,
                transferReference: transferReference?.trim() || null,
                note: note?.trim() || null,
                receiptFileId: receiptFileId?.trim() || null,
                submittedAt: now.toISOString(),
              },
            }
          : {
              commissionPayment: {
                claimedAmount,
                paidAmount: nextPaidAmount,
                remainingAmount: nextRemainingAmount,
                proofMode,
                platformPaymentMethodId,
                depositorName: depositorName?.trim() || null,
                depositorAccountName: depositorAccountName?.trim() || null,
                depositorAccountNo: depositorAccountNo?.trim() || null,
                transferReference: transferReference?.trim() || null,
                note: note?.trim() || null,
                receiptFileId: receiptFileId?.trim() || null,
                submittedAt: now.toISOString(),
              },
            };

      await tx.withdrawalOrder.update({
        where: { id: withdrawal.id },
        data: {
          commissionStatus: nextStatus,
          payoutSnapshot: updatedSnapshot as Prisma.InputJsonValue,
        },
      });

      return {
        withdrawalId: withdrawal.id,
        commissionStatus: nextStatus,
        claimedAmount: claimedAmount.toString(),
        remainingAmount: nextRemainingAmount.toString(),
        currency: withdrawal.currency,
        platformPaymentMethodId: paymentMethod.id,
        platformPaymentMethodLabel: paymentMethod.label,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  return result;
}
