"use server";

import { Prisma, InvestmentOrderStatus } from "@/generated/prisma";
import { pusherServer } from "@/lib/pusher";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { getCurrentUserRole } from "@/lib/getCurrentUser";

import { canConfirmInvestmentOrderStatus } from "./adminInvestmentOrder.shared";

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
  const role = await getCurrentUserRole();

  if (!user?.id || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return errorState("Unauthorized");
  }

  const orderId = formData.get("orderId");

  if (!orderId || typeof orderId !== "string") {
    return errorState("Invalid order.");
  }

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: orderId,
    },
    include: {
      investmentPlan: true,
      investmentPlanTier: true,
      investorProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!order) {
    return errorState("Order not found.");
  }

  if (order.status === InvestmentOrderStatus.CONFIRMED) {
    return errorState("Order already confirmed.");
  }

  if (!canConfirmInvestmentOrderStatus(order.status)) {
    return errorState(
      "Order must be marked paid or pending confirmation before it can be confirmed.",
    );
  }

  const now = new Date();
  const startDate = now;
  const maturityDate = addDays(startDate, order.investmentPlan.durationDays);
  const amount = order.amount.toNumber();
  const roiPercent = order.investmentPlanTier.fixedRoiPercent;

  if (order.investmentModel === "FIXED" && !roiPercent) {
    return errorState(
      "This fixed investment tier is missing an ROI configuration.",
    );
  }

  const expectedProfit =
    order.investmentModel === "FIXED" && roiPercent
      ? (amount * roiPercent.toNumber()) / 100
      : 0;

  await prisma.investmentOrder.update({
    where: { id: order.id },
    data: {
      status: InvestmentOrderStatus.CONFIRMED,
      startDate,
      maturityDate,
      expectedReturn: new Prisma.Decimal(expectedProfit.toFixed(2)),
      confirmedAt: now,
      paidAt: now,
      accruedProfit: new Prisma.Decimal(0),
      lastAccruedAt: null,
      lastValuationAt:
        order.investmentModel === "MARKET" ? now : order.lastValuationAt,
      currentValue:
        order.investmentModel === "MARKET"
          ? new Prisma.Decimal(amount.toFixed(2))
          : order.currentValue,
      isMatured: false,
      completedAt: null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: order.investorProfile.userId,
      type: "INVESTMENT_ORDER_CONFIRMED",
      title: "Investment Order Confirmed",
      message:
        "Your investment order has been confirmed. You can now access your account.",
    },
  });

  await pusherServer.trigger(
    `user-${order.investorProfile.userId}`,
    "investment-order-confirmed",
    {
      orderId: order.id,
      message: "Your investment order has been confirmed.",
    },
  );

  return {
    status: "success",
    message: "Investment confirmed successfully.",
  };
}
