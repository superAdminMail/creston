import { NextResponse } from "next/server";
import {
  CryptoFundingProvider,
  CryptoWebhookSource,
  Prisma,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  getPaymentoSignature,
  mapPaymentoIntentStatus,
  mapPaymentoInvestmentOrderStatus,
  parsePaymentoStatus,
  paymentoVerifyPayment,
  verifyPaymentoSignature,
  type PaymentoCallbackBody,
} from "@/lib/payments/crypto/paymento";

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

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = getPaymentoSignature(req.headers);

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  if (!verifyPaymentoSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: PaymentoCallbackBody;

  try {
    payload = JSON.parse(rawBody) as PaymentoCallbackBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = String(payload.Token ?? "").trim();
  const paymentId = String(payload.PaymentId ?? "").trim() || null;
  const orderId = String(payload.OrderId ?? "").trim();
  const statusCode = parsePaymentoStatus(payload.OrderStatus);

  if (!token || !orderId) {
    return NextResponse.json(
      { error: "Missing token or order id" },
      { status: 400 },
    );
  }

  const idempotencyKey = `paymento:${paymentId ?? token}:${statusCode ?? "unknown"}`;

  const existingEvent = await prisma.cryptoWebhookEvent.findUnique({
    where: { idempotencyKey },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const fundingIntent = await prisma.cryptoFundingIntent.findFirst({
    where: {
      provider: CryptoFundingProvider.PAYMENTO,
      providerSessionId: token,
      investmentOrderId: orderId,
    },
    include: {
      investmentOrder: true,
    },
  });

  if (!fundingIntent) {
    await prisma.cryptoWebhookEvent.create({
      data: {
        source: CryptoWebhookSource.PAYMENTO,
        eventType: "payment.callback",
        processingStatus: "FAILED",
        providerEventId: paymentId,
        providerObjectId: token,
        idempotencyKey,
        signature,
        payload: toJsonValue(payload),
        failedAt: new Date(),
        errorMessage: "Funding intent not found",
      },
    });

    return NextResponse.json(
      { error: "Funding intent not found" },
      { status: 404 },
    );
  }

  const verified = await paymentoVerifyPayment(token);

  try {
    await prisma.$transaction(async (tx) => {
      const mappedIntentStatus = mapPaymentoIntentStatus(statusCode);
      const mappedOrderStatus = mapPaymentoInvestmentOrderStatus(statusCode);
      const now = new Date();

      const event = await tx.cryptoWebhookEvent.create({
        data: {
          source: CryptoWebhookSource.PAYMENTO,
          eventType: "payment.callback",
          processingStatus: "RECEIVED",
          fundingIntentId: fundingIntent.id,
          providerEventId: paymentId,
          providerObjectId: token,
          idempotencyKey,
          signature,
          payload: toJsonValue({
            callback: payload,
            verify: verified,
          }),
        },
      });

      const existingMetadata =
        fundingIntent.metadata &&
        typeof fundingIntent.metadata === "object" &&
        !Array.isArray(fundingIntent.metadata)
          ? (fundingIntent.metadata as Record<string, unknown>)
          : {};

      await tx.cryptoFundingIntent.update({
        where: { id: fundingIntent.id },
        data: {
          status: mappedIntentStatus,
          providerExternalId: paymentId ?? fundingIntent.providerExternalId,
          providerReference: orderId,
          fundedAt:
            mappedIntentStatus === "FUNDED" ? now : fundingIntent.fundedAt,
          failedAt:
            mappedIntentStatus === "FAILED" ? now : fundingIntent.failedAt,
          canceledAt:
            mappedIntentStatus === "CANCELED" ? now : fundingIntent.canceledAt,
          metadata: toNullableJsonValue({
            ...existingMetadata,
            lastCallback: payload,
            lastVerify: verified,
          }),
        },
      });

      if (mappedOrderStatus === "PARTIALLY_PAID") {
        await tx.investmentOrder.update({
          where: { id: fundingIntent.investmentOrderId },
          data: {
            paymentMethodType: "CRYPTO_PROVIDER",
            status: "PARTIALLY_PAID",
            paymentReference: paymentId ?? token,
            lastPaymentSubmittedAt: now,
            paymentMetadata: toNullableJsonValue({
              provider: "PAYMENTO",
              token,
              paymentId,
              callbackStatus: statusCode,
            }),
          },
        });
      }

      if (mappedOrderStatus === "PAID") {
        const existingApprovedPayment =
          await tx.investmentOrderPayment.findFirst({
            where: {
              investmentOrderId: fundingIntent.investmentOrderId,
              type: "CRYPTO_PROVIDER",
              providerReference: paymentId ?? token,
              status: "APPROVED",
            },
          });

        if (!existingApprovedPayment) {
          await tx.investmentOrderPayment.create({
            data: {
              investmentOrderId: fundingIntent.investmentOrderId,
              type: "CRYPTO_PROVIDER",
              status: "APPROVED",
              platformPaymentMethodId: fundingIntent.platformPaymentMethodId,
              submittedByUserId: fundingIntent.userId,
              reviewedByUserId: null,
              claimedAmount: fundingIntent.fiatAmount,
              approvedAmount: fundingIntent.fiatAmount,
              currency: fundingIntent.fiatCurrency,
              providerReference: paymentId ?? token,
              providerPayload: toJsonValue({
                callback: payload,
                verify: verified,
              }),
              submittedAt: fundingIntent.createdAt,
              reviewedAt: now,
            },
          });
        }

        await tx.investmentOrder.update({
          where: { id: fundingIntent.investmentOrderId },
          data: {
            paymentMethodType: "CRYPTO_PROVIDER",
            status: "PAID",
            amountPaid: fundingIntent.fiatAmount,
            paymentReference: paymentId ?? token,
            paidAt: now,
            confirmedAt: now,
            lastPaymentSubmittedAt: now,
            lastPaymentReviewedAt: now,
            paymentMetadata: toNullableJsonValue({
              provider: "PAYMENTO",
              token,
              paymentId,
              callbackStatus: statusCode,
            }),
          },
        });

        await tx.notification.create({
          data: {
            userId: fundingIntent.userId,
            title: "Investment payment confirmed",
            message: "Your crypto payment was confirmed successfully.",
            type: "INVESTMENT_PAYMENT_CONFIRMED",
            link: `/account/investments/orders/${fundingIntent.investmentOrderId}`,
            key: `investment-payment-confirmed:${fundingIntent.investmentOrderId}`,
            metadata: toNullableJsonValue({
              investmentOrderId: fundingIntent.investmentOrderId,
              fundingIntentId: fundingIntent.id,
              provider: "PAYMENTO",
            }),
          },
        });
      }

      if (mappedOrderStatus === "CANCELLED") {
        await tx.investmentOrder.update({
          where: { id: fundingIntent.investmentOrderId },
          data: {
            status: "CANCELLED",
            cancelledAt: now,
            paymentReference: paymentId ?? token,
            paymentMetadata: toNullableJsonValue({
              provider: "PAYMENTO",
              token,
              paymentId,
              callbackStatus: statusCode,
            }),
          },
        });
      }

      await tx.cryptoWebhookEvent.update({
        where: { id: event.id },
        data: {
          processingStatus: "PROCESSED",
          processedAt: now,
        },
      });
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[paymento.webhook]", error);

    await prisma.cryptoWebhookEvent.create({
      data: {
        source: CryptoWebhookSource.PAYMENTO,
        eventType: "payment.callback",
        processingStatus: "FAILED",
        fundingIntentId: fundingIntent.id,
        providerEventId: paymentId,
        providerObjectId: token,
        idempotencyKey: `${idempotencyKey}:error`,
        signature,
        payload: toJsonValue({
          callback: payload,
          verify: verified,
        }),
        failedAt: new Date(),
        errorMessage:
          error instanceof Error ? error.message : "Unknown webhook error",
      },
    });

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
