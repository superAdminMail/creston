import { Prisma } from "@/generated/prisma";

import { toDecimal } from "@/lib/services/investment/decimal";
import { resolveInvestmentOrderSchedule } from "@/lib/services/investment/orderLifecycle";

export function calculateFixedExpectedReturn(
  amount: Prisma.Decimal | number | string,
  fixedRoiPercent: Prisma.Decimal | number | string | null | undefined,
) {
  const roiPercent = toDecimal(fixedRoiPercent);

  if (!roiPercent.greaterThan(0)) {
    return null;
  }

  return toDecimal(amount).mul(roiPercent).div(100);
}

export function resolveFixedOrderSchedule(
  currentStartDate: Date | null | undefined,
  currentMaturityDate: Date | null | undefined,
  durationDays: number,
  now = new Date(),
) {
  return resolveInvestmentOrderSchedule(
    currentStartDate,
    currentMaturityDate,
    durationDays,
    now,
  );
}
