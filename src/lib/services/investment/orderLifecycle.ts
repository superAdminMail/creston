export type InvestmentOrderLifecycleSchedule = {
  startDate: Date;
  maturityDate: Date;
};

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function resolveInvestmentOrderSchedule(
  currentStartDate: Date | null | undefined,
  currentMaturityDate: Date | null | undefined,
  durationDays: number,
  anchorDate = new Date(),
): InvestmentOrderLifecycleSchedule {
  const startDate = currentStartDate ?? anchorDate;
  const maturityDate =
    currentMaturityDate ?? addDays(startDate, Math.max(durationDays, 0));

  return {
    startDate,
    maturityDate,
  };
}
