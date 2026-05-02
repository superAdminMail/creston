import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { InvestmentPaymentReviewListItem } from "@/lib/types/payments/investmentPaymentReview.types";
import {
  mapReviewUser,
  decimalToNumber,
  reviewUserSelect,
} from "@/lib/payments/review/paymentReviewMappers";

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
        ...reviewUserSelect,
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
    plan: {
      name: payment.investmentOrder.investmentPlan.name,
    },
  }));
}
