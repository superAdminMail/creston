import { NextResponse } from "next/server";
import {
  CryptoAsset,
  CryptoFundingProvider,
  CryptoNetwork,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { paymentoCreatePayment } from "@/lib/payments/crypto/paymento";

type RequestBody = {
  investmentOrderId: string;
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

    const created = await paymentoCreatePayment({
      fiatAmount: order.amount.toString(),
      fiatCurrency: order.currency,
      orderId: order.id,
      Speed: 1,
      ReturnUrl: `${process.env.APP_BASE_URL}/account/investments/${order.id}/crypto-return`,
      additionalData: [
        { key: "investmentOrderId", value: order.id },
        { key: "investorProfileId", value: order.investorProfileId },
        { key: "userId", value: order.investorProfile.user.id },
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
        fiatAmount: order.amount,
        status: "REQUIRES_ACTION",
        providerSessionId: created.token,
        providerReference: order.id,
        redirectUrl: created.gatewayUrl,
        metadata: {
          createPaymentResponse: created.raw,
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
