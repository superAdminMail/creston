import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { InvestmentPaymentReviewListItem } from "@/lib/types/payments/investmentPaymentReview.types";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

export async function getInvestmentPaymentReviewList(): Promise<
  InvestmentPaymentReviewListItem[]
> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const payments = await prisma.investmentOrderPayment.findMany({
    orderBy: {
      submittedAt: "desc",
    },
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
      investmentOrder: {
        select: {
          id: true,
          status: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    take: 100,
  });

  return payments.map((payment) => ({
    id: payment.id,
    orderId: payment.investmentOrder.id,
    orderStatus: payment.investmentOrder.status,
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
    plan: {
      name: payment.investmentOrder.investmentPlan.name,
    },
  }));
}
