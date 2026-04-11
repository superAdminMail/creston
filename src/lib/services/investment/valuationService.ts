import { Prisma } from "@/generated/prisma";

import { toDecimal } from "@/lib/services/investment/decimal";

export type InvestmentOrderValuationInput = {
  investmentModel: "FIXED" | "MARKET";
  amount: Prisma.Decimal | number | string;
  accruedProfit?: Prisma.Decimal | number | string | null;
  units?: Prisma.Decimal | number | string | null;
  currentValue?: Prisma.Decimal | number | string | null;
};

export function computeInvestmentOrderCurrentValue(
  order: InvestmentOrderValuationInput,
  currentPrice?: Prisma.Decimal | number | string | null,
) {
  const principal = toDecimal(order.amount);

  if (order.investmentModel === "FIXED") {
    return principal.add(toDecimal(order.accruedProfit));
  }

  const units = toDecimal(order.units);

  if (!units.greaterThan(0)) {
    return toDecimal(order.currentValue).greaterThan(0)
      ? toDecimal(order.currentValue)
      : principal;
  }

  const marketPrice = toDecimal(currentPrice);

  if (marketPrice.greaterThan(0)) {
    return units.mul(marketPrice);
  }

  return toDecimal(order.currentValue).greaterThan(0)
    ? toDecimal(order.currentValue)
    : principal;
}
