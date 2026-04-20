import { NextResponse } from "next/server";
import {
  CryptoFundingProvider,
  CryptoWebhookSource,
  Prisma,
} from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { applySuccessfulCryptoFunding } from "@/lib/payments/crypto/settlement/applySuccessfulCryptoFunding";
import {
  getPaymentoSignature,
  paymentoVerifyPayment,
  verifyPaymentoSignature,
  type PaymentoCallbackBody,
} from "@/lib/payments/crypto/paymento";
import {
  mapPaymentoStatusToCryptoFundingIntentStatus,
  mapPaymentoStatusToInvestmentOrderStatus,
  mapPaymentoStatusToSavingsFundingIntentStatus,
  resolvePaymentoStatus,
} from "@/lib/payments/crypto/paymentoStatus";

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

function asPlainObject(
  value: Prisma.JsonValue | null | undefined,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

type ResolvedTarget =
  | {
      kind: "INVESTMENT_ORDER";
      fundingIntent: Awaited<
        ReturnType<typeof prisma.cryptoFundingIntent.findFirst>
      > extends infer T
        ? NonNullable<T>
        : never;
    }
  | {
      kind: "SAVINGS_FUNDING";
      fundingIntent: Awaited<
        ReturnType<typeof prisma.savingsFundingIntent.findFirst>
      > extends infer T
        ? NonNullable<T>
        : never;
    };

async function resolvePaymentoTarget(token: string, orderId: string) {
  const [investmentFundingIntent, savingsFundingIntent] = await Promise.all([
    prisma.cryptoFundingIntent.findFirst({
      where: {
        provider: CryptoFundingProvider.PAYMENTO,
        providerSessionId: token,
        investmentOrderId: orderId,
      },
      include: {
        investmentOrder: {
          select: {
            id: true,
            paymentMetadata: true,
          },
        },
      },
    }),
    prisma.savingsFundingIntent.findFirst({
      where: {
        provider: CryptoFundingProvider.PAYMENTO,
        providerSessionId: token,
        savingsAccountId: orderId,
      },
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
    }),
  ]);

  if (investmentFundingIntent) {
    return {
      kind: "INVESTMENT_ORDER" as const,
      fundingIntent: investmentFundingIntent,
    } satisfies ResolvedTarget;
  }

  if (savingsFundingIntent) {
    return {
      kind: "SAVINGS_FUNDING" as const,
      fundingIntent: savingsFundingIntent,
    } satisfies ResolvedTarget;
  }

  return null;
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
  const paymentoStatus = resolvePaymentoStatus(payload.OrderStatus);

  if (!token || !orderId) {
    return NextResponse.json(
      { error: "Missing token or order id" },
      { status: 400 },
    );
  }

  const idempotencyKey = `paymento:${paymentId ?? token}:${paymentoStatus.status}`;

  const existingEvent = await prisma.cryptoWebhookEvent.findUnique({
    where: { idempotencyKey },
  });

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const target = await resolvePaymentoTarget(token, orderId);

  if (!target) {
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
  const providerReference = paymentId ?? token;

  try {
    await prisma.$transaction(async (tx) => {
      const now = new Date();

      const event = await tx.cryptoWebhookEvent.create({
        data: {
          source: CryptoWebhookSource.PAYMENTO,
          eventType: "payment.callback",
          processingStatus: "RECEIVED",
          fundingIntentId: target.fundingIntent.id,
          providerEventId: paymentId,
          providerObjectId: token,
          idempotencyKey,
          signature,
          payload: toJsonValue({
            callback: payload,
            verify: verified,
            targetType: target.kind,
            paymentoStatus: paymentoStatus.status,
            providerReference,
          }),
        },
      });

      if (paymentoStatus.shouldSettle) {
        const settled = await applySuccessfulCryptoFunding({
          tx,
          provider: CryptoFundingProvider.PAYMENTO,
          providerSessionId: token,
          providerExternalId: providerReference,
          providerReference,
          callbackPayload: payload,
          verifiedPayload: verified.body,
          statusCode: paymentoStatus.status,
          processedAt: now,
        });

        console.log("[paymento.webhook.settled]", {
          targetType: settled.targetType,
          providerReference,
          creditedAmount: settled.creditedAmount,
          paymentoStatus: paymentoStatus.status,
        });
      } else if (target.kind === "INVESTMENT_ORDER") {
        const mappedIntentStatus = mapPaymentoStatusToCryptoFundingIntentStatus(
          paymentoStatus.status,
        );
        const mappedOrderStatus = mapPaymentoStatusToInvestmentOrderStatus(
          paymentoStatus.status,
        );
        const existingOrderPaymentMetadata = asPlainObject(
          target.fundingIntent.investmentOrder.paymentMetadata,
        );
        const existingMetadata = asPlainObject(target.fundingIntent.metadata);

        await tx.cryptoFundingIntent.update({
          where: { id: target.fundingIntent.id },
          data: {
            providerExternalId: providerReference,
            providerReference,
            metadata: toNullableJsonValue({
              ...existingMetadata,
              lastCallback: payload,
              lastVerify: verified,
              lastWebhookAt: now.toISOString(),
              paymentoStatus: paymentoStatus.status,
              providerReference,
            }),
            status: mappedIntentStatus,
            fundedAt:
              mappedIntentStatus === "FUNDED"
                ? now
                : target.fundingIntent.fundedAt,
            failedAt:
              mappedIntentStatus === "FAILED"
                ? now
                : target.fundingIntent.failedAt,
            canceledAt:
              mappedIntentStatus === "CANCELED"
                ? now
                : target.fundingIntent.canceledAt,
          },
        });

        if (mappedOrderStatus === "CANCELLED") {
          await tx.investmentOrder.update({
            where: { id: target.fundingIntent.investmentOrderId },
            data: {
              status: "CANCELLED",
              cancelledAt: now,
              paymentReference: providerReference,
              paymentMetadata: toNullableJsonValue({
                ...existingOrderPaymentMetadata,
                provider: "PAYMENTO",
                token,
                paymentId,
                providerReference,
                callbackStatus: paymentoStatus.status,
                lastWebhookAt: now.toISOString(),
              }),
            },
          });
        } else {
          await tx.investmentOrder.update({
            where: { id: target.fundingIntent.investmentOrderId },
            data: {
              paymentMethodType: "CRYPTO_PROVIDER",
              status: mappedOrderStatus,
              paymentReference: providerReference,
              lastPaymentSubmittedAt: now,
              paymentMetadata: toNullableJsonValue({
                ...existingOrderPaymentMetadata,
                provider: "PAYMENTO",
                token,
                paymentId,
                providerReference,
                callbackStatus: paymentoStatus.status,
                lastWebhookAt: now.toISOString(),
              }),
            },
          });
        }
      } else if (target.kind === "SAVINGS_FUNDING") {
        const existingMetadata = asPlainObject(target.fundingIntent.metadata);
        const mappedFundingStatus = mapPaymentoStatusToSavingsFundingIntentStatus(
          paymentoStatus.status,
        );

        await tx.savingsFundingIntent.update({
          where: { id: target.fundingIntent.id },
          data: {
            providerExternalId: providerReference,
            providerReference,
            paymentReference: providerReference,
            metadata: toNullableJsonValue({
              ...existingMetadata,
              lastCallback: payload,
              lastVerify: verified,
              lastWebhookAt: now.toISOString(),
              paymentoStatus: paymentoStatus.status,
              providerReference,
            }),
            status: mappedFundingStatus,
            paidAt: target.fundingIntent.paidAt,
            creditedAt: target.fundingIntent.creditedAt,
            failedAt:
              paymentoStatus.isFailed ? now : target.fundingIntent.failedAt,
            cancelledAt:
              paymentoStatus.isCancelled
                ? now
                : target.fundingIntent.cancelledAt,
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
        fundingIntentId: target.fundingIntent.id,
        providerEventId: paymentId,
        providerObjectId: token,
        idempotencyKey: `${idempotencyKey}:error`,
        signature,
        payload: toJsonValue({
          callback: payload,
          verify: verified,
          targetType: target.kind,
          paymentoStatus: paymentoStatus.status,
          providerReference,
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
