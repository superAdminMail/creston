import { notFound, redirect } from "next/navigation";

import { formatCurrency } from "@/lib/formatters/formatters";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { isSavingsFundingBankInfoRequestAckNotification } from "@/lib/notifications/savingsFundingBankInfo";
import { getPublicPlatformPaymentMethods } from "@/lib/services/platform-wallets/getPlatformWallets";
import type { SavingsFundingDetails } from "@/lib/types/payments/savingsFunding.types";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

export async function getSavingsFundingDetails(
  savingsAccountId: string,
): Promise<SavingsFundingDetails> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const account = await prisma.savingsAccount.findFirst({
    where: {
      id: savingsAccountId,
      investorProfile: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      balance: true,
      targetAmount: true,
      currency: true,
      status: true,
      isLocked: true,
      lockedUntil: true,
      createdAt: true,
      savingsProduct: {
        select: {
          id: true,
          name: true,
          description: true,
          interestEnabled: true,
          interestRatePercent: true,
          interestPayoutFrequency: true,
          allowsDeposits: true,
          allowsWithdrawals: true,
          isLockable: true,
        },
      },
      savingsFundingIntents: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          id: true,
          status: true,
          fundingMethodType: true,
          targetAmount: true,
          creditedAmount: true,
          paymentReference: true,
          submittedAt: true,
          paidAt: true,
          creditedAt: true,
          platformPaymentMethod: {
            select: {
              id: true,
              label: true,
              bankName: true,
              bankCode: true,
              accountName: true,
              accountNumber: true,
              instructions: true,
              notes: true,
              currency: true,
            },
          },
          payments: {
            orderBy: {
              submittedAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              status: true,
              claimedAmount: true,
              approvedAmount: true,
              currency: true,
              depositorName: true,
              depositorAccountName: true,
              depositorAccountNo: true,
              transferReference: true,
              note: true,
              reviewNote: true,
              rejectionReason: true,
              submittedAt: true,
              reviewedAt: true,
              receiptFile: {
                select: {
                  id: true,
                  url: true,
                  fileName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!account) {
    notFound();
  }

  const latestIntent = account.savingsFundingIntents[0] ?? null;

  const existingBankInfoRequest = await prisma.notification.findFirst({
    where: {
      userId: user.id,
      key: {
        startsWith: `savings-funding-bank-info-request-ack:${account.id}:${user.id}`,
      },
    },
    select: {
      id: true,
      type: true,
      metadata: true,
    },
  });

  const existingBankInfoRequestMetadata =
    existingBankInfoRequest &&
    isSavingsFundingBankInfoRequestAckNotification(existingBankInfoRequest) &&
    typeof existingBankInfoRequest.metadata === "object" &&
    existingBankInfoRequest.metadata !== null &&
    !Array.isArray(existingBankInfoRequest.metadata)
      ? existingBankInfoRequest.metadata
      : null;

  const requestedPlatformPaymentMethodId =
    existingBankInfoRequestMetadata &&
    typeof existingBankInfoRequestMetadata.platformPaymentMethodId === "string"
      ? existingBankInfoRequestMetadata.platformPaymentMethodId
      : null;

  const requestedBankMethod = requestedPlatformPaymentMethodId
    ? await prisma.platformPaymentMethod.findFirst({
        where: {
          id: requestedPlatformPaymentMethodId,
          isActive: true,
          isPrivate: true,
          type: "BANK_INFO",
        },
        select: {
          id: true,
          label: true,
          bankName: true,
          bankCode: true,
          accountName: true,
          accountNumber: true,
          instructions: true,
          notes: true,
          currency: true,
        },
      })
    : null;

  const fallbackBankMethod = latestIntent?.platformPaymentMethod
    ? null
    : requestedBankMethod ??
      (await getPublicPlatformPaymentMethods().then(
        (methods) =>
          methods.find(
            (method) =>
              method.type === "BANK_INFO" &&
              (method.currency === account.currency ||
                method.currency === null),
          ) ?? null,
      ));

  const bankMethod = latestIntent?.platformPaymentMethod ?? fallbackBankMethod;
  const balance = toNumber(account.balance);
  const targetAmount = account.targetAmount
    ? toNumber(account.targetAmount)
    : null;
  const remainingToTargetAmount =
    targetAmount === null ? null : Math.max(targetAmount - balance, 0);

  const latestPayment = latestIntent?.payments[0] ?? null;
  const hasPendingSubmission =
    latestIntent?.status === "PENDING" ||
    latestIntent?.status === "SUBMITTED" ||
    latestPayment?.status === "PENDING_REVIEW";

  return {
    account: {
      id: account.id,
      name: account.name,
      description: account.description,
      balance,
      targetAmount,
      currency: account.currency,
      status: account.status,
      isLocked: account.isLocked,
      lockedUntil: account.lockedUntil?.toISOString() ?? null,
      createdAt: account.createdAt.toISOString(),
      product: {
        id: account.savingsProduct.id,
        name: account.savingsProduct.name,
        description: account.savingsProduct.description,
        interestEnabled: account.savingsProduct.interestEnabled,
        interestRatePercent: account.savingsProduct.interestRatePercent
          ? toNumber(account.savingsProduct.interestRatePercent)
          : null,
        interestPayoutFrequency: account.savingsProduct.interestPayoutFrequency,
        allowsDeposits: account.savingsProduct.allowsDeposits,
        allowsWithdrawals: account.savingsProduct.allowsWithdrawals,
        isLockable: account.savingsProduct.isLockable,
      },
    },
    bankMethod: bankMethod
      ? {
          id: bankMethod.id,
          label: bankMethod.label,
          bankName: bankMethod.bankName,
          bankCode: bankMethod.bankCode ?? null,
          accountName: bankMethod.accountName,
          accountNumber: bankMethod.accountNumber,
          instructions: bankMethod.instructions,
          notes: bankMethod.notes ?? null,
          currency: bankMethod.currency ?? account.currency,
        }
      : null,
    latestIntent: latestIntent
      ? {
          id: latestIntent.id,
          status: latestIntent.status,
          fundingMethodType: latestIntent.fundingMethodType,
          targetAmount: toNumber(latestIntent.targetAmount),
          creditedAmount: toNumber(latestIntent.creditedAmount),
          paymentReference: latestIntent.paymentReference ?? null,
          submittedAt: latestIntent.submittedAt?.toISOString() ?? null,
          paidAt: latestIntent.paidAt?.toISOString() ?? null,
          creditedAt: latestIntent.creditedAt?.toISOString() ?? null,
          latestPayment: latestPayment
            ? {
                id: latestPayment.id,
                status: latestPayment.status,
                claimedAmount: toNumber(latestPayment.claimedAmount),
                approvedAmount: latestPayment.approvedAmount
                  ? toNumber(latestPayment.approvedAmount)
                  : null,
                currency: latestPayment.currency,
                depositorName: latestPayment.depositorName ?? null,
                depositorAccountName:
                  latestPayment.depositorAccountName ?? null,
                depositorAccountNo: latestPayment.depositorAccountNo ?? null,
                transferReference: latestPayment.transferReference ?? null,
                note: latestPayment.note ?? null,
                reviewNote: latestPayment.reviewNote ?? null,
                rejectionReason: latestPayment.rejectionReason ?? null,
                submittedAt: latestPayment.submittedAt.toISOString(),
                reviewedAt: latestPayment.reviewedAt?.toISOString() ?? null,
                receipt: latestPayment.receiptFile
                  ? {
                      id: latestPayment.receiptFile.id,
                      url: latestPayment.receiptFile.url ?? null,
                      fileName: latestPayment.receiptFile.fileName,
                    }
                  : null,
              }
            : null,
        }
      : null,
    hasPendingSubmission,
    hasExistingBankInfoRequest:
      existingBankInfoRequest !== null &&
      isSavingsFundingBankInfoRequestAckNotification(existingBankInfoRequest),
    canSubmitFundingProof: Boolean(bankMethod) && !hasPendingSubmission,
    fundingAmountSuggestion:
      remainingToTargetAmount && remainingToTargetAmount > 0
        ? remainingToTargetAmount
        : balance > 0
          ? balance
          : 0,
    remainingToTargetAmount,
    balanceLabel: formatCurrency(balance, account.currency),
    targetAmountLabel:
      targetAmount === null
        ? "Not set"
        : formatCurrency(targetAmount, account.currency),
    remainingToTargetAmountLabel:
      remainingToTargetAmount === null
        ? null
        : formatCurrency(remainingToTargetAmount, account.currency),
  };
}
