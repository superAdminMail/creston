import { Prisma } from "@/generated/prisma";

import { calculateInvestmentOrderBankChargeAmount } from "@/lib/payments/bank/calculateInvestmentOrderBankChargeAmount";
import { calculateInvestmentOrderCryptoChargeAmount } from "@/lib/payments/crypto/calculateInvestmentOrderCryptoChargeAmount";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";

type CalculateSavingsFundingChargeAmountInput = {
  totalAmount: Prisma.Decimal | string | number;
  amountPaid: Prisma.Decimal | string | number;
  usePartialPayment: boolean;
  fundingMethodType: CheckoutFundingMethodType;
  hasPendingSubmission: boolean;
  hasActiveCryptoIntent: boolean;
};

export type CalculateSavingsFundingChargeAmountResult = {
  chargeAmount: Prisma.Decimal;
  remainingBeforeCharge: Prisma.Decimal;
  isPartialPayment: boolean;
  splitNumber: 1 | 2 | null;
};

export function calculateSavingsFundingChargeAmount({
  totalAmount,
  amountPaid,
  usePartialPayment,
  fundingMethodType,
  hasPendingSubmission,
  hasActiveCryptoIntent,
}: CalculateSavingsFundingChargeAmountInput): CalculateSavingsFundingChargeAmountResult {
  if (fundingMethodType === "CRYPTO_PROVIDER") {
    return calculateInvestmentOrderCryptoChargeAmount({
      totalAmount,
      amountPaid,
      hasActiveCryptoIntent,
    });
  }

  return calculateInvestmentOrderBankChargeAmount({
    totalAmount,
    amountPaid,
    usePartialPayment,
    hasPendingSubmission,
  });
}
