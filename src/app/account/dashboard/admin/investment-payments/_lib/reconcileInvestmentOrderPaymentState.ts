import { Prisma } from "@/generated/prisma";

export async function reconcileInvestmentOrderPaymentState(
  tx: Prisma.TransactionClient,
  investmentOrderId: string,
) {
  const order = await tx.investmentOrder.findUnique({
    where: { id: investmentOrderId },
    select: {
      id: true,
      amount: true,
      status: true,
      runtimeStatus: true,
      paidAt: true,
      confirmedAt: true,
    },
  });

  if (!order) {
    throw new Error("Investment order not found during reconciliation.");
  }

  const approvedPayments = await tx.investmentOrderPayment.findMany({
    where: {
      investmentOrderId,
      status: "APPROVED",
    },
    select: {
      approvedAmount: true,
    },
  });

  const approvedTotal = approvedPayments.reduce((sum, item) => {
    return sum.plus(item.approvedAmount ?? 0);
  }, new Prisma.Decimal(0));

  const orderAmount = new Prisma.Decimal(order.amount);
  const hasAnyApproved = approvedTotal.gt(0);
  const isFullyPaid = approvedTotal.gte(orderAmount);

  let nextStatus = order.status;
  let nextRuntimeStatus = order.runtimeStatus;

  if (!hasAnyApproved) {
    nextStatus = "PENDING_PAYMENT";
    nextRuntimeStatus = "NOT_STARTED";
  } else if (isFullyPaid) {
    if (order.status !== "CONFIRMED") {
      nextStatus = "PAID";
    }
    nextRuntimeStatus =
      order.status === "CONFIRMED" ? "ONGOING" : "NOT_STARTED";
  } else {
    nextStatus = "PARTIALLY_PAID";
    nextRuntimeStatus =
      order.status === "CONFIRMED" ? "ONGOING" : "NOT_STARTED";
  }

  await tx.investmentOrder.update({
    where: { id: investmentOrderId },
    data: {
      amountPaid: approvedTotal,
      status: nextStatus,
      runtimeStatus: nextRuntimeStatus,
      paidAt:
        isFullyPaid && !order.paidAt
          ? new Date()
          : isFullyPaid
            ? order.paidAt
            : null,
      lastPaymentReviewedAt: new Date(),
    },
  });

  return {
    approvedTotal: approvedTotal.toNumber(),
    nextStatus,
  };
}
