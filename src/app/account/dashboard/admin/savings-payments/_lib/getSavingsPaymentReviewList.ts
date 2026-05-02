import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import type { SavingsPaymentReviewListItem } from "@/lib/types/payments/savingsPaymentReview.types";
import {
  mapReviewUser,
  decimalToNumber,
  reviewUserSelect,
} from "@/lib/payments/review/paymentReviewMappers";

export async function getSavingsPaymentReviewList(): Promise<
  SavingsPaymentReviewListItem[]
> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const payments = await prisma.savingsTransactionPayment.findMany({
    orderBy: {
      submittedAt: "desc",
    },
    take: 150,
    select: {
      id: true,
      type: true,
      status: true,
      claimedAmount: true,
      approvedAmount: true,
      currency: true,
      depositorName: true,
      transferReference: true,
      submittedAt: true,
      submittedByUser: {
        ...reviewUserSelect,
      },
      savingsFundingIntent: {
        select: {
          id: true,
          status: true,
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
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return payments.map((payment) => ({
    id: payment.id,
    intentId: payment.savingsFundingIntent.id,
    intentStatus: payment.savingsFundingIntent.status,
    paymentStatus: payment.status,
    type: payment.type,
    claimedAmount: decimalToNumber(payment.claimedAmount),
    approvedAmount: payment.approvedAmount
      ? decimalToNumber(payment.approvedAmount)
      : null,
    currency: payment.currency,
    depositorName: payment.depositorName ?? null,
    transferReference: payment.transferReference ?? null,
    submittedAt: payment.submittedAt.toISOString(),
    submittedBy: {
      ...mapReviewUser(payment.submittedByUser),
    },
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
        name: payment.savingsFundingIntent.savingsAccount.savingsProduct.name,
      },
    },
  }));
}
