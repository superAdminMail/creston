"use server";

import {
  Prisma,
  type AccountStatus,
  type InvestmentCatalogStatus,
  type InvestmentPeriod,
  type InvestmentType,
} from "@/generated/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";

type Decimalish = {
  toNumber(): number;
};

const investmentAccountDetailsSelect =
  Prisma.validator<Prisma.InvestmentAccountSelect>()({
    id: true,
    status: true,
    balance: true,
    openedAt: true,
    closedAt: true,
    currency: true,
    createdAt: true,
    updatedAt: true,
    investorProfileId: true,
    investmentPlan: {
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        period: true,
        currency: true,
        isActive: true,
        tiers: {
          where: {
            isActive: true,
          },
          orderBy: {
            level: "asc",
          },
          select: {
            id: true,
            level: true,
            minAmount: true,
            maxAmount: true,
            roiPercent: true,
            isActive: true,
          },
        },
        investment: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            type: true,
            period: true,
            status: true,
            isActive: true,
            sortOrder: true,
            iconFileAsset: {
              select: {
                url: true,
              },
            },
          },
        },
      },
    },
  });

type InvestmentAccountDetailsRecord = Prisma.InvestmentAccountGetPayload<{
  select: typeof investmentAccountDetailsSelect;
}>;

export type InvestmentAccountDetailsViewModel = {
  id: string;
  title: string;
  subtitle: string;
  status: AccountStatus;
  statusLabel: string;
  openedAt: string;
  closedAt: string;
  createdAt: string;
  updatedAt: string;
  currency: string;
  balance: number;
  plan: {
    id: string;
    name: string;
    slug: string;
    description: string;
    period: InvestmentPeriod;
    periodLabel: string;
    currency: string;
    isActive: boolean;
    tiersCountLabel: string;
    tierRangeLabel: string | null;
    tiers: Array<{
      id: string;
      levelLabel: string;
      minAmount: number;
      maxAmount: number;
      roiPercent: number;
      isActive: boolean;
    }>;
  };
  investment: {
    id: string;
    name: string;
    slug: string;
    description: string;
    type: InvestmentType;
    typeLabel: string;
    period: InvestmentPeriod;
    periodLabel: string;
    status: InvestmentCatalogStatus;
    statusLabel: string;
    isActive: boolean;
    sortOrder: number;
    icon: {
      url: string;
      alt: string;
    } | null;
  };
  meta: {
    investorProfileId: string;
    openedAtRaw: Date | null;
    closedAtRaw: Date | null;
    createdAtRaw: Date;
    updatedAtRaw: Date;
  };
  timeline: Array<{
    id: string;
    label: string;
    value: string;
    tone: "default" | "positive" | "subtle";
  }>;
};

function toNumber(value: Decimalish | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

function mapInvestmentAccountDetails(
  account: NonNullable<InvestmentAccountDetailsRecord>,
): InvestmentAccountDetailsViewModel {
  const statusLabel = formatEnumLabel(account.status);
  const openedAt = formatDateLabel(account.openedAt, "Not opened yet");
  const closedAt = formatDateLabel(account.closedAt, "Still active");
  const createdAt = formatDateLabel(account.createdAt);
  const updatedAt = formatDateLabel(account.updatedAt);
  const tiers = account.investmentPlan.tiers.map((tier) => ({
    id: tier.id,
    levelLabel: formatEnumLabel(tier.level),
    minAmount: toNumber(tier.minAmount),
    maxAmount: toNumber(tier.maxAmount),
    roiPercent: toNumber(tier.roiPercent),
    isActive: tier.isActive,
  }));
  const tierRangeLabel =
    tiers.length > 0
      ? `${formatCurrency(
          Math.min(...tiers.map((tier) => tier.minAmount)),
          account.investmentPlan.currency,
        )} - ${formatCurrency(
          Math.max(...tiers.map((tier) => tier.maxAmount)),
          account.investmentPlan.currency,
        )}`
      : null;

  return {
    id: account.id,
    title: account.investmentPlan.name,
    subtitle: "Personalized investment account",
    status: account.status,
    statusLabel,
    openedAt,
    closedAt,
    createdAt,
    updatedAt,
    currency: account.currency,
    balance: toNumber(account.balance),
    plan: {
      id: account.investmentPlan.id,
      name: account.investmentPlan.name,
      slug: account.investmentPlan.slug,
      description:
        account.investmentPlan.description?.trim() ||
        "Structured investment plan for long-term financial growth.",
      period: account.investmentPlan.period,
      periodLabel: formatEnumLabel(account.investmentPlan.period),
      currency: account.investmentPlan.currency,
      isActive: account.investmentPlan.isActive,
      tiersCountLabel:
        tiers.length === 1 ? "1 tier option available" : `${tiers.length} tier options available`,
      tierRangeLabel,
      tiers,
    },
    investment: {
      id: account.investmentPlan.investment.id,
      name: account.investmentPlan.investment.name,
      slug: account.investmentPlan.investment.slug,
      description:
        account.investmentPlan.investment.description?.trim() ||
        "Curated investment product aligned to your Havenstone account strategy.",
      type: account.investmentPlan.investment.type,
      typeLabel: formatEnumLabel(account.investmentPlan.investment.type),
      period: account.investmentPlan.investment.period,
      periodLabel: formatEnumLabel(account.investmentPlan.investment.period),
      status: account.investmentPlan.investment.status,
      statusLabel: formatEnumLabel(account.investmentPlan.investment.status),
      isActive: account.investmentPlan.investment.isActive,
      sortOrder: account.investmentPlan.investment.sortOrder,
      icon: account.investmentPlan.investment.iconFileAsset?.url
        ? {
            url: account.investmentPlan.investment.iconFileAsset.url,
            alt: `${account.investmentPlan.investment.name} icon`,
          }
        : null,
    },
    meta: {
      investorProfileId: account.investorProfileId,
      openedAtRaw: account.openedAt,
      closedAtRaw: account.closedAt,
      createdAtRaw: account.createdAt,
      updatedAtRaw: account.updatedAt,
    },
    timeline: [
      {
        id: "created",
        label: "Account created",
        value: createdAt,
        tone: "default",
      },
      ...(account.openedAt
        ? [
            {
              id: "opened",
              label: "Account opened",
              value: openedAt,
              tone: "positive" as const,
            },
          ]
        : []),
      ...(account.closedAt
        ? [
            {
              id: "closed",
              label: "Account closed",
              value: closedAt,
              tone: "subtle" as const,
            },
          ]
        : []),
      {
        id: "updated",
        label: "Last updated",
        value: updatedAt,
        tone: "subtle",
      },
    ],
  };
}

export async function getInvestmentAccountDetails(
  investmentAccountId: string,
): Promise<InvestmentAccountDetailsViewModel | null> {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    return null;
  }

  const account = await prisma.investmentAccount.findFirst({
    where: {
      id: investmentAccountId,
      investorProfile: {
        userId: user.id,
      },
    },
    select: investmentAccountDetailsSelect,
  });

  if (!account) {
    return null;
  }

  return mapInvestmentAccountDetails(account);
}
