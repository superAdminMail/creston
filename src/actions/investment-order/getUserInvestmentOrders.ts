"use server";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

type Decimalish = {
  toNumber(): number;
};

type UserInvestmentOrderListItem = {
  id: string;
  amount: number;
  currency: string;
  status: InvestmentOrderStatus;
  statusLabel: string;
  createdAt: string;
  paidAt: string;
  confirmedAt: string;
  cancelledAt: string;
  linkedInvestmentAccountId: string | null;
  plan: {
    id: string;
    name: string;
    slug: string;
    periodLabel: string;
  };
  tier: {
    id: string;
    levelLabel: string;
    roiPercent: number;
  };
  investment: {
    id: string;
    name: string;
    typeLabel: string;
    icon: {
      url: string;
      alt: string;
    } | null;
  };
  primaryAction: {
    label: string;
    href: string;
  };
};

export type UserInvestmentOrdersData = {
  hasInvestorProfile: boolean;
  totalOrders: number;
  counts: Record<InvestmentOrderStatus, number>;
  orders: UserInvestmentOrderListItem[];
};

function toNumber(value: Decimalish | number) {
  if (typeof value === "number") return value;
  return value.toNumber();
}

function getPrimaryAction(
  order: Pick<
    UserInvestmentOrderListItem,
    "id" | "status" | "linkedInvestmentAccountId"
  >,
) {
  switch (order.status) {
    case InvestmentOrderStatus.PENDING_PAYMENT:
      return {
        label: "Make payment",
        href: `/account/dashboard/user/investments#order-${order.id}`,
      };
    case InvestmentOrderStatus.PENDING_CONFIRMATION:
      return {
        label: "View details",
        href: `/account/dashboard/user/investments#order-${order.id}`,
      };
    case InvestmentOrderStatus.CONFIRMED:
      return order.linkedInvestmentAccountId
        ? {
            label: "View account",
            href: `/account/dashboard/user/investment-accounts/${order.linkedInvestmentAccountId}`,
          }
        : {
            label: "View details",
            href: `/account/dashboard/user/investments#order-${order.id}`,
          };
    case InvestmentOrderStatus.CANCELLED:
    case InvestmentOrderStatus.REJECTED:
    case InvestmentOrderStatus.PAID:
    case InvestmentOrderStatus.PARTIALLY_PAID:
    default:
      return {
        label: "View details",
        href: `/account/dashboard/user/investments#order-${order.id}`,
      };
  }
}

export async function getUserInvestmentOrders(): Promise<UserInvestmentOrdersData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      investmentOrders: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          createdAt: true,
          paidAt: true,
          confirmedAt: true,
          cancelledAt: true,
          investmentAccountId: true,
          investmentPlan: {
            select: {
              id: true,
              name: true,
              slug: true,
              period: true,
              investment: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  iconFileAsset: {
                    select: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
          investmentPlanTier: {
            select: {
              id: true,
              level: true,
              roiPercent: true,
            },
          },
        },
      },
    },
  });

  const emptyCounts: Record<InvestmentOrderStatus, number> = {
    PENDING_PAYMENT: 0,
    PENDING_CONFIRMATION: 0,
    CONFIRMED: 0,
    CANCELLED: 0,
    REJECTED: 0,
    PAID: 0,
    PARTIALLY_PAID: 0,
  };

  if (!investorProfile?.id) {
    return {
      hasInvestorProfile: false,
      totalOrders: 0,
      counts: emptyCounts,
      orders: [],
    };
  }

  const orders = investorProfile.investmentOrders.map((order) => {
    const normalizedOrder: UserInvestmentOrderListItem = {
      id: order.id,
      amount: toNumber(order.amount),
      currency: order.currency,
      status: order.status,
      statusLabel: formatEnumLabel(order.status),
      createdAt: formatDateLabel(order.createdAt),
      paidAt: formatDateLabel(order.paidAt, "Not paid yet"),
      confirmedAt: formatDateLabel(order.confirmedAt, "Awaiting confirmation"),
      cancelledAt: formatDateLabel(order.cancelledAt, "Active order"),
      linkedInvestmentAccountId: order.investmentAccountId,
      plan: {
        id: order.investmentPlan.id,
        name: order.investmentPlan.name,
        slug: order.investmentPlan.slug,
        periodLabel: formatEnumLabel(order.investmentPlan.period),
      },
      tier: {
        id: order.investmentPlanTier.id,
        levelLabel: formatEnumLabel(order.investmentPlanTier.level),
        roiPercent: toNumber(order.investmentPlanTier.roiPercent),
      },
      investment: {
        id: order.investmentPlan.investment.id,
        name: order.investmentPlan.investment.name,
        typeLabel: formatEnumLabel(order.investmentPlan.investment.type),
        icon: order.investmentPlan.investment.iconFileAsset?.url
          ? {
              url: order.investmentPlan.investment.iconFileAsset.url,
              alt: `${order.investmentPlan.investment.name} icon`,
            }
          : null,
      },
      primaryAction: {
        label: "",
        href: "",
      },
    };

    normalizedOrder.primaryAction = getPrimaryAction(normalizedOrder);

    return normalizedOrder;
  });

  const counts = orders.reduce(
    (summary, order) => {
      summary[order.status] += 1;
      return summary;
    },
    { ...emptyCounts },
  );

  return {
    hasInvestorProfile: true,
    totalOrders: orders.length,
    counts,
    orders,
  };
}
