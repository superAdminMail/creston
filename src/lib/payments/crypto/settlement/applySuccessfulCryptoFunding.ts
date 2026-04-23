import {
  CryptoFundingIntentStatus,
  CryptoFundingProvider,
  InvestmentOrderPaymentStatus,
  InvestmentOrderPaymentType,
  InvestmentOrderStatus,
  Prisma,
  SavingsFundingIntentStatus,
  SavingsStatus,
  SavingsTransactionType,
} from "@/generated/prisma";

type Tx = Prisma.TransactionClient;

type PaymentoVerifiedLike = Record<string, unknown> | null | undefined;

type ApplySuccessfulCryptoFundingInput = {
  tx: Tx;
  provider: CryptoFundingProvider;
  providerSessionId: string;
  providerExternalId?: string | null;
  providerReference?: string | null;
  callbackPayload?: unknown;
  verifiedPayload?: PaymentoVerifiedLike;
  statusCode?: string | null;
  processedAt?: Date;
};

type ApplySuccessfulCryptoFundingResult =
  | {
      targetType: "INVESTMENT_ORDER";
      fundingIntentId: string;
      targetId: string;
      orderStatus: InvestmentOrderStatus;
      creditedAmount: string;
    }
  | {
      targetType: "SAVINGS_FUNDING";
      fundingIntentId: string;
      targetId: string;
      fundingStatus: SavingsFundingIntentStatus;
      creditedAmount: string;
    };

