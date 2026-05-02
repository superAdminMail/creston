"use server";

import { revalidatePath } from "next/cache";

import { InvestmentOrderStatus, UserRole } from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { notifyManyRealtimeNotifications } from "@/lib/notifications/notifyManyRealtimeNotifications";
import { prisma } from "@/lib/prisma";

async function notifyAdminsAboutInvestmentOrderCancellation(input: {
  orderId: string;
  investorName: string;
  investorId: string;
  investmentName: string;
  planName: string;
  amount: number;
  currency: string;
}) {
  const admins = await prisma.user.findMany({
    where: {
      isDeleted: false,
      role: {
        in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!admins.length) {
    return;
  }

  const link = `/account/dashboard/admin/investment-orders/${input.orderId}`;
  const title = "Investment order cancelled";
  const message = `${input.investorName} cancelled ${input.planName} for ${input.currency} ${input.amount.toFixed(
    2,
  )}.`;

  await notifyManyRealtimeNotifications({
    recipients: admins,
    buildNotification: (admin) => ({
      userId: admin.id,
      event: "INVESTMENT_ORDER",
      title,
      message,
      link,
      key: `investment-order-cancelled:${input.orderId}:${admin.id}`,
      metadata: {
        kind: "investment_order_cancelled",
        orderId: input.orderId,
        investorId: input.investorId,
        investorName: input.investorName,
        investmentName: input.investmentName,
        planName: input.planName,
        amount: input.amount,
        currency: input.currency,
        adminRole: admin.role,
      },
    }),
    failureMessage:
      "Failed to notify some admins about investment order cancellation",
    failureContext: {
      orderId: input.orderId,
    },
  });
}

export async function cancelUserInvestmentOrder(orderId: string) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return { ok: false, message: "Unauthorized." };
  }

  const normalizedOrderId = orderId.trim();
  if (!normalizedOrderId) {
    return { ok: false, message: "Invalid investment order." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.investmentOrder.findFirst({
        where: {
          id: normalizedOrderId,
          investorProfile: {
            userId: user.id,
          },
        },
        select: {
          id: true,
          status: true,
          amount: true,
          currency: true,
          investmentPlan: {
            select: {
              name: true,
              investment: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        return { ok: false, message: "Investment order not found." };
      }

      if (order.status !== InvestmentOrderStatus.PENDING_PAYMENT) {
        return {
          ok: false,
          message: "Only pending payment orders can be cancelled.",
        };
      }

      await tx.investmentOrder.update({
        where: { id: order.id },
        data: {
          status: InvestmentOrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: "You cancelled this order.",
        },
      });

      return {
        ok: true,
        message: "Investment order cancelled successfully.",
        order: {
          id: order.id,
          amount: Number(order.amount),
          currency: order.currency,
          planName: order.investmentPlan.name,
          investmentName: order.investmentPlan.investment.name,
        },
      };
    });

    if (result.ok) {
      if (result.order) {
        await notifyAdminsAboutInvestmentOrderCancellation({
          orderId: result.order.id,
          investorName: user.name?.trim() || user.email?.trim() || "Investor",
          investorId: user.id,
          investmentName: result.order.investmentName,
          planName: result.order.planName,
          amount: result.order.amount,
          currency: result.order.currency,
        });
      }

      revalidatePath("/account/dashboard/user/investment-orders");
      revalidatePath("/account/dashboard/admin/investment-orders");
      revalidatePath(
        `/account/dashboard/user/investment-orders/${normalizedOrderId}`,
      );
      revalidatePath(
        `/account/dashboard/user/investment-orders/${normalizedOrderId}/payment`,
      );
    }

    return result;
  } catch (error) {
    console.error("Failed to cancel investment order:", error);

    return {
      ok: false,
      message: "Unable to cancel this investment order right now.",
    };
  }
}
