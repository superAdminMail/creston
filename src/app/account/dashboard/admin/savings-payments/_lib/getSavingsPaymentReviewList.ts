import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import type { SavingsPaymentReviewListItem } from "@/lib/types/payments/savingsPaymentReview.types";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

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
        select: {
          id: true,
          name: true,
          email: true,
        },
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
    claimedAmount: toNumber(payment.claimedAmount),
    approvedAmount: payment.approvedAmount
      ? toNumber(payment.approvedAmount)
      : null,
    currency: payment.currency,
    depositorName: payment.depositorName ?? null,
    transferReference: payment.transferReference ?? null,
    submittedAt: payment.submittedAt.toISOString(),
    submittedBy: {
      id: payment.submittedByUser?.id ?? null,
      name: payment.submittedByUser?.name ?? null,
      email: payment.submittedByUser?.email ?? null,
    },
    account: {
      id: payment.savingsFundingIntent.savingsAccount.id,
      name: payment.savingsFundingIntent.savingsAccount.name,
      status: payment.savingsFundingIntent.savingsAccount.status,
      balance: toNumber(payment.savingsFundingIntent.savingsAccount.balance),
      targetAmount: payment.savingsFundingIntent.savingsAccount.targetAmount
        ? toNumber(payment.savingsFundingIntent.savingsAccount.targetAmount)
        : null,
      currency: payment.savingsFundingIntent.savingsAccount.currency,
      product: {
        name: payment.savingsFundingIntent.savingsAccount.savingsProduct.name,
      },
    },
  }));
}
