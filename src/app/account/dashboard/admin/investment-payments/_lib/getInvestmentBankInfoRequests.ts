import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import {
  isInvestmentOrderBankInfoRequestNotification,
  type InvestmentOrderBankInfoRequestMetadata,
} from "@/lib/notifications/investmentOrderBankInfo";
import type { InvestmentBankInfoRequestItem } from "@/lib/types/payments/investmentPaymentReview.types";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

function getRequestMetadata(
  metadata: unknown,
): InvestmentOrderBankInfoRequestMetadata | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const candidate = metadata as Partial<InvestmentOrderBankInfoRequestMetadata>;

  if (
    candidate.kind !== "INVESTMENT_ORDER_BANK_INFO_REQUEST" ||
    typeof candidate.orderId !== "string" ||
    typeof candidate.requesterId !== "string" ||
    typeof candidate.investmentPlanName !== "string" ||
    typeof candidate.currency !== "string"
  ) {
    return null;
  }

  return candidate as InvestmentOrderBankInfoRequestMetadata;
}

export async function getInvestmentBankInfoRequests(): Promise<
  InvestmentBankInfoRequestItem[]
> {
  const { userId } = await requireDashboardRoleAccess([
    "ADMIN",
    "SUPER_ADMIN",
  ]);

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 200,
    select: {
      id: true,
      createdAt: true,
      metadata: true,
    },
  });

  const requestNotifications = notifications
    .map((notification) => ({
      ...notification,
      metadata: getRequestMetadata(notification.metadata),
    }))
    .filter(
      (
        notification,
      ): notification is (typeof notification & {
        metadata: InvestmentOrderBankInfoRequestMetadata;
      }) => isInvestmentOrderBankInfoRequestNotification(notification),
    );

  const uniqueOrderIds = Array.from(
    new Set(requestNotifications.map((notification) => notification.metadata.orderId)),
  );

  if (uniqueOrderIds.length === 0) {
    return [];
  }

  const orders = await prisma.investmentOrder.findMany({
    where: {
      id: {
        in: uniqueOrderIds,
      },
      platformPaymentMethodId: null,
    },
    select: {
      id: true,
      status: true,
      amount: true,
      amountPaid: true,
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
          period: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const orderById = new Map(orders.map((order) => [order.id, order]));

  return requestNotifications
    .map((notification) => {
      const order = orderById.get(notification.metadata.orderId);

      if (!order) {
        return null;
      }

      const amount = toNumber(order.amount);
      const amountPaid = toNumber(order.amountPaid);

      return {
        requestNotificationId: notification.id,
        requestedAt: notification.createdAt.toISOString(),
        orderId: order.id,
        requester: {
          id: order.investorProfile.user.id,
          name: order.investorProfile.user.name,
          email: order.investorProfile.user.email,
        },
        order: {
          id: order.id,
          status: order.status,
          amount,
          amountPaid,
          remainingAmount: Math.max(amount - amountPaid, 0),
          currency: order.currency,
          plan: {
            name: order.investmentPlan.name,
            period: order.investmentPlan.period,
          },
        },
      } satisfies InvestmentBankInfoRequestItem;
    })
    .filter((item): item is InvestmentBankInfoRequestItem => item !== null);
}

