"use server";

import {
  PlatformPaymentMethodType,
  SavingsFundingIntentStatus,
  SavingsFundingMethodType,
  SavingsStatus,
  SavingsTransactionPaymentStatus,
  SavingsTransactionPaymentType,
  UserRole,
} from "@/generated/prisma";
import { isSavingsFundingBankInfoRequestAckNotification } from "@/lib/notifications/savingsFundingBankInfo";
import { prisma } from "@/lib/prisma";

type CreateSavingsFundingDepositSubmissionInput = {
  savingsAccountId: string;
  userId: string;
  claimedAmount: number;
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

  const requestedPrivateMethodAck = await prisma.notification.findFirst({
    where: {
      userId,
      key: {
        startsWith: `savings-funding-bank-info-request-ack:${account.id}:${userId}`,
      },
    },
    select: {
      id: true,
      type: true,
      metadata: true,
    },
  });

  const requestedPrivateMethodId =
    requestedPrivateMethodAck &&
    isSavingsFundingBankInfoRequestAckNotification(requestedPrivateMethodAck) &&
    typeof requestedPrivateMethodAck.metadata === "object" &&
    requestedPrivateMethodAck.metadata !== null &&
    !Array.isArray(requestedPrivateMethodAck.metadata) &&
    typeof requestedPrivateMethodAck.metadata.platformPaymentMethodId ===
      "string"
      ? requestedPrivateMethodAck.metadata.platformPaymentMethodId
      : null;

  const privateMethodAllowed =
    requestedPrivateMethodId !== null &&
    requestedPrivateMethodId === platformPaymentMethodId;

  const paymentMethod = await prisma.platformPaymentMethod.findFirst({
    where: {
      id: platformPaymentMethodId,
      isActive: true,
      type: PlatformPaymentMethodType.BANK_INFO,
      OR: privateMethodAllowed
        ? [
            {
              isPrivate: false,
              OR: [{ currency: account.currency }, { currency: null }],
            },
            {
              isPrivate: true,
              OR: [{ currency: account.currency }, { currency: null }],
            },
          ]
        : [
            {
              isPrivate: false,
              OR: [{ currency: account.currency }, { currency: null }],
            },
          ],
    },
    select: {
      id: true,
      label: true,
    },
  });

  if (!paymentMethod) {
    throw new Error("Selected bank transfer method is not available");
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

  const result = await prisma.$transaction(async (tx) => {
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

    const fundingIntent = await tx.savingsFundingIntent.create({
      data: {
        savingsAccountId: account.id,
        userId,
        fundingMethodType: SavingsFundingMethodType.BANK_TRANSFER,
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
        type: SavingsTransactionPaymentType.BANK_DEPOSIT,
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

    for (const admin of admins) {
      await tx.notification.upsert({
        where: {
          key: `savings-funding-bank-deposit-submitted:${payment.id}:${admin.id}`,
        },
        create: {
          userId: admin.id,
          title: "Savings funding proof submitted",
          message: `A payment proof was submitted for savings account ${account.id} in ${account.currency}.`,
          type: "SYSTEM",
          key: `savings-funding-bank-deposit-submitted:${payment.id}:${admin.id}`,
          link: `/account/dashboard/admin/savings-payments/${payment.id}`,
          metadata: {
            kind: "SAVINGS_FUNDING_BANK_DEPOSIT_SUBMITTED",
            savingsAccountId: account.id,
            fundingIntentId: fundingIntent.id,
            paymentId: payment.id,
            submittedByUserId: userId,
            currency: account.currency,
          },
        },
        update: {
          title: "Savings funding proof submitted",
          message: `A payment proof was submitted for savings account ${account.id} in ${account.currency}.`,
          type: "SYSTEM",
          link: `/account/dashboard/admin/savings-payments/${payment.id}`,
          metadata: {
            kind: "SAVINGS_FUNDING_BANK_DEPOSIT_SUBMITTED",
            savingsAccountId: account.id,
            fundingIntentId: fundingIntent.id,
            paymentId: payment.id,
            submittedByUserId: userId,
            currency: account.currency,
          },
        },
      });
    }

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
  });

  return {
    savingsAccountId: account.id,
    ...result,
  };
}
