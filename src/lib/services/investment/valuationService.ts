import { Prisma } from "@/generated/prisma";

import { toDecimal, ZERO_DECIMAL } from "@/lib/services/investment/decimal";

export type InvestmentOrderProfitInput = {
  accruedProfit?: Prisma.Decimal | number | string | null;
  investmentEarnings?: Array<{
    amount: Prisma.Decimal | number | string;
  }>;
};

export type InvestmentOrderValuationInput = InvestmentOrderProfitInput & {
  investmentModel: "FIXED" | "MARKET";
  amount: Prisma.Decimal | number | string;
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

export function computeInvestmentOrderRecognizedProfit(
  order: InvestmentOrderProfitInput,
) {
  const accruedProfit = toDecimal(order.accruedProfit);

  if (accruedProfit.greaterThan(0)) {
    return accruedProfit;
  }

  if (order.investmentEarnings?.length) {
    const earningsProfit = order.investmentEarnings.reduce(
      (sum, earning) => sum.add(toDecimal(earning.amount)),
      ZERO_DECIMAL,
    );

    if (earningsProfit.greaterThan(0)) {
      return earningsProfit;
    }
  }

  return ZERO_DECIMAL;
}
