"use server";

import {
  InvestmentCatalogStatus,
  type InvestmentModel,
  type InvestmentPeriod,
  type InvestmentTierLevel,
  type InvestmentType,
} from "@/generated/prisma";
import {
  formatCurrency,
  formatEnumLabel,
  formatTierLevel,
} from "@/lib/formatters/formatters";
import { formatInvestmentTierReturnLabel } from "@/lib/investment/formatInvestmentTierReturnLabel";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import type { InvestmentOrderCreationKycStatus } from "@/lib/types/investment-order";
import { redirect } from "next/navigation";

type Decimalish = {
  toNumber(): number;
};

export type InvestmentOrderCreationTierOption = {
  id: string;
  level: InvestmentTierLevel;
  levelLabel: string;
  minAmount: number;
  maxAmount: number;
  returnLabel: string | null;
  isActive: boolean;
};

export type InvestmentOrderCreationPlanOption = {
  id: string;
  investmentId: string;
  investmentName: string;
  name: string;
  slug: string;
  description: string;
  period: InvestmentPeriod;
  periodLabel: string;
  durationDays: number;
  investmentModel: InvestmentModel;
  currency: string;
  isActive: boolean;
  tiers: InvestmentOrderCreationTierOption[];
  tiersCountLabel: string;
  tierRangeLabel: string | null;
};

export type InvestmentOrderCreationInvestmentOption = {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: InvestmentType;
  typeLabel: string;
  isActive: boolean;
  sortOrder: number;
  icon: {
    url: string;
    alt: string;
  } | null;
  plans: InvestmentOrderCreationPlanOption[];
};

export type InvestmentOrderCreationOptionsData = {
  hasInvestorProfile: boolean;
  kycStatus: InvestmentOrderCreationKycStatus | null;
  canCreateInvestmentOrder: boolean;
  activeUnpaidOrdersCount: number;
  totalActiveInvestments: number;
  totalActivePlans: number;
  totalActiveTiers: number;
  investments: InvestmentOrderCreationInvestmentOption[];
};

function toNumber(value: Decimalish | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  return value.toNumber();
}

function toInvestmentOrderCreationKycStatus(
  value: string | null | undefined,
): InvestmentOrderCreationKycStatus | null {
  switch (value) {
    case "NOT_STARTED":
    case "PENDING_REVIEW":
    case "VERIFIED":
    case "REJECTED":
      return value;
    default:
      return null;
  }
}

export async function getInvestmentOrderCreationOptions(): Promise<InvestmentOrderCreationOptionsData> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const investorProfile = await prisma.investorProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      kycStatus: true,
    },
  });

  if (!investorProfile?.id) {
    return {
      hasInvestorProfile: false,
      kycStatus: null,
      canCreateInvestmentOrder: false,
      activeUnpaidOrdersCount: 0,
      totalActiveInvestments: 0,
      totalActivePlans: 0,
      totalActiveTiers: 0,
      investments: [],
    };
  }

  const activeUnpaidOrdersCount = await prisma.investmentOrder.count({
    where: {
      investorProfileId: investorProfile.id,
      status: {
        in: ["PENDING_PAYMENT", "PARTIALLY_PAID"],
      },
    },
  });

  const investments = await prisma.investment.findMany({
    where: {
      isActive: true,
      status: InvestmentCatalogStatus.ACTIVE,
      investmentPlans: {
        some: {
          isActive: true,
          tiers: {
            some: { isActive: true },
          },
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      symbol: true,
      type: true,
      isActive: true,
      sortOrder: true,
      iconFileAsset: {
        select: { url: true },
      },
      investmentPlans: {
        where: {
          isActive: true,
          tiers: {
            some: { isActive: true },
          },
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          period: true,
          durationDays: true,
          currency: true,
          investmentModel: true,
          isActive: true,
          tiers: {
            where: { isActive: true },
            orderBy: { level: "asc" },
            select: {
              id: true,
              level: true,
              minAmount: true,
              maxAmount: true,
              fixedRoiPercent: true,
              projectedRoiMin: true,
              projectedRoiMax: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  const normalizedInvestments = investments
    .map<InvestmentOrderCreationInvestmentOption>((investment) => {
      const plans = investment.investmentPlans
        .filter(
          (plan) =>
            plan.investmentModel !== "MARKET" || Boolean(investment.symbol),
        )
        .map<InvestmentOrderCreationPlanOption>((plan) => {
          const tiers = plan.tiers.map((tier) => ({
            id: tier.id,
            level: tier.level,
            levelLabel: formatTierLevel(tier.level),
            minAmount: toNumber(tier.minAmount),
            maxAmount: toNumber(tier.maxAmount),
            returnLabel: formatInvestmentTierReturnLabel({
              investmentModel: plan.investmentModel,
              fixedRoiPercent: tier.fixedRoiPercent
                ? toNumber(tier.fixedRoiPercent)
                : null,
              projectedRoiMin: tier.projectedRoiMin
                ? toNumber(tier.projectedRoiMin)
                : null,
              projectedRoiMax: tier.projectedRoiMax
                ? toNumber(tier.projectedRoiMax)
                : null,
            }),
            isActive: tier.isActive,
          }));

          return {
            id: plan.id,
            investmentId: investment.id,
            investmentName: investment.name,
            name: plan.name,
            slug: plan.slug,
            description:
              plan.description?.trim() ||
              "Carefully structured investment plan with defined entry levels and expected performance.",
            period: plan.period,
            periodLabel: formatEnumLabel(plan.period),
            durationDays: plan.durationDays,
            investmentModel: plan.investmentModel,
            currency: plan.currency,
            isActive: plan.isActive,
            tiers,
            tiersCountLabel:
              tiers.length === 1 ? "1 tier option" : `${tiers.length} tier options`,
            tierRangeLabel:
              tiers.length > 0
                ? `${formatCurrency(
                    Math.min(...tiers.map((tier) => tier.minAmount)),
                    plan.currency,
                  )} - ${formatCurrency(
                    Math.max(...tiers.map((tier) => tier.maxAmount)),
                    plan.currency,
                  )}`
                : null,
          };
        });

      return {
        id: investment.id,
        name: investment.name,
        slug: investment.slug,
        description:
          investment.description?.trim() ||
          "Structured Havenstone investment option tailored for long-term financial growth.",
        type: investment.type,
        typeLabel: formatEnumLabel(investment.type),
        isActive: investment.isActive,
        sortOrder: investment.sortOrder,
        icon: investment.iconFileAsset?.url
          ? {
              url: investment.iconFileAsset.url,
              alt: `${investment.name} icon`,
            }
          : null,
        plans,
      };
    })
    .filter((investment) => investment.plans.length > 0);

  return {
    hasInvestorProfile: true,
    kycStatus: toInvestmentOrderCreationKycStatus(investorProfile.kycStatus),
    canCreateInvestmentOrder:
      toInvestmentOrderCreationKycStatus(investorProfile.kycStatus) ===
      "VERIFIED",
    activeUnpaidOrdersCount,
    totalActiveInvestments: normalizedInvestments.length,
    totalActivePlans: normalizedInvestments.reduce(
      (acc, investment) => acc + investment.plans.length,
      0,
    ),
    totalActiveTiers: normalizedInvestments.reduce(
      (acc, investment) =>
        acc + investment.plans.reduce((planAcc, plan) => planAcc + plan.tiers.length, 0),
      0,
    ),
    investments: normalizedInvestments,
  };
}
