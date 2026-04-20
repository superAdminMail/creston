import { Prisma, CryptoFundingIntentStatus } from "@/generated/prisma";

type CalculateInvestmentOrderCryptoChargeAmountInput = {
  totalAmount: Prisma.Decimal | string | number;
  amountPaid: Prisma.Decimal | string | number;
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
  return {
    chargeAmount: remaining,
    remainingBeforeCharge: remaining,
    isPartialPayment: false,
    splitNumber: null,
  };
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