function asObject(
  value: Prisma.JsonValue | null | undefined,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function toNullableJsonValue(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

function minDecimal(
  first: Prisma.Decimal,
  second: Prisma.Decimal | null,
): Prisma.Decimal {
  if (!second || first.lte(second)) {
    return first;
  }

  return second;
}

function clampToUpperBound(
  value: Prisma.Decimal,
  upperBound: Prisma.Decimal | null,
): Prisma.Decimal {
  if (!upperBound || value.lte(upperBound)) {
    return value;
  }

  return upperBound;
}

async function applyInvestmentCryptoFunding({
  tx,
  fundingIntent,
  providerExternalId,
  providerReference,
  callbackPayload,
  verifiedPayload,
  statusCode,
  processedAt,
}: {
  tx: Tx;
  fundingIntent: {
    id: string;
    userId: string;
    investmentOrderId: string;
    platformPaymentMethodId: string | null;
    fiatAmount: Prisma.Decimal;
    fiatCurrency: string;
    metadata: Prisma.JsonValue | null;
    creditedFiatAmount: Prisma.Decimal | null;
    fundedAt: Date | null;
    failedAt: Date | null;
    canceledAt: Date | null;
    providerExternalId: string | null;
  };
  providerExternalId?: string | null;
  providerReference?: string | null;
  callbackPayload?: unknown;
  verifiedPayload?: PaymentoVerifiedLike;
  statusCode?: string | null;
  processedAt: Date;
}): Promise<ApplySuccessfulCryptoFundingResult> {
  const order = await tx.investmentOrder.findUnique({
    where: { id: fundingIntent.investmentOrderId },
    select: {
      id: true,
      amount: true,
      amountPaid: true,
      status: true,
      paymentMetadata: true,
      paidAt: true,
      confirmedAt: true,
    },
  });

  if (!order) {
    throw new Error("Investment order not found for crypto funding settlement");
  }

  if (
    fundingIntent.fundedAt ||
    order.status === InvestmentOrderStatus.PAID ||
    order.status === InvestmentOrderStatus.CONFIRMED
  ) {
    return {
      targetType: "INVESTMENT_ORDER",
      fundingIntentId: fundingIntent.id,
      targetId: order.id,
      orderStatus: order.status,
      creditedAmount: (
        fundingIntent.creditedFiatAmount ?? fundingIntent.fiatAmount
      ).toString(),
    };
  }

  const orderAmount = new Prisma.Decimal(order.amount);
  const currentAmountPaid = new Prisma.Decimal(order.amountPaid);
  const remaining = orderAmount.minus(currentAmountPaid);

  if (remaining.lte(0)) {
    throw new Error("Investment order has no remaining payable balance");
  }

  const creditedAmount = new Prisma.Decimal(
    fundingIntent.creditedFiatAmount ?? fundingIntent.fiatAmount,
  );

  if (creditedAmount.lte(0)) {
    throw new Error("Invalid credited amount for investment crypto funding");
  }

  const safeCreditedAmount = clampToUpperBound(creditedAmount, remaining);
  const newAmountPaid = currentAmountPaid.plus(safeCreditedAmount);

  const existingOrderPaymentMetadata = asObject(order.paymentMetadata);
  const existingFundingMetadata = asObject(fundingIntent.metadata);

  await tx.cryptoFundingIntent.update({
    where: { id: fundingIntent.id },
    data: {
      status: CryptoFundingIntentStatus.FUNDED,
      providerExternalId:
        providerExternalId ?? fundingIntent.providerExternalId,
      providerReference: providerReference ?? fundingIntent.id,
      creditedFiatAmount: safeCreditedAmount,
      fundedAt: processedAt,
      failedAt: null,
      canceledAt: null,
      metadata: toNullableJsonValue({
        ...existingFundingMetadata,
        lastCallback: callbackPayload,
        lastVerify: verifiedPayload,
        lastWebhookAt: processedAt.toISOString(),
        callbackStatus: statusCode,
        settlementTarget: "INVESTMENT_ORDER",
      }),
    },
  });

  const existingApprovedPayment = await tx.investmentOrderPayment.findFirst({
    where: {
      investmentOrderId: order.id,
      type: InvestmentOrderPaymentType.CRYPTO_PROVIDER,
      providerReference:
        providerExternalId ?? providerReference ?? fundingIntent.id,
      status: InvestmentOrderPaymentStatus.APPROVED,
    },
    select: { id: true },
  });

  if (!existingApprovedPayment) {
    await tx.investmentOrderPayment.create({
      data: {
        investmentOrderId: order.id,
        type: InvestmentOrderPaymentType.CRYPTO_PROVIDER,
        status: InvestmentOrderPaymentStatus.APPROVED,
        platformPaymentMethodId: fundingIntent.platformPaymentMethodId,
        submittedByUserId: fundingIntent.userId,
        claimedAmount: safeCreditedAmount,
        approvedAmount: safeCreditedAmount,
        currency: fundingIntent.fiatCurrency,
        providerReference:
          providerExternalId ?? providerReference ?? fundingIntent.id,
        providerPayload: toJsonValue({
          callback: callbackPayload,
          verify: verifiedPayload,
        }),
        submittedAt: fundingIntent.fundedAt ?? processedAt,
        reviewedAt: processedAt,
      },
    });
  }

  await tx.investmentOrder.update({
    where: { id: order.id },
    data: {
      paymentMethodType: "CRYPTO_PROVIDER",
      status: InvestmentOrderStatus.PAID,
      amountPaid: newAmountPaid,
      paymentReference:
        providerExternalId ?? providerReference ?? fundingIntent.id,
      paidAt: order.paidAt ?? processedAt,
      confirmedAt: order.confirmedAt ?? processedAt,
      lastPaymentSubmittedAt: processedAt,
      lastPaymentReviewedAt: processedAt,
      paymentMetadata: toNullableJsonValue({
        ...existingOrderPaymentMetadata,
        provider: "PAYMENTO",
        providerSessionId: fundingIntent.id,
        paymentId: providerExternalId,
        callbackStatus: statusCode,
        verified: true,
        creditedAmount: safeCreditedAmount.toString(),
        lastWebhookAt: processedAt.toISOString(),
      }),
    },
  });

  await tx.notification.create({
    data: {
      userId: fundingIntent.userId,
      title: "Investment payment confirmed",
      message: "Your crypto payment was confirmed successfully.",
      type: "INVESTMENT_PAYMENT_CONFIRMED",
      link: `/account/dashboard/user/investment-orders/${order.id}`,
      key: `investment-payment-confirmed:${order.id}:${providerExternalId ?? providerReference ?? fundingIntent.id}`,
      metadata: toNullableJsonValue({
        investmentOrderId: order.id,
        fundingIntentId: fundingIntent.id,
        provider: "PAYMENTO",
        creditedAmount: safeCreditedAmount.toString(),
      }),
    },
  });

  return {
    targetType: "INVESTMENT_ORDER",
    fundingIntentId: fundingIntent.id,
    targetId: order.id,
    orderStatus: InvestmentOrderStatus.PAID,
    creditedAmount: safeCreditedAmount.toString(),
  };
}

async function applySavingsCryptoFunding({
  tx,
  fundingIntent,
  providerExternalId,
  providerReference,
  callbackPayload,
  verifiedPayload,
  statusCode,
  processedAt,
}: {
  tx: Tx;
  fundingIntent: {
    id: string;
    savingsAccountId: string;
    userId: string;
    currency: string;
    targetAmount: Prisma.Decimal;
    creditedAmount: Prisma.Decimal;
    status: SavingsFundingIntentStatus;
    metadata: Prisma.JsonValue | null;
    providerExternalId: string | null;
    savingsAccount: {
      balance: Prisma.Decimal;
      metadata: Prisma.JsonValue | null;
      targetAmount: Prisma.Decimal | null;
      savingsProduct: {
        maxBalance: Prisma.Decimal | null;
      };
    };
  };
  providerExternalId?: string | null;
  providerReference?: string | null;
  callbackPayload?: unknown;
  verifiedPayload?: PaymentoVerifiedLike;
  statusCode?: string | null;
  processedAt: Date;
}): Promise<ApplySuccessfulCryptoFundingResult> {
  if (
    fundingIntent.status === SavingsFundingIntentStatus.CREDITED ||
    fundingIntent.status === SavingsFundingIntentStatus.PAID
  ) {
    return {
      targetType: "SAVINGS_FUNDING",
      fundingIntentId: fundingIntent.id,
      targetId: fundingIntent.savingsAccountId,
      fundingStatus: fundingIntent.status,
      creditedAmount: fundingIntent.creditedAmount.toString(),
    };
  }

  const creditedAmount = new Prisma.Decimal(fundingIntent.targetAmount);

  if (creditedAmount.lte(0)) {
    throw new Error("Invalid credited amount for savings crypto funding");
  }

  const currentBalance = new Prisma.Decimal(fundingIntent.savingsAccount.balance);
  const maxBalance = fundingIntent.savingsAccount.savingsProduct.maxBalance
    ? new Prisma.Decimal(fundingIntent.savingsAccount.savingsProduct.maxBalance)
    : null;
  const targetAmount = fundingIntent.savingsAccount.targetAmount
    ? new Prisma.Decimal(fundingIntent.savingsAccount.targetAmount)
    : null;
  const remainingToMaxBalance = maxBalance
    ? maxBalance.minus(currentBalance)
    : null;
  const remainingToTargetAmount = targetAmount
    ? targetAmount.minus(currentBalance)
    : null;
  if (
    (remainingToTargetAmount !== null && remainingToTargetAmount.lte(0)) ||
    (remainingToMaxBalance !== null && remainingToMaxBalance.lte(0))
  ) {
    throw new Error("Savings account has no remaining payable balance");
  }
  const upperBound = minDecimal(
    remainingToTargetAmount ?? remainingToMaxBalance ?? creditedAmount,
    remainingToMaxBalance,
  );
  const safeCreditedAmount = clampToUpperBound(creditedAmount, upperBound);
  if (safeCreditedAmount.lte(0)) {
    throw new Error("Invalid credited amount for savings crypto funding");
  }
  const newBalance = currentBalance.plus(safeCreditedAmount);

  const existingFundingMetadata = asObject(fundingIntent.metadata);
  const existingAccountMetadata = asObject(fundingIntent.savingsAccount.metadata);

  await tx.savingsFundingIntent.update({
    where: { id: fundingIntent.id },
    data: {
      status: SavingsFundingIntentStatus.CREDITED,
      providerExternalId:
        providerExternalId ?? fundingIntent.providerExternalId,
      providerReference: providerReference ?? fundingIntent.id,
      creditedAmount: safeCreditedAmount,
      paidAt: processedAt,
      creditedAt: processedAt,
      failedAt: null,
      cancelledAt: null,
      metadata: toNullableJsonValue({
        ...existingFundingMetadata,
        lastCallback: callbackPayload,
        lastVerify: verifiedPayload,
        lastWebhookAt: processedAt.toISOString(),
        callbackStatus: statusCode,
        settlementTarget: "SAVINGS_FUNDING",
      }),
    },
  });

  await tx.savingsAccount.update({
    where: { id: fundingIntent.savingsAccountId },
    data: {
      balance: newBalance,
      status: SavingsStatus.ACTIVE,
      metadata: toNullableJsonValue({
        ...existingAccountMetadata,
        lastCryptoFundingIntentId: fundingIntent.id,
        lastCryptoFundingAt: processedAt.toISOString(),
        lastCryptoProvider: "PAYMENTO",
      }),
    },
  });

  await tx.savingsTransaction.create({
    data: {
      savingsAccountId: fundingIntent.savingsAccountId,
      savingsFundingIntentId: fundingIntent.id,
      type: SavingsTransactionType.DEPOSIT,
      amount: safeCreditedAmount,
      currency: fundingIntent.currency,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      reference: providerExternalId ?? providerReference ?? fundingIntent.id,
      note: "Crypto funding credited via PAYMENTO",
      metadata: toNullableJsonValue({
        callback: callbackPayload,
        verify: verifiedPayload,
        provider: "PAYMENTO",
      }),
    },
  });

  return {
    targetType: "SAVINGS_FUNDING",
    fundingIntentId: fundingIntent.id,
    targetId: fundingIntent.savingsAccountId,
    fundingStatus: SavingsFundingIntentStatus.CREDITED,
    creditedAmount: safeCreditedAmount.toString(),
  };
}

export async function applySuccessfulCryptoFunding({
  tx,
  provider,
  providerSessionId,
  providerExternalId,
  providerReference,
  callbackPayload,
  verifiedPayload,
  statusCode,
  processedAt = new Date(),
}: ApplySuccessfulCryptoFundingInput): Promise<ApplySuccessfulCryptoFundingResult> {
  const investmentFundingIntent = await tx.cryptoFundingIntent.findFirst({
    where: {
      provider,
      providerSessionId,
    },
    select: {
      id: true,
      userId: true,
      investmentOrderId: true,
      platformPaymentMethodId: true,
      fiatAmount: true,
      fiatCurrency: true,
      metadata: true,
      creditedFiatAmount: true,
      fundedAt: true,
      failedAt: true,
      canceledAt: true,
      providerExternalId: true,
    },
  });

  if (investmentFundingIntent) {
    return applyInvestmentCryptoFunding({
      tx,
      fundingIntent: investmentFundingIntent,
      providerExternalId,
      providerReference,
      callbackPayload,
      verifiedPayload,
      statusCode,
      processedAt,
    });
  }

  const savingsFundingIntent = await tx.savingsFundingIntent.findFirst({
    where: {
      provider,
      providerSessionId,
    },
    select: {
      id: true,
      savingsAccountId: true,
      userId: true,
      currency: true,
      targetAmount: true,
      creditedAmount: true,
      status: true,
      metadata: true,
      providerExternalId: true,
      savingsAccount: {
        select: {
          balance: true,
          metadata: true,
          targetAmount: true,
          savingsProduct: {
            select: {
              maxBalance: true,
            },
          },
        },
      },
    },
  });

  if (savingsFundingIntent) {
    return applySavingsCryptoFunding({
      tx,
      fundingIntent: savingsFundingIntent,
      providerExternalId,
      providerReference,
      callbackPayload,
      verifiedPayload,
      statusCode,
      processedAt,
    });
  }

  throw new Error(
    "No matching crypto funding target found for provider session",
  );
}
