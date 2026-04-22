import type { InvestmentModel } from "@/generated/prisma";

type InvestmentTierReturnSource = {
  investmentModel: InvestmentModel;
  fixedRoiPercent: number | null;
  projectedRoiMin: number | null;
  projectedRoiMax: number | null;
};

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatInvestmentTierReturnLabel({
  investmentModel,
  fixedRoiPercent,
  projectedRoiMin,
  projectedRoiMax,
}: InvestmentTierReturnSource) {
  if (investmentModel === "FIXED") {
    return fixedRoiPercent === null ? null : `${formatPercent(fixedRoiPercent)} ROI`;
  }

  if (projectedRoiMin === null && projectedRoiMax === null) {
    return null;
  }

  if (projectedRoiMin !== null && projectedRoiMax !== null) {
    if (projectedRoiMin === projectedRoiMax) {
      return `${formatPercent(projectedRoiMin)} projected ROI`;
    }

    return `${formatPercent(projectedRoiMin)} - ${formatPercent(
      projectedRoiMax,
    )} projected ROI`;
  }

  const fallback = projectedRoiMin ?? projectedRoiMax;

  return fallback === null ? null : `${formatPercent(fallback)} projected ROI`;
}

export function resolveInvestmentTierRoiPercentValue({
  investmentModel,
  fixedRoiPercent,
  projectedRoiMin,
  projectedRoiMax,
}: InvestmentTierReturnSource) {
  if (investmentModel === "FIXED") {
    return fixedRoiPercent;
  }

  return projectedRoiMax ?? projectedRoiMin;
}
