import { Prisma, CryptoFundingIntentStatus } from "@/generated/prisma";

type CalculateInvestmentOrderCryptoChargeAmountInput = {
  totalAmount: Prisma.Decimal | string | number;
  amountPaid: Prisma.Decimal | string | number;
  usePartialPayment: boolean;
  hasActiveCryptoIntent: boolean;
};

export type CalculateInvestmentOrderCryptoChargeAmountResult = {
  chargeAmount: Prisma.Decimal;
  remainingBeforeCharge: Prisma.Decimal;
  isPartialPayment: boolean;
  splitNumber: 1 | 2 | null;
};

export function calculateInvestmentOrderCryptoChargeAmount({
  totalAmount,
  amountPaid,
  usePartialPayment,
  hasActiveCryptoIntent,
}: CalculateInvestmentOrderCryptoChargeAmountInput): CalculateInvestmentOrderCryptoChargeAmountResult {
  const total = new Prisma.Decimal(totalAmount);
  const paid = new Prisma.Decimal(amountPaid);

  if (total.lte(0)) {
    throw new Error("Investment order amount must be greater than zero");
  }

  if (paid.lt(0)) {
    throw new Error("Amount paid cannot be negative");
  }

  if (paid.gte(total)) {
    throw new Error("This investment order has already been fully paid");
  }

  if (hasActiveCryptoIntent) {
    throw new Error(
      "There is already an active crypto payment session for this order",
    );
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

export function isActiveCryptoFundingIntentStatus(
  status: CryptoFundingIntentStatus,
): boolean {
  const activeStatuses: CryptoFundingIntentStatus[] = [
    CryptoFundingIntentStatus.PENDING,
    CryptoFundingIntentStatus.REQUIRES_ACTION,
    CryptoFundingIntentStatus.PROCESSING,
    CryptoFundingIntentStatus.AWAITING_PROVIDER_CONFIRMATION,
  ];

  return activeStatuses.includes(status);
}
