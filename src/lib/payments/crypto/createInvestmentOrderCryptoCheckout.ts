import {
  Prisma,
  CryptoFundingIntentStatus,
  CryptoFundingProvider,
  InvestmentOrderStatus,
  InvestmentPaymentMethodType,
  PlatformPaymentMethodType,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { createBitPayInvoice, toBitPayInvoiceStatus } from "./bitPay";

type CreateInvestmentOrderCryptoCheckoutInput = {
  investmentOrderId: string;
  userId: string;
};

export type CreateInvestmentOrderCryptoCheckoutResult = {
  fundingIntentId: string;
  invoiceId: string;
  invoiceUrl: string;
  orderId: string;
  amount: string;
  currency: string;
};

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

export async function createInvestmentOrderCryptoCheckout({
  investmentOrderId,
  userId,
}: CreateInvestmentOrderCryptoCheckoutInput): Promise<CreateInvestmentOrderCryptoCheckoutResult> {
  const appUrl = assertEnv("NEXT_PUBLIC_APP_URL");

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: investmentOrderId,
      investorProfile: {
        userId,
      },
    },
    include: {
      investorProfile: {
        select: {
          id: true,
          userId: true,
        },
      },
      investmentPlan: {
        select: {
          id: true,
          name: true,
          investment: {
            select: {
              name: true,
            },
          },
        },
      },
      platformPaymentMethod: true,
      cryptoFundingIntents: {
        where: {
          status: {
            in: [
              CryptoFundingIntentStatus.PENDING,
              CryptoFundingIntentStatus.REQUIRES_ACTION,
              CryptoFundingIntentStatus.PROCESSING,
              CryptoFundingIntentStatus.AWAITING_PROVIDER_CONFIRMATION,
            ],
          },
          provider: CryptoFundingProvider.BITPAY,
        },
        select: {
          id: true,
          providerReference: true,
          bitpayInvoicePayment: {
            select: {
              invoiceUrl: true,
              bitpayInvoiceId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!order) {
    throw new Error("Investment order not found");
  }

  if (
    order.status === InvestmentOrderStatus.PAID ||
    order.status === InvestmentOrderStatus.CONFIRMED
  ) {
    throw new Error("This investment order has already been paid");
  }

  if (
    order.status === InvestmentOrderStatus.CANCELLED ||
    order.status === InvestmentOrderStatus.REJECTED
  ) {
    throw new Error("This investment order can no longer be paid");
  }

  if (order.paymentMethodType !== InvestmentPaymentMethodType.CRYPTO_PROVIDER) {
    throw new Error(
      "This investment order is not configured for crypto payment",
    );
  }

  if (!order.platformPaymentMethodId || !order.platformPaymentMethod) {
    throw new Error("No crypto payment method is configured for this order");
  }

  const platformPaymentMethod = order.platformPaymentMethod;

  if (platformPaymentMethod.type !== PlatformPaymentMethodType.WALLET_ADDRESS) {
    throw new Error(
      "Selected platform payment method is not a crypto payment method",
    );
  }

  if (!platformPaymentMethod.isActive) {
    throw new Error("Selected crypto payment method is inactive");
  }

  if (
    order.cryptoFundingIntents.length > 0 &&
    order.cryptoFundingIntents[0]?.bitpayInvoicePayment?.invoiceUrl &&
    order.cryptoFundingIntents[0]?.bitpayInvoicePayment?.bitpayInvoiceId
  ) {
    return {
      fundingIntentId: order.cryptoFundingIntents[0].id,
      invoiceId:
        order.cryptoFundingIntents[0].bitpayInvoicePayment.bitpayInvoiceId,
      invoiceUrl: order.cryptoFundingIntents[0].bitpayInvoicePayment.invoiceUrl,
      orderId: order.id,
      amount: order.amount.toString(),
      currency: order.currency,
    };
  }

  const remainingAmount = new Prisma.Decimal(order.amount).minus(
    order.amountPaid,
  );

  if (remainingAmount.lte(0)) {
    throw new Error("This order has no remaining balance to pay");
  }

  const cryptoAsset = platformPaymentMethod.cryptoAsset;
  const cryptoNetwork = platformPaymentMethod.cryptoNetwork;

  if (!cryptoAsset || !cryptoNetwork) {
    throw new Error(
      "Crypto asset or network is missing on the selected payment method",
    );
  }

  const internalReference = `inv_order_${order.id}_${Date.now()}`;
  const notificationURL = `${appUrl}/api/webhooks/bitpay`;
  const redirectURL = `${appUrl}/account/dashboard/user/investment-orders/${order.id}?payment=bitpay`;

  const itemDesc = `${order.investmentPlan.investment.name} - ${order.investmentPlan.name}`;

  const invoice = await createBitPayInvoice({
    price: remainingAmount.toString(),
    currency: order.currency,
    orderId: internalReference,
    itemDesc,
    notificationURL,
    redirectURL,
  });

  const created = await prisma.$transaction(async (tx) => {
    const fundingIntent = await tx.cryptoFundingIntent.create({
      data: {
        userId,
        investmentOrderId: order.id,
        provider: CryptoFundingProvider.BITPAY,
        asset: cryptoAsset,
        network: cryptoNetwork,
        fiatCurrency: order.currency,
        fiatAmount: remainingAmount,
        status: CryptoFundingIntentStatus.REQUIRES_ACTION,
        platformPaymentMethodId: order.platformPaymentMethodId,
        destinationReference: platformPaymentMethod.walletAddress,
        destinationLabel: platformPaymentMethod.label,
        providerReference: invoice.invoiceId,
        providerExternalId: invoice.invoiceId,
        redirectUrl: redirectURL,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        metadata: {
          internalReference,
          investmentPlanId: order.investmentPlanId,
          investmentPlanName: order.investmentPlan.name,
          investmentName: order.investmentPlan.investment.name,
        },
        bitpayInvoicePayment: {
          create: {
            bitpayInvoiceId: invoice.invoiceId,
            bitpayOrderId: invoice.orderId,
            bitpayToken: invoice.token,
            status: toBitPayInvoiceStatus(invoice.status),
            price: remainingAmount,
            currency: order.currency,
            cryptoAsset,
            cryptoNetwork,
            invoiceUrl: invoice.invoiceUrl,
            posData: invoice.posData,
            rawInvoiceSnapshot: invoice.raw as Prisma.InputJsonValue,
          },
        },
      },
      select: {
        id: true,
        bitpayInvoicePayment: {
          select: {
            bitpayInvoiceId: true,
            invoiceUrl: true,
          },
        },
      },
    });

    await tx.investmentOrder.update({
      where: { id: order.id },
      data: {
        lastPaymentSubmittedAt: new Date(),
        paymentReference: invoice.invoiceId,
        paymentMetadata: {
          provider: "BITPAY",
          fundingIntentId: fundingIntent.id,
          invoiceId: invoice.invoiceId,
        },
      },
    });

    return fundingIntent;
  });

  return {
    fundingIntentId: created.id,
    invoiceId: created.bitpayInvoicePayment!.bitpayInvoiceId,
    invoiceUrl: created.bitpayInvoicePayment!.invoiceUrl!,
    orderId: order.id,
    amount: remainingAmount.toString(),
    currency: order.currency,
  };
}
