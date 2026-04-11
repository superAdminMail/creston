import { InvestmentTierLevel, Prisma } from "@/generated/prisma";

import { toDecimal, ZERO_DECIMAL } from "@/lib/services/investment/decimal";

const TIER_SIMULATION_MULTIPLIER: Record<InvestmentTierLevel, Prisma.Decimal> =
  {
    CORE: new Prisma.Decimal(0.05),
    ADVANCED: new Prisma.Decimal(0.6),
    ELITE: new Prisma.Decimal(0.1),
  };

export type ProfitSimulationInput = {
  amount: Prisma.Decimal | number | string | null | undefined;
  profit: Prisma.Decimal | number | string | null | undefined;
  tierLevel: InvestmentTierLevel;
};

export function getSimulationAdjustment({
  amount,
  tierLevel,
}: Omit<ProfitSimulationInput, "profit">) {
  return toDecimal(amount).mul(TIER_SIMULATION_MULTIPLIER[tierLevel]);
}

export function applyProfitSimulation({
  amount,
  profit,
  tierLevel,
}: ProfitSimulationInput) {
  const simulationAdjustment = getSimulationAdjustment({
    amount,
    tierLevel,
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
}: ProfitSimulationInput) {
  const rawProfit = toDecimal(profit).sub(
    getSimulationAdjustment({
      amount,
      tierLevel,
    }),
  );

  return rawProfit.greaterThan(0) ? rawProfit : ZERO_DECIMAL;
}
