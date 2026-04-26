import { InvestmentTierLevel, Prisma } from "@/generated/prisma";

import { toDecimal, ZERO_DECIMAL } from "@/lib/services/investment/decimal";

const TIER_SIMULATION_MULTIPLIER: Record<InvestmentTierLevel, Prisma.Decimal> =
  {
    CORE: new Prisma.Decimal(0.05),
    ADVANCED: new Prisma.Decimal(0.6),
    ELITE: new Prisma.Decimal(0.1),
  };

export type ProfitSimulationRangeInput = {
  projectedRoiMin?: Prisma.Decimal | number | string | null | undefined;
  projectedRoiMax?: Prisma.Decimal | number | string | null | undefined;
  tierLevel: InvestmentTierLevel;
};

export type ProfitSimulationInput = {
  amount: Prisma.Decimal | number | string | null | undefined;
  profit: Prisma.Decimal | number | string | null | undefined;
} & ProfitSimulationRangeInput & {
  simulationMultiplier?: Prisma.Decimal | number | string | null | undefined;
};

export function resolveSimulationMultiplier({
  projectedRoiMin,
  projectedRoiMax,
  tierLevel,
}: ProfitSimulationRangeInput) {
  if (projectedRoiMin != null || projectedRoiMax != null) {
    const lowerBound = toDecimal(projectedRoiMin ?? projectedRoiMax);
    const upperBound = toDecimal(projectedRoiMax ?? projectedRoiMin);
    const minRoi = lowerBound.lessThan(upperBound) ? lowerBound : upperBound;
    const maxRoi = upperBound.greaterThan(lowerBound) ? upperBound : lowerBound;
    const sampledRoi = maxRoi.greaterThan(minRoi)
      ? minRoi.add(maxRoi.sub(minRoi).mul(new Prisma.Decimal(Math.random())))
      : minRoi;

    return sampledRoi.div(100);
  }

  return TIER_SIMULATION_MULTIPLIER[tierLevel];
}

export function getSimulationAdjustment({
  amount,
  tierLevel,
  projectedRoiMin,
  projectedRoiMax,
  simulationMultiplier,
}: Omit<ProfitSimulationInput, "profit">) {
  const multiplier =
    simulationMultiplier == null
      ? resolveSimulationMultiplier({
          projectedRoiMin,
          projectedRoiMax,
          tierLevel,
        })
      : toDecimal(simulationMultiplier);

  return toDecimal(amount).mul(multiplier);
}

export function applyProfitSimulation({
  amount,
  profit,
  tierLevel,
  projectedRoiMin,
  projectedRoiMax,
  simulationMultiplier,
}: ProfitSimulationInput) {
  const simulationAdjustment = getSimulationAdjustment({
    amount,
    tierLevel,
    projectedRoiMin,
    projectedRoiMax,
    simulationMultiplier,
  });
  const simulatedProfit = toDecimal(profit).add(simulationAdjustment);

  if (simulatedProfit.lessThan(0)) {
    return simulationAdjustment;
  }

  return simulatedProfit.greaterThan(0) ? simulatedProfit : ZERO_DECIMAL;
}

export function removeProfitSimulation({
  amount,
  profit,
  tierLevel,
  projectedRoiMin,
  projectedRoiMax,
  simulationMultiplier,
}: ProfitSimulationInput) {
  const rawProfit = toDecimal(profit).sub(
    getSimulationAdjustment({
      amount,
      tierLevel,
      projectedRoiMin,
      projectedRoiMax,
      simulationMultiplier,
    }),
  );

  return rawProfit.greaterThan(0) ? rawProfit : ZERO_DECIMAL;
}
