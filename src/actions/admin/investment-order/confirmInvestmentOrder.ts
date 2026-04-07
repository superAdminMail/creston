"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { Prisma, InvestmentOrderStatus } from "@/generated/prisma";
import { pusherServer } from "@/lib/pusher";

type ConfirmInvestmentOrderState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function errorState(message: string): ConfirmInvestmentOrderState {
  return { status: "error", message };
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export async function confirmInvestmentOrder(
  _: ConfirmInvestmentOrderState,
  formData: FormData,
): Promise<ConfirmInvestmentOrderState> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return errorState("Unauthorized");
  }

  const orderId = formData.get("orderId");

  if (!orderId || typeof orderId !== "string") {
    return errorState("Invalid order.");
  }

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: orderId,
      investorProfile: {
        userId: user.id,
      },
    },
    include: {
      investmentPlan: true,
      investmentPlanTier: true,
    },
  });

  if (!order) {
    return errorState("Order not found.");
  }

  if (order.status === InvestmentOrderStatus.CONFIRMED) {
    return errorState("Order already confirmed.");
  }

  if (order.status !== InvestmentOrderStatus.PENDING_PAYMENT) {
    return errorState("Order cannot be confirmed.");
  }

  const now = new Date();

  const durationDays = order.investmentPlan.durationDays;

  const amount = Number(order.amount);
  const roiPercent = Number(order.investmentPlanTier.roiPercent);

  const startDate = now;
  const maturityDate = addDays(startDate, durationDays);

  const expectedReturn = amount + (amount * roiPercent) / 100;

  await prisma.investmentOrder.update({
    where: { id: order.id },
    data: {
      status: InvestmentOrderStatus.CONFIRMED,
      startDate,
      maturityDate,
      expectedReturn: new Prisma.Decimal(expectedReturn),

      confirmedAt: now,
      paidAt: now,

      accruedProfit: new Prisma.Decimal(0),
      lastAccruedAt: null,
      isMatured: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "INVESTMENT_ORDER_CONFIRMED",
      title: "Investment Order Confirmed",
      message: `Your investment order has been confirmed. You can now access your account.`,
    },
  });

  await pusherServer.trigger(`user-${user.id}`, "investment-order-confirmed", {
    orderId: order.id,
    message: "Your investment order has been confirmed.",
  });

  return {
    status: "success",
    message: "Investment confirmed successfully.",
  };
}
