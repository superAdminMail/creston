import { InvestmentCatalogStatus } from "@/generated/prisma";

import { formatCurrency, formatDateLabel, formatEnumLabel, formatTierLevel } from "@/lib/formatters/formatters";
import { formatInvestmentTierReturnLabel } from "@/lib/investment/formatInvestmentTierReturnLabel";
import { prisma } from "@/lib/prisma";
import { getPrices } from "@/lib/services/price/priceService";

type Decimalish = {
  toNumber(): number;
};

type AssetCheckerMarketAsset = {
  id: string;
  investmentId: string;
  investmentName: string;
  investmentSlug: string;
  planId: string;
  planName: string;
  planSlug: string;
  planDescription: string;
  periodLabel: string;
  durationDays: number;
  durationLabel: string;
  currency: string;
  symbol: string;
  investmentTypeLabel: string;
  iconUrl: string | null;
  currentPrice: number | null;
  currentPriceLabel: string | null;
  priceSourceLabel: string;
  priceRecordedAtLabel: string | null;
};

type AssetCheckerFixedTier = {
  id: string;
  level: string;
  levelLabel: string;
  minAmount: number;
  maxAmount: number;
  fixedRoiPercent: number | null;
  fixedRoiLabel: string | null;
};

type AssetCheckerFixedPlan = {
  id: string;
  investmentId: string;
  investmentName: string;
  investmentSlug: string;
  investmentTypeLabel: string;
  planId: string;
  planName: string;
  planSlug: string;
  planDescription: string;
  periodLabel: string;
  durationDays: number;
  durationLabel: string;
  currency: string;
  iconUrl: string | null;
  tiers: AssetCheckerFixedTier[];
};

export type AssetCheckerData = {
  marketAssets: AssetCheckerMarketAsset[];
  fixedPlans: AssetCheckerFixedPlan[];
  stats: {
    marketAssetsCount: number;
    fixedPlansCount: number;
    fixedTiersCount: number;
    liveQuotesCount: number;
  };
};

function toNumber(value: Decimalish | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return value.toNumber();
}

function formatDurationDays(durationDays: number) {
  if (durationDays % 365 === 0) {
    const years = durationDays / 365;
    return `${years} ${years === 1 ? "year" : "years"}`;
  }

  if (durationDays % 30 === 0) {
    const months = durationDays / 30;
    return `${months} ${months === 1 ? "month" : "months"}`;
  }

  if (durationDays % 7 === 0) {
    const weeks = durationDays / 7;
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }

  return `${durationDays} days`;
}

function mapPriceSourceLabel(source: string | null) {
  switch (source) {
    case "live":
      return "Live quote";
    case "db_fallback":
      return "Cached quote";
    case "static_fallback":
      return "Static quote";
    default:
      return "Unavailable";
  }
}

export async function getAssetCheckerData(): Promise<AssetCheckerData> {
  const investments = await prisma.investment.findMany({
    where: {
      isActive: true,
      status: InvestmentCatalogStatus.ACTIVE,
      investmentPlans: {
        some: {
          isActive: true,
          tiers: {
            some: {
              isActive: true,
            },
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
      iconFileAsset: {
        select: {
          url: true,
        },
      },
      investmentPlans: {
        where: {
          isActive: true,
          tiers: {
            some: {
              isActive: true,
            },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
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
              fixedRoiPercent: true,
              projectedRoiMin: true,
              projectedRoiMax: true,
            },
          },
        },
      },
    },
  });

  const marketPlans = investments.flatMap((investment) =>
    investment.investmentPlans
      .filter(
        (plan) =>
          plan.investmentModel === "MARKET" &&
          Boolean(investment.symbol?.trim()),
      )
      .map<AssetCheckerMarketAsset>((plan) => ({
        id: plan.id,
        investmentId: investment.id,
        investmentName: investment.name,
        investmentSlug: investment.slug,
        planId: plan.id,
        planName: plan.name,
        planSlug: plan.slug,
        planDescription:
          plan.description?.trim() ||
          "Platform-supported market plan tracked against live price data.",
        periodLabel: formatEnumLabel(plan.period),
        durationDays: plan.durationDays,
        durationLabel: formatDurationDays(plan.durationDays),
        currency: plan.currency,
        symbol: investment.symbol!.trim().toUpperCase(),
        investmentTypeLabel: formatEnumLabel(investment.type),
        iconUrl: investment.iconFileAsset?.url ?? null,
        currentPrice: null,
        currentPriceLabel: null,
        priceSourceLabel: "Unavailable",
        priceRecordedAtLabel: null,
      })),
  );

  const fixedPlans = investments.flatMap((investment) =>
    investment.investmentPlans
      .filter((plan) => plan.investmentModel === "FIXED")
      .map<AssetCheckerFixedPlan>((plan) => ({
        id: plan.id,
        investmentId: investment.id,
        investmentName: investment.name,
        investmentSlug: investment.slug,
        investmentTypeLabel: formatEnumLabel(investment.type),
        planId: plan.id,
        planName: plan.name,
        planSlug: plan.slug,
        planDescription:
          plan.description?.trim() ||
          "Structured fixed bond plan with deterministic simple-interest accrual.",
        periodLabel: formatEnumLabel(plan.period),
        durationDays: plan.durationDays,
        durationLabel: formatDurationDays(plan.durationDays),
        currency: plan.currency,
        iconUrl: investment.iconFileAsset?.url ?? null,
        tiers: plan.tiers.map<AssetCheckerFixedTier>((tier) => ({
          id: tier.id,
          level: tier.level,
          levelLabel: formatTierLevel(tier.level),
          minAmount: toNumber(tier.minAmount),
          maxAmount: toNumber(tier.maxAmount),
          fixedRoiPercent: tier.fixedRoiPercent ? toNumber(tier.fixedRoiPercent) : null,
          fixedRoiLabel: formatInvestmentTierReturnLabel({
            investmentModel: plan.investmentModel,
            fixedRoiPercent: tier.fixedRoiPercent
              ? toNumber(tier.fixedRoiPercent)
              : null,
            projectedRoiMin: null,
            projectedRoiMax: null,
          }),
        })),
      })),
  );

  const marketSymbols = Array.from(
    new Set(marketPlans.map((plan) => plan.symbol).filter(Boolean)),
  );

  const priceSnapshots = marketSymbols.length
    ? await getPrices(marketSymbols, { preferFreshDb: true })
    : {};

  const marketAssets = marketPlans.map((plan) => {
    const priceSnapshot = priceSnapshots[plan.symbol];
    const currentPrice = priceSnapshot?.price ?? null;

    return {
      ...plan,
      currentPrice,
      currentPriceLabel:
        currentPrice !== null && currentPrice > 0
          ? formatCurrency(currentPrice, "USD")
          : null,
      priceSourceLabel: mapPriceSourceLabel(priceSnapshot?.source ?? null),
      priceRecordedAtLabel: priceSnapshot?.recordedAt
        ? formatDateLabel(priceSnapshot.recordedAt)
        : null,
    };
  });

  return {
    marketAssets,
    fixedPlans,
    stats: {
      marketAssetsCount: marketAssets.length,
      fixedPlansCount: fixedPlans.length,
      fixedTiersCount: fixedPlans.reduce(
        (sum, plan) => sum + plan.tiers.length,
        0,
      ),
      liveQuotesCount: marketAssets.filter(
        (asset) => asset.currentPrice !== null,
      ).length,
    },
  };
}
