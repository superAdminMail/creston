"use server";

import { InvestmentOrderStatus } from "@/generated/prisma";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import {
  formatInvestmentTierReturnLabel,
  resolveInvestmentTierRoiPercentValue,
} from "@/lib/investment/formatInvestmentTierReturnLabel";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

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
  cancellationReason: string | null;
  adminNotes: string | null;
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
    returnLabel: string | null;
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

function safeToNumber(value: Decimalish | number | null | undefined): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
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
        href: `/account/dashboard/user/investment-orders/${order.id}/payment`,
      };

    case InvestmentOrderStatus.CONFIRMED:
      return order.linkedInvestmentAccountId
        ? {
            label: "View account",
            href: `/account/dashboard/user/investment-accounts/${order.linkedInvestmentAccountId}`,
          }
        : {
            label: "Open order details",
            href: `/account/dashboard/user/investment-orders/${order.id}`,
          };
    case InvestmentOrderStatus.CANCELLED:
    case InvestmentOrderStatus.REJECTED:
    case InvestmentOrderStatus.PAID:
    case InvestmentOrderStatus.PARTIALLY_PAID:
    default:
      return {
        label: "View details",
        href: `/account/dashboard/user/investment-orders/${order.id}`,
      };
  }
}

export async function getUserInvestmentOrders(): Promise<UserInvestmentOrdersData> {
  const user = await getCurrentSessionUser();

  if (!user) {
    redirect("/auth/login");
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
          cancellationReason: true,
          adminNotes: true,
          investmentAccountId: true,
          investmentPlan: {
            select: {
              id: true,
              name: true,
              slug: true,
              period: true,
              investmentModel: true,
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
              fixedRoiPercent: true,
              projectedRoiMin: true,
              projectedRoiMax: true,
            },
          },
        },
      },
    },
  });

  const emptyCounts: Record<InvestmentOrderStatus, number> = {
    PENDING_PAYMENT: 0,
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
      amount: safeToNumber(order.amount),
      currency: order.currency,
      status: order.status,
      statusLabel: formatEnumLabel(order.status),
      createdAt: formatDateLabel(order.createdAt),
      paidAt: formatDateLabel(order.paidAt, "Not paid yet"),
      confirmedAt: formatDateLabel(order.confirmedAt, "Awaiting confirmation"),
      cancelledAt: formatDateLabel(order.cancelledAt, "Active order"),
      cancellationReason: order.cancellationReason?.trim() || null,
      adminNotes: order.adminNotes?.trim() || null,
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
        roiPercent:
          resolveInvestmentTierRoiPercentValue({
            investmentModel: order.investmentPlan.investmentModel,
            fixedRoiPercent: order.investmentPlanTier.fixedRoiPercent
              ? safeToNumber(order.investmentPlanTier.fixedRoiPercent)
              : null,
            projectedRoiMin: order.investmentPlanTier.projectedRoiMin
              ? safeToNumber(order.investmentPlanTier.projectedRoiMin)
              : null,
            projectedRoiMax: order.investmentPlanTier.projectedRoiMax
              ? safeToNumber(order.investmentPlanTier.projectedRoiMax)
              : null,
            }) ?? 0,
        returnLabel: formatInvestmentTierReturnLabel({
          investmentModel: order.investmentPlan.investmentModel,
          fixedRoiPercent: order.investmentPlanTier.fixedRoiPercent
            ? safeToNumber(order.investmentPlanTier.fixedRoiPercent)
            : null,
          projectedRoiMin: order.investmentPlanTier.projectedRoiMin
            ? safeToNumber(order.investmentPlanTier.projectedRoiMin)
            : null,
          projectedRoiMax: order.investmentPlanTier.projectedRoiMax
            ? safeToNumber(order.investmentPlanTier.projectedRoiMax)
            : null,
        }),
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
