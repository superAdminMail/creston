import {
  Prisma,
  CryptoFundingIntentStatus,
  CryptoFundingProvider,
  InvestmentOrderStatus,
  InvestmentPaymentMethodType,
  PlatformPaymentMethodType,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

type CreateInvestmentOrderCryptoCheckoutInput = {
  investmentOrderId: string;
  userId: string;
};

type BitPayInvoiceCreateResult = {
  invoiceId: string;
  invoiceUrl: string;
  status: "new" | "paid" | "confirmed" | "complete" | "expired" | "invalid";
  price: string;
  currency: string;
  token?: string | null;
  orderId?: string | null;
  posData?: string | null;
  raw: unknown;
};

export type CreateInvestmentOrderCryptoCheckoutResult = {
  fundingIntentId: string;
  invoiceId: string;
  invoiceUrl: string;
  orderId: string;
  amount: string;
  currency: string;
};

function toBitPayStatus(
  value: string | null | undefined,
): "NEW" | "PAID" | "CONFIRMED" | "COMPLETE" | "EXPIRED" | "INVALID" {
  switch ((value ?? "").toLowerCase()) {
    case "new":
      return "NEW";
    case "paid":
      return "PAID";
    case "confirmed":
      return "CONFIRMED";
    case "complete":
      return "COMPLETE";
    case "expired":
      return "EXPIRED";
    case "invalid":
      return "INVALID";
    default:
      return "NEW";
  }
}

function assertEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

async function createBitPayInvoice(params: {
  price: Prisma.Decimal | number | string;
  currency: string;
  orderId: string;
  itemDesc: string;
  notificationURL: string;
  redirectURL: string;
  token: string;
}): Promise<BitPayInvoiceCreateResult> {
  const response = await fetch("https://api.bitpay.com/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.token}`,
    },
    body: JSON.stringify({
      price:
        typeof params.price === "string"
          ? Number(params.price)
          : Number(params.price),
      currency: params.currency,
      orderId: params.orderId,
      itemDesc: params.itemDesc,
      notificationURL: params.notificationURL,
      redirectURL: params.redirectURL,
      transactionSpeed: "medium",
      fullNotifications: true,
      extendedNotifications: true,
    }),
    cache: "no-store",
  });

  const raw = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      raw && typeof raw === "object" && "error" in raw
        ? String(
            (raw as { error?: unknown }).error ??
              "BitPay invoice creation failed",
          )
        : "BitPay invoice creation failed";
    throw new Error(message);
  }

  const data =
    raw && typeof raw === "object" && "data" in raw
      ? (raw as { data: Record<string, unknown> }).data
      : null;

  if (!data) {
    throw new Error("Invalid BitPay response: missing invoice data");
  }

  const invoiceId = String(data.id ?? "");
  const invoiceUrl = String(data.url ?? "");

  if (!invoiceId || !invoiceUrl) {
    throw new Error("Invalid BitPay response: missing invoice id or url");
  }

  return {
    invoiceId,
    invoiceUrl,
    status: (
      (data.status as string | undefined) ?? "new"
    ).toLowerCase() as BitPayInvoiceCreateResult["status"],
    price: String(data.price ?? params.price),
    currency: String(data.currency ?? params.currency),
    token: data.token ? String(data.token) : null,
    orderId: data.orderId ? String(data.orderId) : null,
    posData: data.posData ? String(data.posData) : null,
    raw,
  };
}

export async function createInvestmentOrderCryptoCheckout({
  investmentOrderId,
  userId,
}: CreateInvestmentOrderCryptoCheckoutInput): Promise<CreateInvestmentOrderCryptoCheckoutResult> {
  const appUrl = assertEnv("NEXT_PUBLIC_APP_URL");
  const bitPayToken = assertEnv("BITPAY_API_TOKEN");

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
    price: remainingAmount,
    currency: order.currency,
    orderId: internalReference,
    itemDesc,
    notificationURL,
    redirectURL,
    token: bitPayToken,
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
            status: toBitPayStatus(invoice.status),
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
