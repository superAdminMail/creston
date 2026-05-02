import { NextResponse } from "next/server";
import {
  CryptoAsset,
  CryptoFundingProvider,
  CryptoFundingIntentStatus,
  CryptoNetwork,
  Prisma,
} from "@/generated/prisma";
import { getAppBaseUrl } from "@/lib/config/appUrl";
import { prisma } from "@/lib/prisma";
import {
  ACTIVE_CRYPTO_FUNDING_INTENT_STATUSES,
  calculateInvestmentOrderCryptoChargeAmount,
} from "@/lib/payments/crypto/calculateInvestmentOrderCryptoChargeAmount";
import { paymentoCreatePayment } from "@/lib/payments/crypto/paymento";

type RequestBody = {
  investmentOrderId: string;
  paymentMode?: "FULL" | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const investmentOrderId = body.investmentOrderId?.trim();

    if (!investmentOrderId) {
      return NextResponse.json(
        { error: "Missing investmentOrderId" },
        { status: 400 },
      );
    }

    if (body.paymentMode && body.paymentMode !== "FULL") {
      return NextResponse.json(
        { error: "Crypto funding only supports full payment" },
        { status: 400 },
      );
    }

    const reservation = await prisma.$transaction(
      async (tx) => {
        const order = await tx.investmentOrder.findUnique({
          where: { id: investmentOrderId },
          include: {
            investorProfile: {
              include: {
                user: true,
              },
            },
          },
        });

        if (!order) {
          return { kind: "not-found" as const };
        }

        if (order.status === "PAID" || order.status === "CONFIRMED") {
          return { kind: "already-paid" as const };
        }

        const activeCryptoIntent = await tx.cryptoFundingIntent.findFirst({
          where: {
            investmentOrderId: order.id,
            status: {
              in: ACTIVE_CRYPTO_FUNDING_INTENT_STATUSES,
            },
          },
          select: {
            id: true,
          },
        });

        if (activeCryptoIntent) {
          return {
            kind: "active-intent" as const,
            intentId: activeCryptoIntent.id,
          };
        }

        const chargeCalculation = calculateInvestmentOrderCryptoChargeAmount({
          totalAmount: order.amount,
          amountPaid: order.amountPaid,
          hasActiveCryptoIntent: false,
        });

        const intent = await tx.cryptoFundingIntent.create({
          data: {
            userId: order.investorProfile.user.id,
            provider: CryptoFundingProvider.PAYMENTO,
            asset: CryptoAsset.BTC,
            network: CryptoNetwork.BITCOIN,
            fiatCurrency: order.currency,
            fiatAmount: chargeCalculation.chargeAmount,
            status: CryptoFundingIntentStatus.PENDING,
            investmentOrderId: order.id,
            platformPaymentMethodId: order.platformPaymentMethodId,
            metadata: {
              paymentMode: "FULL",
              chargeAmount: chargeCalculation.chargeAmount.toString(),
              remainingBeforeCharge:
                chargeCalculation.remainingBeforeCharge.toString(),
              splitNumber: chargeCalculation.splitNumber,
              source: "paymento_create_route",
            },
          },
          select: {
            id: true,
          },
        });

        return {
          kind: "reserved" as const,
          order: {
            id: order.id,
            currency: order.currency,
            investorEmail: order.investorProfile.user.email,
            investorId: order.investorProfile.user.id,
            investorProfileId: order.investorProfileId,
          },
          intentId: intent.id,
          chargeCalculation,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    if (reservation.kind === "not-found") {
      return NextResponse.json(
        { error: "Investment order not found" },
        { status: 404 },
      );
    }

    if (reservation.kind === "already-paid") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 409 },
      );
    }

    if (reservation.kind === "active-intent") {
      return NextResponse.json(
        { error: "There is already an active crypto payment session for this order" },
        { status: 409 },
      );
    }

    const paymentMode = "FULL" as const;
    const { order, intentId, chargeCalculation } = reservation;

    const appBaseUrl = getAppBaseUrl();
    const returnUrl = new URL(
      "/account/dashboard/checkout/crypto/callback",
      appBaseUrl,
    );
    returnUrl.searchParams.set("targetType", "INVESTMENT_ORDER");
    returnUrl.searchParams.set("targetId", order.id);
    returnUrl.searchParams.set("fundingMethodType", "CRYPTO_PROVIDER");
    returnUrl.searchParams.set("paymentMode", paymentMode);
    returnUrl.searchParams.set("provider", "PAYMENTO");

    try {
      const created = await paymentoCreatePayment({
        fiatAmount: chargeCalculation.chargeAmount.toString(),
        fiatCurrency: order.currency,
        orderId: order.id,
        Speed: 1,
        ReturnUrl: returnUrl.toString(),
        additionalData: [
          { key: "investmentOrderId", value: order.id },
          { key: "fundingIntentId", value: intentId },
          { key: "investorProfileId", value: order.investorProfileId },
          { key: "userId", value: order.investorId },
          { key: "paymentMode", value: paymentMode },
        ],
        EmailAddress: order.investorEmail,
      });

      await prisma.$transaction(async (tx) => {
        await tx.cryptoFundingIntent.update({
          where: { id: intentId },
          data: {
            status: CryptoFundingIntentStatus.REQUIRES_ACTION,
            providerSessionId: created.token,
            providerReference: created.token,
            providerExternalId: created.token,
            redirectUrl: created.gatewayUrl,
            metadata: {
              createPaymentResponse: created.raw,
              paymentMode,
              chargeAmount: chargeCalculation.chargeAmount.toString(),
              remainingBeforeCharge:
                chargeCalculation.remainingBeforeCharge.toString(),
              splitNumber: chargeCalculation.splitNumber,
            },
          },
        });

        await tx.investmentOrder.update({
          where: { id: order.id },
          data: {
            paymentMethodType: "CRYPTO_PROVIDER",
            paymentMetadata: {
              fundingIntentId: intentId,
              redirectUrl: created.gatewayUrl,
              provider: "PAYMENTO",
              token: created.token,
              paymentReference: created.token,
              paymentMode,
              chargeAmount: chargeCalculation.chargeAmount.toString(),
            },
          },
        });
      });

      return NextResponse.json({
        success: true,
        fundingIntentId: intentId,
        redirectUrl: created.gatewayUrl,
      });
    } catch (error) {
      await prisma.cryptoFundingIntent
        .update({
          where: { id: intentId },
          data: {
            status: CryptoFundingIntentStatus.FAILED,
            failedAt: new Date(),
            failureCode: "PAYMENTO_CREATE_FAILED",
            failureMessage:
              error instanceof Error
                ? error.message
                : "Unable to create Paymento payment",
          },
        })
        .catch(() => null);

      throw error;
    }
  } catch (error) {
    console.error("[paymento.create]", error);
    return NextResponse.json(
      { error: "Unable to create Paymento payment" },
      { status: 500 },
    );
  }
}
