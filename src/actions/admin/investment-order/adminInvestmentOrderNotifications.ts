import { InvestmentOrderStatus } from "@/generated/prisma";
import { createRealtimeNotification } from "@/lib/notifications/createNotification";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/services/investment/decimal";

export type AdminInvestmentOrderNotificationContext = {
  orderId: string;
  status: InvestmentOrderStatus;
  investorUserId: string;
  investorName: string;
  investorEmail: string;
  amount: number;
  currency: string;
  planName: string;
  investmentName: string;
};

export async function getAdminInvestmentOrderNotificationContext(
  orderId: string,
): Promise<AdminInvestmentOrderNotificationContext | null> {
  const order = await prisma.investmentOrder.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      status: true,
      amount: true,
      currency: true,
      investorProfile: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
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
    return null;
  }

  return {
    orderId: order.id,
    status: order.status,
    investorUserId: order.investorProfile.user.id,
    investorName:
      order.investorProfile.user.name?.trim() ||
      order.investorProfile.user.email ||
      "Investor",
    investorEmail: order.investorProfile.user.email,
    amount: decimalToNumber(order.amount),
    currency: order.currency,
    planName: order.investmentPlan.name,
    investmentName: order.investmentPlan.investment.name,
  } satisfies AdminInvestmentOrderNotificationContext;
}

async function notifyInvestorAboutAdminInvestmentOrderChange(input: {
  context: AdminInvestmentOrderNotificationContext;
  title: string;
  message: string;
  link: string;
  keyPrefix: string;
  kind: string;
}) {
  try {
    await createRealtimeNotification({
      userId: input.context.investorUserId,
      event: "INVESTMENT_ORDER",
      title: input.title,
      message: input.message,
      link: input.link,
      key: `${input.keyPrefix}:${input.context.orderId}:${input.context.investorUserId}`,
      metadata: {
        kind: input.kind,
        orderId: input.context.orderId,
        investorUserId: input.context.investorUserId,
        investorName: input.context.investorName,
        investorEmail: input.context.investorEmail,
        amount: input.context.amount,
        currency: input.context.currency,
        planName: input.context.planName,
        investmentName: input.context.investmentName,
      },
    });
  } catch (error) {
    console.error("Failed to notify investor about admin investment order change", {
      orderId: input.context.orderId,
      kind: input.kind,
      error,
    });
  }
}

export async function notifyInvestorAboutAdminInvestmentOrderCancellation(
  context: AdminInvestmentOrderNotificationContext,
) {
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(context.amount);

  await notifyInvestorAboutAdminInvestmentOrderChange({
    context,
    title: "Investment order cancelled",
    message: `Your ${context.planName} investment order for ${context.currency} ${amount} was cancelled by our team.`,
    link: `/account/dashboard/user/investment-orders/${context.orderId}`,
    keyPrefix: "investment-order-admin-cancelled",
    kind: "investment_order_cancelled_by_admin",
  });
}

export async function notifyInvestorAboutAdminInvestmentOrderRejection(
  context: AdminInvestmentOrderNotificationContext,
) {
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(context.amount);

  await notifyInvestorAboutAdminInvestmentOrderChange({
    context,
    title: "Investment order rejected",
    message: `Your pending ${context.planName} investment order for ${context.currency} ${amount} was rejected by our team.`,
    link: "/account/dashboard/user/investment-orders",
    keyPrefix: "investment-order-admin-rejected",
    kind: "investment_order_rejected_by_admin",
  });
}
