"use server";

import { revalidatePath } from "next/cache";

import { Prisma, InvestmentOrderStatus, RuntimeStatus } from "@/generated/prisma";
import { pusherServer } from "@/lib/pusher";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { activateEligibleRewardsForUser } from "@/lib/referrals/referralRewardService";
import { prisma } from "@/lib/prisma";
import { getCurrentUserRole } from "@/lib/getCurrentUser";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import {
  calculateFixedExpectedReturn,
} from "@/lib/services/investment/fixedOrderLifecycle";
import { resolveInvestmentOrderSchedule } from "@/lib/services/investment/orderLifecycle";
import { hasWithdrawalPauseHold } from "@/lib/payments/withdrawals/withdrawalInvestmentOrderHolds";

import { canConfirmInvestmentOrderStatus } from "./adminInvestmentOrder.shared";

type ConfirmInvestmentOrderState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function errorState(message: string): ConfirmInvestmentOrderState {
  return { status: "error", message };
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
    select: {
      id: true,
      status: true,
      investmentModel: true,
      amount: true,
      expectedReturn: true,
      startDate: true,
      maturityDate: true,
      currentValue: true,
      lastValuationAt: true,
      paymentMetadata: true,
      investorProfile: {
        select: {
          userId: true,
        },
      },
      investmentPlan: {
        select: {
          durationDays: true,
        },
      },
      investmentPlanTier: {
        select: {
          fixedRoiPercent: true,
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
  const amount = decimalToNumber(order.amount);
  const shouldRemainPaused = hasWithdrawalPauseHold(order.paymentMetadata);
  const roiPercent = order.investmentPlanTier.fixedRoiPercent;
  const expectedReturn =
    order.investmentModel === "FIXED"
      ? order.expectedReturn ??
        calculateFixedExpectedReturn(amount, roiPercent ?? null)
      : null;
  const orderSchedule = resolveInvestmentOrderSchedule(
    order.startDate,
    order.maturityDate,
    order.investmentPlan.durationDays,
    now,
  );

  if (order.investmentModel === "FIXED" && !expectedReturn) {
    return errorState(
      "This fixed investment tier is missing an ROI configuration.",
    );
  }

  await prisma.investmentOrder.update({
    where: { id: order.id },
    data: {
      status: InvestmentOrderStatus.CONFIRMED,
      runtimeStatus: shouldRemainPaused
        ? RuntimeStatus.PAUSED
        : RuntimeStatus.ONGOING,
      startDate: orderSchedule.startDate,
      maturityDate: orderSchedule.maturityDate,
      ...(expectedReturn ? { expectedReturn } : {}),
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

  try {
    await activateEligibleRewardsForUser({
      referredUserId: order.investorProfile.userId,
      activationType: "INVESTMENT_ORDER_CONFIRMED",
      activationEntityId: order.id,
      investmentOrderId: order.id,
    });
  } catch (error) {
    console.error("[confirmInvestmentOrder.referrals]", error);
  }

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

  revalidatePath("/account/dashboard/admin/investment-orders");
  revalidatePath(`/account/dashboard/admin/investment-orders/${order.id}`);
  revalidatePath("/account/dashboard/user/investment-orders");
  revalidatePath(`/account/dashboard/user/investment-orders/${order.id}`);
  revalidatePath(`/account/dashboard/user/investment-orders/${order.id}/payment`);
  revalidatePath("/account/dashboard/notifications");

  return {
    status: "success",
    message: "Investment confirmed successfully.",
  };
}
