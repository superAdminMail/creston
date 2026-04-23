import { Prisma } from "@/generated/prisma";

type CalculateInvestmentOrderBankChargeAmountInput = {
  totalAmount: Prisma.Decimal | string | number;
  amountPaid: Prisma.Decimal | string | number;
  usePartialPayment: boolean;
  hasPendingSubmission: boolean;
};

export type CalculateInvestmentOrderBankChargeAmountResult = {
  chargeAmount: Prisma.Decimal;
  remainingBeforeCharge: Prisma.Decimal;
  isPartialPayment: boolean;
  splitNumber: 1 | 2 | null;
};

export function calculateInvestmentOrderBankChargeAmount({
  totalAmount,
  amountPaid,
  usePartialPayment,
  hasPendingSubmission: _hasPendingSubmission,
}: CalculateInvestmentOrderBankChargeAmountInput): CalculateInvestmentOrderBankChargeAmountResult {
  const total = new Prisma.Decimal(totalAmount);
  const paid = new Prisma.Decimal(amountPaid);
  void _hasPendingSubmission;

  if (total.lte(0)) {
    throw new Error("Investment order amount must be greater than zero");
  }

  if (paid.lt(0)) {
    throw new Error("Amount paid cannot be negative");
  }

  if (paid.gte(total)) {
    throw new Error("This investment order has already been fully paid");
  }

  const remaining = total.minus(paid);

  if (!usePartialPayment) {
    return {
      chargeAmount: remaining,
      remainingBeforeCharge: remaining,
      isPartialPayment: false,
      splitNumber: null,
    };
  }

  // First partial payment = half of the total order amount
  if (paid.eq(0)) {
    const half = total
      .dividedBy(2)
      .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

    if (half.lte(0)) {
      throw new Error("Unable to calculate the first partial payment amount");
    }

    return {
      chargeAmount: half,
      remainingBeforeCharge: remaining,
      isPartialPayment: true,
      splitNumber: 1,
    };
  }

  // Second payment = whatever remains
  if (paid.gt(0) && paid.lt(total)) {
    return {
      chargeAmount: remaining,
      remainingBeforeCharge: remaining,
      isPartialPayment: true,
      splitNumber: 2,
    };
  }

  throw new Error("Partial payment is no longer available for this order");
}
