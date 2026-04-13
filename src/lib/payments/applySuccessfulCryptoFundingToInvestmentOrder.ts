import {
  CryptoFundingIntentStatus,
  InvestmentOrderStatus,
  Prisma,
  PrismaClient,
} from "@/generated/prisma";

type TxClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

type ApplySuccessfulCryptoFundingToInvestmentOrderInput = {
  fundingIntentId: string;
  providerReference: string;
  creditedFiatAmount: Prisma.Decimal | string | number;
  receivedCryptoAmount?: Prisma.Decimal | string | number | null;
  creditedAt?: Date;
};

export async function applySuccessfulCryptoFundingToInvestmentOrder(
  tx: TxClient,
  {
    fundingIntentId,
    providerReference,
    creditedFiatAmount,
    receivedCryptoAmount,
    creditedAt,
  }: ApplySuccessfulCryptoFundingToInvestmentOrderInput,
) {
  const fundingIntent = await tx.cryptoFundingIntent.findUnique({
    where: { id: fundingIntentId },
    include: {
      investmentOrder: true,
    },
  });

  if (!fundingIntent) {
    throw new Error("Crypto funding intent not found");
  }

  const creditedAmountDecimal = new Prisma.Decimal(creditedFiatAmount);

  if (creditedAmountDecimal.lte(0)) {
    throw new Error("Credited fiat amount must be greater than zero");
  }

  if (
    fundingIntent.status === CryptoFundingIntentStatus.FUNDED &&
    fundingIntent.creditedAt
  ) {
    return {
      fundingIntent,
      investmentOrder: fundingIntent.investmentOrder,
      alreadyApplied: true,
      isFullyPaid: new Prisma.Decimal(
        fundingIntent.investmentOrder.amountPaid,
      ).gte(fundingIntent.investmentOrder.amount),
    };
  }

  const currentAmountPaid = new Prisma.Decimal(
    fundingIntent.investmentOrder.amountPaid,
  );
  const orderAmount = new Prisma.Decimal(fundingIntent.investmentOrder.amount);

  const newAmountPaid = currentAmountPaid.plus(creditedAmountDecimal);
  const isFullyPaid = newAmountPaid.gte(orderAmount);

  const updatedFundingIntent = await tx.cryptoFundingIntent.update({
    where: { id: fundingIntent.id },
    data: {
      status: CryptoFundingIntentStatus.FUNDED,
      providerReference,
      fundedAt: fundingIntent.fundedAt ?? creditedAt ?? new Date(),
      creditedAt: fundingIntent.creditedAt ?? creditedAt ?? new Date(),
      creditedFiatAmount: creditedAmountDecimal,
      receivedCryptoAmount:
        receivedCryptoAmount !== undefined && receivedCryptoAmount !== null
          ? new Prisma.Decimal(receivedCryptoAmount)
          : fundingIntent.receivedCryptoAmount,
      failureCode: null,
      failureMessage: null,
    },
  });

  const existingPaymentMetadata =
    fundingIntent.investmentOrder.paymentMetadata &&
    typeof fundingIntent.investmentOrder.paymentMetadata === "object" &&
    !Array.isArray(fundingIntent.investmentOrder.paymentMetadata)
      ? (fundingIntent.investmentOrder.paymentMetadata as Record<
          string,
          unknown
        >)
      : {};

  const updatedInvestmentOrder = await tx.investmentOrder.update({
    where: { id: fundingIntent.investmentOrderId },
    data: {
      amountPaid: newAmountPaid,
      status: isFullyPaid
        ? InvestmentOrderStatus.PAID
        : InvestmentOrderStatus.PARTIALLY_PAID,
      paymentReference: providerReference,
      paidAt: isFullyPaid
        ? (fundingIntent.investmentOrder.paidAt ?? creditedAt ?? new Date())
        : fundingIntent.investmentOrder.paidAt,
      paymentMetadata: {
        ...existingPaymentMetadata,
        provider: fundingIntent.provider,
        providerReference,
        fundingIntentId: fundingIntent.id,
        creditedFiatAmount: creditedAmountDecimal.toString(),
        asset: fundingIntent.asset,
        network: fundingIntent.network,
        creditedAt: (creditedAt ?? new Date()).toISOString(),
      },
    },
  });

  return {
    fundingIntent: updatedFundingIntent,
    investmentOrder: updatedInvestmentOrder,
    alreadyApplied: false,
    isFullyPaid,
  };
}
