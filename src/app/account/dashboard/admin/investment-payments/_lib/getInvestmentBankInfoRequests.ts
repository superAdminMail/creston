import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import {
  isInvestmentOrderBankInfoRequestNotification,
  type InvestmentOrderBankInfoRequestMetadata,
} from "@/lib/notifications/investmentOrderBankInfo";
import type { InvestmentBankInfoRequestItem } from "@/lib/types/payments/investmentPaymentReview.types";

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

  const canonicalOrders = await prisma.investmentOrder.findMany({
    where: {
      bankInfoRequestedAt: {
        not: null,
      },
      bankInfoRespondedAt: null,
      platformPaymentMethodId: null,
      status: {
        notIn: ["CANCELLED", "REJECTED"],
      },
    },
    orderBy: {
      bankInfoRequestedAt: "desc",
    },
    select: {
      id: true,
      bankInfoRequestedAt: true,
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
  });

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
      type: true,
      metadata: true,
    },
  });

  const requestNotifications = notifications
    .flatMap((notification) => {
      const metadata = getRequestMetadata(notification.metadata);

      if (!metadata) {
        return [];
      }

      if (
        !isInvestmentOrderBankInfoRequestNotification({
          type: notification.type,
          metadata,
        })
      ) {
        return [];
      }

      return [
        {
          ...notification,
          metadata,
        },
      ];
    });

  const canonicalOrderItems = canonicalOrders.map((order) => {
    const amount = decimalToNumber(order.amount);
    const amountPaid = decimalToNumber(order.amountPaid);

    return {
      requestNotificationId: order.id,
      requestedAt: order.bankInfoRequestedAt?.toISOString() ?? new Date().toISOString(),
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
  });

  const canonicalOrderIds = new Set(canonicalOrders.map((order) => order.id));

  const legacyOrderIds = Array.from(
    new Set(
      requestNotifications
        .map((notification) => notification.metadata.orderId)
        .filter((orderId) => !canonicalOrderIds.has(orderId)),
    ),
  );

  const legacyOrders =
    legacyOrderIds.length > 0
      ? await prisma.investmentOrder.findMany({
          where: {
            id: {
              in: legacyOrderIds,
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
        })
      : [];

  const legacyOrderById = new Map(legacyOrders.map((order) => [order.id, order]));

  const legacyItems = requestNotifications.flatMap((notification) => {
    if (!legacyOrderById.has(notification.metadata.orderId)) {
      return [];
    }

    const order = legacyOrderById.get(notification.metadata.orderId);

    if (!order) {
      return [];
    }

    const amount = decimalToNumber(order.amount);
    const amountPaid = decimalToNumber(order.amountPaid);

    return [
      {
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
      } satisfies InvestmentBankInfoRequestItem,
    ];
  });

  return [...canonicalOrderItems, ...legacyItems].sort(
    (left, right) =>
      new Date(right.requestedAt).getTime() -
      new Date(left.requestedAt).getTime(),
  );
}
