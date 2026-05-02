import {
  Prisma,
  SavingsFundingIntentStatus,
  SavingsStatus,
  SavingsTransactionType,
} from "@/generated/prisma";
import {
  asJsonObject,
  pickNonEmptyString,
  toJsonValue,
} from "@/lib/payments/paymentJson";

type TxClient = Prisma.TransactionClient;

type ApplySuccessfulCryptoFundingToSavingsAccountInput = {
  fundingIntentId: string;
  providerReference: string;
  creditedFiatAmount: Prisma.Decimal | string | number;
  creditedAt?: Date;
};

export async function applySuccessfulCryptoFundingToSavingsAccount(
  tx: TxClient,
  {
    fundingIntentId,
    providerReference,
    creditedFiatAmount,
    creditedAt,
  }: ApplySuccessfulCryptoFundingToSavingsAccountInput,
) {
  const fundingIntent = await tx.savingsFundingIntent.findUnique({
    where: { id: fundingIntentId },
    include: {
      savingsAccount: {
        include: {
          savingsProduct: {
            select: {
              maxBalance: true,
            },
          },
        },
      },
    },
  });

  if (!fundingIntent) {
    throw new Error("Savings funding intent not found");
  }

  const creditedAmountDecimal = new Prisma.Decimal(creditedFiatAmount);

  if (creditedAmountDecimal.lte(0)) {
    throw new Error("Credited fiat amount must be greater than zero");
  }

  if (
    fundingIntent.status === SavingsFundingIntentStatus.CREDITED &&
    fundingIntent.creditedAt
  ) {
    return {
      fundingIntent,
      savingsAccount: fundingIntent.savingsAccount,
      alreadyApplied: true,
    };
  }

  const currentBalance = new Prisma.Decimal(fundingIntent.savingsAccount.balance);
  const maxBalance = fundingIntent.savingsAccount.savingsProduct.maxBalance
    ? new Prisma.Decimal(fundingIntent.savingsAccount.savingsProduct.maxBalance)
    : null;
  const newBalance = currentBalance.plus(creditedAmountDecimal);

  if (maxBalance && newBalance.gt(maxBalance)) {
    throw new Error(
      "Savings account balance would exceed the configured maximum",
    );
  }

  const nextTimestamp = creditedAt ?? new Date();
  const existingMetadata = asJsonObject(fundingIntent.metadata);
  const updatedFundingAmount = new Prisma.Decimal(
    fundingIntent.creditedAmount,
  ).plus(creditedAmountDecimal);
  const paymentReference = pickNonEmptyString(providerReference) ?? fundingIntent.id;

  const updatedFundingIntent = await tx.savingsFundingIntent.update({
    where: { id: fundingIntent.id },
    data: {
      status: SavingsFundingIntentStatus.CREDITED,
      providerReference: paymentReference,
      providerExternalId: pickNonEmptyString(providerReference),
      paymentReference,
      paidAt: fundingIntent.paidAt ?? nextTimestamp,
      creditedAt: fundingIntent.creditedAt ?? nextTimestamp,
      creditedAmount: updatedFundingAmount,
      failureCode: null,
      failureMessage: null,
      metadata: toJsonValue({
        ...existingMetadata,
        providerReference,
        creditedFiatAmount: creditedAmountDecimal.toString(),
        creditedAt: nextTimestamp.toISOString(),
        lastWebhookAt: nextTimestamp.toISOString(),
      }),
    },
  });

  const updatedSavingsAccount = await tx.savingsAccount.update({
    where: { id: fundingIntent.savingsAccountId },
    data: {
      balance: newBalance,
      status: SavingsStatus.ACTIVE,
    },
  });

  const transaction = await tx.savingsTransaction.create({
    data: {
      savingsAccountId: fundingIntent.savingsAccountId,
      savingsFundingIntentId: fundingIntent.id,
      type: SavingsTransactionType.DEPOSIT,
      amount: creditedAmountDecimal,
      currency: fundingIntent.currency,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      reference: paymentReference,
      note: "Paymento crypto funding credited",
      metadata: toJsonValue({
        provider: fundingIntent.provider,
        providerReference: paymentReference,
        fundingIntentId: fundingIntent.id,
        creditedFiatAmount: creditedAmountDecimal.toString(),
      }),
    },
  });

  return {
    fundingIntent: updatedFundingIntent,
    savingsAccount: updatedSavingsAccount,
    transaction,
    alreadyApplied: false,
  };
}
