import { InvestmentOrderStatus, Prisma } from "@/generated/prisma";

import { decimalToNumber, toDecimal, ZERO_DECIMAL } from "@/lib/services/investment/decimal";
import { computeInvestmentOrderRecognizedProfit } from "@/lib/services/investment/valuationService";

export type InvestmentBalanceOrderInput = {
  amount: Prisma.Decimal | number | string;
  amountPaid: Prisma.Decimal | number | string;
  accruedProfit?: Prisma.Decimal | number | string | null;
  investmentModel: "FIXED" | "MARKET" | string;
  units?: Prisma.Decimal | number | string | null;
  currentValue?: Prisma.Decimal | number | string | null;
  investmentEarnings?: Array<{
    amount: Prisma.Decimal | number | string;
  }>;
  investmentPlan?: {
    name: string;
    investment?: {
      name: string;
      type: string;
      symbol: string | null;
    };
  };
  status: InvestmentOrderStatus | string;
};

export function isActiveInvestmentBalanceOrder(
  order: Pick<InvestmentBalanceOrderInput, "status">,
) {
  return (
    order.status === InvestmentOrderStatus.PAID ||
    order.status === InvestmentOrderStatus.CONFIRMED
  );
}

export function calculateInvestmentAccountBalance(
  orders: InvestmentBalanceOrderInput[],
) {
  const activeOrders = orders.filter(isActiveInvestmentBalanceOrder);

  const totalPrincipal = activeOrders.reduce(
    (sum, order) => sum.add(toDecimal(order.amountPaid)),
    ZERO_DECIMAL,
  );

  const totalEarnedProfits = activeOrders.reduce(
    (sum, order) => sum.add(computeInvestmentOrderRecognizedProfit(order)),
    ZERO_DECIMAL,
  );

  const accountBalance = totalPrincipal.add(totalEarnedProfits);

  return {
    activeOrders,
    totalPrincipal,
    totalEarnedProfits,
    accountBalance,
    totalPrincipalNumber: decimalToNumber(totalPrincipal),
    totalEarnedProfitsNumber: decimalToNumber(totalEarnedProfits),
    accountBalanceNumber: decimalToNumber(accountBalance),
  };
}
