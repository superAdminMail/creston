import { Prisma } from "@/generated/prisma";

import { toDecimal } from "@/lib/services/investment/decimal";

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
  const startDate = currentStartDate ?? now;
  const maturityDate =
    currentMaturityDate ?? addDays(startDate, Math.max(durationDays, 0));

  return {
    startDate,
    maturityDate,
  };
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
