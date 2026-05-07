"use server";

import {
  Prisma,
  PlatformPaymentMethodType,
  SavingsFundingIntentStatus,
  SavingsFundingMethodType,
  SavingsStatus,
  SavingsTransactionPaymentStatus,
  SavingsTransactionPaymentType,
  UserRole,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { upsertBankDepositSubmissionNotifications } from "@/lib/payments/bank/bankDepositSubmissionNotifications";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";

type CreateSavingsFundingDepositSubmissionInput = {
  savingsAccountId: string;
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

export type CreateSavingsFundingDepositSubmissionResult = {
  savingsAccountId: string;
  fundingIntentId: string;
  paymentId: string;
  claimedAmount: string;
  currency: string;
  paymentStatus: SavingsTransactionPaymentStatus;
  fundingIntentStatus: SavingsFundingIntentStatus;
  platformPaymentMethodId: string;
  platformPaymentMethodLabel: string;
};

export async function createSavingsFundingDepositSubmission({
  savingsAccountId,
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
}: CreateSavingsFundingDepositSubmissionInput): Promise<CreateSavingsFundingDepositSubmissionResult> {
  const account = await prisma.savingsAccount.findFirst({
    where: {
      id: savingsAccountId,
      investorProfile: {
        userId,
      },
    },
    select: {
      id: true,
      balance: true,
      targetAmount: true,
      currency: true,
      status: true,
      savingsProduct: {
        select: {
          allowsDeposits: true,
        },
      },
    },
  });

  if (!account) {
    throw new Error("Savings account not found");
  }

  if (account.status !== SavingsStatus.ACTIVE) {
    throw new Error("This savings account is not active");
  }

  if (!account.savingsProduct.allowsDeposits) {
    throw new Error("This savings product does not accept deposits");
  }

  const paymentMethod = await prisma.platformPaymentMethod.findFirst({
    where: {
      id: platformPaymentMethodId,
      isActive: true,
      type:
        proofMode === "CRYPTO_PROVIDER"
          ? PlatformPaymentMethodType.WALLET_ADDRESS
          : PlatformPaymentMethodType.BANK_INFO,
      OR: [{ currency: account.currency }, { currency: null }],
    },
    select: {
      id: true,
      label: true,
    },
  });

  if (!paymentMethod) {
    throw new Error(
      proofMode === "CRYPTO_PROVIDER"
        ? "Selected crypto payment method is not available"
        : "Selected bank transfer method is not available",
    );
  }

  if (proofMode === "CRYPTO_PROVIDER") {
    if (!Number.isFinite(claimedAmount) || claimedAmount <= 0) {
      throw new Error("Claim amount is required");
    }

    if (account.targetAmount !== null) {
      const remainingToTargetAmount = new Prisma.Decimal(
        account.targetAmount,
      ).minus(account.balance);

      if (new Prisma.Decimal(claimedAmount).gt(remainingToTargetAmount)) {
        throw new Error(
          "Claim amount cannot exceed the remaining savings target amount",
        );
      }
    }
  }

  const admins = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    select: {
      id: true,
    },
  });

  const now = new Date();

  const result = await prisma.$transaction(
    async (tx) => {
      const pendingIntent = await tx.savingsFundingIntent.findFirst({
        where: {
          savingsAccountId: account.id,
          userId,
          status: {
            in: [
              SavingsFundingIntentStatus.PENDING,
              SavingsFundingIntentStatus.SUBMITTED,
            ],
          },
        },
        select: {
          id: true,
        },
      });

      if (pendingIntent) {
        throw new Error(
          "You already have a savings funding submission waiting for review",
        );
      }

      const pendingPayment = await tx.savingsTransactionPayment.findFirst({
        where: {
          savingsFundingIntent: {
            savingsAccountId: account.id,
          },
          status: SavingsTransactionPaymentStatus.PENDING_REVIEW,
          type: {
            in: [
              SavingsTransactionPaymentType.BANK_DEPOSIT,
              SavingsTransactionPaymentType.CRYPTO_PROVIDER,
            ],
          },
        },
        select: {
          id: true,
        },
      });

      if (pendingPayment) {
        throw new Error(
          "There is already a pending payment submission for this savings account",
        );
      }

      const fundingIntent = await tx.savingsFundingIntent.create({
        data: {
          savingsAccountId: account.id,
          userId,
          fundingMethodType:
            proofMode === "CRYPTO_PROVIDER"
              ? SavingsFundingMethodType.CRYPTO_PROVIDER
              : SavingsFundingMethodType.BANK_TRANSFER,
          status: SavingsFundingIntentStatus.SUBMITTED,
          platformPaymentMethodId: paymentMethod.id,
          currency: account.currency,
          targetAmount: claimedAmount,
          creditedAmount: 0,
          paymentReference: transferReference?.trim() || null,
          submittedAt: now,
          metadata: {
            source: "checkout",
            depositAmount: claimedAmount,
            proofMode,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      const payment = await tx.savingsTransactionPayment.create({
        data: {
          savingsFundingIntentId: fundingIntent.id,
          type:
            proofMode === "CRYPTO_PROVIDER"
              ? SavingsTransactionPaymentType.CRYPTO_PROVIDER
              : SavingsTransactionPaymentType.BANK_DEPOSIT,
          status: SavingsTransactionPaymentStatus.PENDING_REVIEW,
          platformPaymentMethodId: paymentMethod.id,
          submittedByUserId: userId,
          claimedAmount,
          currency: account.currency,
          depositorName: depositorName?.trim() || null,
          depositorAccountName: depositorAccountName?.trim() || null,
          depositorAccountNo: depositorAccountNo?.trim() || null,
          transferReference: transferReference?.trim() || null,
          note: note?.trim() || null,
          receiptFileId: receiptFileId?.trim() || null,
          metadata: {
            source: "savings_checkout",
            savingsAccountId: account.id,
            proofMode,
          },
        },
        select: {
          id: true,
          claimedAmount: true,
          currency: true,
          status: true,
        },
      });

      await tx.savingsFundingIntent.update({
        where: { id: fundingIntent.id },
        data: {
          paymentReference: transferReference?.trim() || payment.id,
        },
      });

      await upsertBankDepositSubmissionNotifications(
        tx,
        admins.map((admin) => ({
          key: `savings-funding-${proofMode.toLowerCase()}-submitted:${payment.id}:${admin.id}`,
          userId: admin.id,
          title:
            proofMode === "CRYPTO_PROVIDER"
              ? "Savings crypto proof submitted"
              : "Savings funding proof submitted",
          message:
            proofMode === "CRYPTO_PROVIDER"
              ? `A crypto payment proof was submitted for savings account ${account.id} in ${account.currency}.`
              : `A payment proof was submitted for savings account ${account.id} in ${account.currency}.`,
          link: `/account/dashboard/admin/savings-payments/${payment.id}`,
          metadata: {
            kind:
              proofMode === "CRYPTO_PROVIDER"
                ? "SAVINGS_FUNDING_CRYPTO_PROOF_SUBMITTED"
                : "SAVINGS_FUNDING_BANK_DEPOSIT_SUBMITTED",
            savingsAccountId: account.id,
            fundingIntentId: fundingIntent.id,
            paymentId: payment.id,
            submittedByUserId: user.id,
            currency: account.currency,
            proofMode,
          },
        })),
      );

      return {
        fundingIntentId: fundingIntent.id,
        paymentId: payment.id,
        claimedAmount: payment.claimedAmount.toString(),
        currency: payment.currency,
        paymentStatus: payment.status,
        fundingIntentStatus: fundingIntent.status,
        platformPaymentMethodId: paymentMethod.id,
        platformPaymentMethodLabel: paymentMethod.label,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );

  return {
    savingsAccountId: account.id,
    ...result,
  };
}
