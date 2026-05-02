import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import type { SavingsPaymentReviewDetails } from "@/lib/types/payments/savingsPaymentReview.types";
import {
  decimalToNumber,
  mapReviewReceipt,
  reviewReceiptSelect,
  reviewUserSelect,
} from "@/lib/payments/review/paymentReviewMappers";

export async function getSavingsPaymentReviewDetails(
  paymentId: string,
): Promise<SavingsPaymentReviewDetails> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const payment = await prisma.savingsTransactionPayment.findUnique({
    where: { id: paymentId },
    select: {
      id: true,
      type: true,
      status: true,
      claimedAmount: true,
      approvedAmount: true,
      currency: true,
      depositorName: true,
      depositorAccountName: true,
      depositorAccountNo: true,
      transferReference: true,
      blockchainTxHash: true,
      note: true,
      reviewNote: true,
      rejectionReason: true,
      submittedAt: true,
      reviewedAt: true,
      submittedByUser: {
        ...reviewUserSelect,
      },
      reviewedByUser: {
        ...reviewUserSelect,
      },
      receiptFile: {
        ...reviewReceiptSelect,
      },
      platformPaymentMethod: {
        select: {
          id: true,
          label: true,
          bankName: true,
          bankCode: true,
          accountName: true,
          accountNumber: true,
          reference: true,
          bankAddress: true,
          routingNumber: true,
          instructions: true,
        },
      },
      savingsFundingIntent: {
        select: {
          id: true,
          status: true,
          targetAmount: true,
          creditedAmount: true,
          paymentReference: true,
          paidAt: true,
          creditedAt: true,
          savingsAccount: {
            select: {
              id: true,
              name: true,
              status: true,
              balance: true,
              targetAmount: true,
              currency: true,
              savingsProduct: {
                select: {
                  id: true,
                  name: true,
                  maxBalance: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    notFound();
  }

  const claimedAmount = decimalToNumber(payment.claimedAmount);
  const targetAmount = decimalToNumber(payment.savingsFundingIntent.targetAmount);
  const creditedAmount = decimalToNumber(payment.savingsFundingIntent.creditedAmount);
  const remainingFundingAmount = Math.max(targetAmount - creditedAmount, 0);
  const canOfferPartialApproval =
    payment.status === "PENDING_REVIEW" &&
    claimedAmount < remainingFundingAmount;

  return {
    id: payment.id,
    type: payment.type,
    status: payment.status,
    claimedAmount,
    approvedAmount: payment.approvedAmount
      ? decimalToNumber(payment.approvedAmount)
      : null,
    canOfferPartialApproval,
    currency: payment.currency,
    depositorName: payment.depositorName ?? null,
    depositorAccountName: payment.depositorAccountName ?? null,
    depositorAccountNo: payment.depositorAccountNo ?? null,
    transferReference: payment.transferReference ?? null,
    blockchainTxHash: payment.blockchainTxHash ?? null,
    note: payment.note ?? null,
    reviewNote: payment.reviewNote ?? null,
    rejectionReason: payment.rejectionReason ?? null,
    submittedAt: payment.submittedAt.toISOString(),
    reviewedAt: payment.reviewedAt?.toISOString() ?? null,
    submittedBy: {
      id: payment.submittedByUser?.id ?? null,
      name: payment.submittedByUser?.name ?? null,
      email: payment.submittedByUser?.email ?? null,
    },
    reviewedBy: payment.reviewedByUser
      ? {
          id: payment.reviewedByUser.id ?? null,
          name: payment.reviewedByUser.name ?? null,
          email: payment.reviewedByUser.email ?? null,
        }
      : null,
    receipt: mapReviewReceipt(payment.receiptFile),
    bankMethod: payment.platformPaymentMethod
      ? {
          id: payment.platformPaymentMethod.id,
          label: payment.platformPaymentMethod.label,
          bankName: payment.platformPaymentMethod.bankName,
          bankCode: payment.platformPaymentMethod.bankCode,
          accountName: payment.platformPaymentMethod.accountName,
          accountNumber: payment.platformPaymentMethod.accountNumber,
          reference: payment.platformPaymentMethod.reference ?? null,
          bankAddress: payment.platformPaymentMethod.bankAddress ?? null,
          routingNumber: payment.platformPaymentMethod.routingNumber ?? null,
          instructions: payment.platformPaymentMethod.instructions,
        }
      : null,
    fundingIntent: {
      id: payment.savingsFundingIntent.id,
      status: payment.savingsFundingIntent.status,
      targetAmount,
      creditedAmount,
      remainingFundingAmount,
      paymentReference: payment.savingsFundingIntent.paymentReference ?? null,
      paidAt: payment.savingsFundingIntent.paidAt?.toISOString() ?? null,
      creditedAt: payment.savingsFundingIntent.creditedAt?.toISOString() ?? null,
      account: {
        id: payment.savingsFundingIntent.savingsAccount.id,
        name: payment.savingsFundingIntent.savingsAccount.name,
        status: payment.savingsFundingIntent.savingsAccount.status,
        balance: decimalToNumber(payment.savingsFundingIntent.savingsAccount.balance),
        targetAmount: payment.savingsFundingIntent.savingsAccount.targetAmount
          ? decimalToNumber(payment.savingsFundingIntent.savingsAccount.targetAmount)
          : null,
        currency: payment.savingsFundingIntent.savingsAccount.currency,
        product: {
          id: payment.savingsFundingIntent.savingsAccount.savingsProduct.id,
          name: payment.savingsFundingIntent.savingsAccount.savingsProduct.name,
          maxBalance:
            payment.savingsFundingIntent.savingsAccount.savingsProduct.maxBalance
              ? decimalToNumber(
                  payment.savingsFundingIntent.savingsAccount.savingsProduct
                    .maxBalance,
                )
              : null,
        },
      },
    },
  };
}
