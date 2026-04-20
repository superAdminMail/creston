import { NextResponse } from "next/server";
import {
  CryptoAsset,
  CryptoFundingProvider,
  CryptoNetwork,
} from "@/generated/prisma";
import { getAppBaseUrl } from "@/lib/config/appUrl";
import { prisma } from "@/lib/prisma";
import { calculateInvestmentOrderCryptoChargeAmount } from "@/lib/payments/crypto/calculateInvestmentOrderCryptoChargeAmount";
import { paymentoCreatePayment } from "@/lib/payments/crypto/paymento";

type RequestBody = {
  investmentOrderId: string;
  paymentMode?: "FULL" | "PARTIAL" | null;
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

    const order = await prisma.investmentOrder.findUnique({
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
      return NextResponse.json(
        { error: "Investment order not found" },
        { status: 404 },
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 409 },
      );
    }

    const hasActiveCryptoIntent =
      (await prisma.cryptoFundingIntent.findFirst({
        where: {
          investmentOrderId: order.id,
          status: {
            in: [
              "PENDING",
              "REQUIRES_ACTION",
              "PROCESSING",
              "AWAITING_PROVIDER_CONFIRMATION",
            ],
          },
        },
        select: {
          id: true,
        },
      })) !== null;

    const chargeCalculation = calculateInvestmentOrderCryptoChargeAmount({
      totalAmount: order.amount,
      amountPaid: order.amountPaid,
      usePartialPayment: body.paymentMode === "PARTIAL",
      hasActiveCryptoIntent,
    });

    const appBaseUrl = getAppBaseUrl();
    const returnUrl = new URL(
      "/account/dashboard/checkout/crypto/callback",
      appBaseUrl,
    );
    returnUrl.searchParams.set("targetType", "INVESTMENT_ORDER");
    returnUrl.searchParams.set("targetId", order.id);
    returnUrl.searchParams.set("fundingMethodType", "CRYPTO_PROVIDER");
    returnUrl.searchParams.set("paymentMode", body.paymentMode ?? "FULL");
    returnUrl.searchParams.set("provider", "PAYMENTO");

    const created = await paymentoCreatePayment({
      fiatAmount: chargeCalculation.chargeAmount.toString(),
      fiatCurrency: order.currency,
      orderId: order.id,
      Speed: 1,
      ReturnUrl: returnUrl.toString(),
      additionalData: [
        { key: "investmentOrderId", value: order.id },
        { key: "investorProfileId", value: order.investorProfileId },
        { key: "userId", value: order.investorProfile.user.id },
        {
          key: "paymentMode",
          value: chargeCalculation.isPartialPayment ? "PARTIAL" : "FULL",
        },
      ],
      EmailAddress: order.investorProfile.user.email,
    });

    const intent = await prisma.cryptoFundingIntent.create({
      data: {
        userId: order.investorProfile.user.id,
        provider: CryptoFundingProvider.PAYMENTO,
        asset: CryptoAsset.BTC,
        network: CryptoNetwork.BITCOIN,
        fiatCurrency: order.currency,
        fiatAmount: chargeCalculation.chargeAmount,
        status: "REQUIRES_ACTION",
        providerSessionId: created.token,
        providerReference: created.token,
        providerExternalId: created.token,
        redirectUrl: created.gatewayUrl,
        metadata: {
          createPaymentResponse: created.raw,
          paymentMode: chargeCalculation.isPartialPayment ? "PARTIAL" : "FULL",
          chargeAmount: chargeCalculation.chargeAmount.toString(),
          remainingBeforeCharge:
            chargeCalculation.remainingBeforeCharge.toString(),
          splitNumber: chargeCalculation.splitNumber,
        },
        investmentOrderId: order.id,
        platformPaymentMethodId: order.platformPaymentMethodId,
      },
    });

    await prisma.investmentOrder.update({
      where: { id: order.id },
      data: {
        paymentMethodType: "CRYPTO_PROVIDER",
        paymentMetadata: {
          fundingIntentId: intent.id,
          redirectUrl: created.gatewayUrl,
          provider: "PAYMENTO",
          token: created.token,
          paymentReference: created.token,
          paymentMode: chargeCalculation.isPartialPayment ? "PARTIAL" : "FULL",
          chargeAmount: chargeCalculation.chargeAmount.toString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      fundingIntentId: intent.id,
      redirectUrl: created.gatewayUrl,
    });
  } catch (error) {
    console.error("[paymento.create]", error);
    return NextResponse.json(
      { error: "Unable to create Paymento payment" },
      { status: 500 },
    );
  }
}
