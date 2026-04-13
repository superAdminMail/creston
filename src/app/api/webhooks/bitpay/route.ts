import { NextRequest, NextResponse } from "next/server";
import {
  BitPayInvoiceStatus,
  CryptoFundingIntentStatus,
  CryptoWebhookProcessingStatus,
  CryptoWebhookSource,
  InvestmentOrderStatus,
  Prisma,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

type BitPayWebhookPayload = {
  event?: {
    name?: string;
    code?: number;
  };
  data?: {
    id?: string;
    status?: string;
    price?: number | string;
    currency?: string;
    orderId?: string;
    url?: string;
    token?: string;
    posData?: string;
    exceptionStatus?: string | null;
    amountPaid?: number | string | null;
    amountDue?: number | string | null;
    rate?: number | string | null;
  };
};

function mapBitPayInvoiceStatus(
  value: string | null | undefined,
): BitPayInvoiceStatus {
  switch ((value ?? "").toLowerCase()) {
    case "new":
      return BitPayInvoiceStatus.NEW;
    case "paid":
      return BitPayInvoiceStatus.PAID;
    case "confirmed":
      return BitPayInvoiceStatus.CONFIRMED;
    case "complete":
      return BitPayInvoiceStatus.COMPLETE;
    case "expired":
      return BitPayInvoiceStatus.EXPIRED;
    case "invalid":
      return BitPayInvoiceStatus.INVALID;
    default:
      return BitPayInvoiceStatus.NEW;
  }
}

function mapFundingIntentStatus(
  value: string | null | undefined,
): CryptoFundingIntentStatus {
  switch ((value ?? "").toLowerCase()) {
    case "paid":
    case "confirmed":
      return CryptoFundingIntentStatus.AWAITING_PROVIDER_CONFIRMATION;
    case "complete":
      return CryptoFundingIntentStatus.FUNDED;
    case "expired":
      return CryptoFundingIntentStatus.EXPIRED;
    case "invalid":
      return CryptoFundingIntentStatus.FAILED;
    case "new":
      return CryptoFundingIntentStatus.REQUIRES_ACTION;
    default:
      return CryptoFundingIntentStatus.PROCESSING;
  }
}

function isTerminalSuccess(value: string | null | undefined): boolean {
  return (value ?? "").toLowerCase() === "complete";
}

function isTerminalFailure(value: string | null | undefined): boolean {
  const normalized = (value ?? "").toLowerCase();
  return normalized === "expired" || normalized === "invalid";
}

function decimalOrNull(value: unknown): Prisma.Decimal | null {
  if (value === null || value === undefined || value === "") return null;

  try {
    return new Prisma.Decimal(value as string | number);
  } catch {
    return null;
  }
}

function getIdempotencyKey(payload: BitPayWebhookPayload): string | null {
  const invoiceId = payload.data?.id?.trim();
  const status = payload.data?.status?.trim()?.toLowerCase();
  const eventName = payload.event?.name?.trim()?.toLowerCase() ?? "bitpay";
  if (!invoiceId || !status) return null;
  return `bitpay:${eventName}:${invoiceId}:${status}`;
}

export async function POST(request: NextRequest) {
  const signature =
    request.headers.get("x-signature") ??
    request.headers.get("x-bitpay-sig") ??
    request.headers.get("x-bitpay-signature");

  let payload: BitPayWebhookPayload;

  try {
    payload = (await request.json()) as BitPayWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const invoiceId = payload.data?.id?.trim();

  if (!invoiceId) {
    return NextResponse.json(
      { error: "Missing BitPay invoice id" },
      { status: 400 },
    );
  }

  const eventType =
    payload.event?.name?.trim() ||
    payload.data?.status?.trim() ||
    "bitpay.invoice.unknown";

  const idempotencyKey = getIdempotencyKey(payload);

  const existingEvent = idempotencyKey
    ? await prisma.cryptoWebhookEvent.findUnique({
        where: { idempotencyKey },
        select: {
          id: true,
          processingStatus: true,
        },
      })
    : null;

  if (
    existingEvent?.processingStatus === CryptoWebhookProcessingStatus.PROCESSED
  ) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  const invoiceRecord = await prisma.bitPayInvoicePayment.findUnique({
    where: { bitpayInvoiceId: invoiceId },
    include: {
      fundingIntent: {
        include: {
          investmentOrder: true,
        },
      },
    },
  });

  const webhookEvent = await prisma.cryptoWebhookEvent.upsert({
    where: {
      idempotencyKey:
        idempotencyKey ?? `bitpay:fallback:${invoiceId}:${Date.now()}`,
    },
    update: {
      payload: payload as Prisma.InputJsonValue,
      signature,
      providerObjectId: invoiceId,
      fundingIntentId: invoiceRecord?.fundingIntentId ?? null,
      eventType,
      source: CryptoWebhookSource.BITPAY,
      processingStatus: CryptoWebhookProcessingStatus.RECEIVED,
      errorMessage: null,
      failedAt: null,
    },
    create: {
      source: CryptoWebhookSource.BITPAY,
      eventType,
      processingStatus: CryptoWebhookProcessingStatus.RECEIVED,
      fundingIntentId: invoiceRecord?.fundingIntentId ?? null,
      providerObjectId: invoiceId,
      idempotencyKey,
      signature,
      payload: payload as Prisma.InputJsonValue,
    },
  });

  if (!invoiceRecord) {
    await prisma.cryptoWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processingStatus: CryptoWebhookProcessingStatus.IGNORED,
        processedAt: new Date(),
        errorMessage: "BitPay invoice not found",
      },
    });

    return NextResponse.json({ ok: true, ignored: true });
  }

  const bitpayStatus = mapBitPayInvoiceStatus(payload.data?.status);
  const fundingIntentStatus = mapFundingIntentStatus(payload.data?.status);

  const amountPaid = decimalOrNull(payload.data?.amountPaid);
  const amountDue = decimalOrNull(payload.data?.amountDue);
  const exchangeRate = decimalOrNull(payload.data?.rate);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.bitPayInvoicePayment.update({
        where: { id: invoiceRecord.id },
        data: {
          status: bitpayStatus,
          amountPaid: amountPaid ?? undefined,
          amountDue: amountDue ?? undefined,
          exchangeRate: exchangeRate ?? undefined,
          invoiceUrl: payload.data?.url ?? invoiceRecord.invoiceUrl,
          bitpayOrderId: payload.data?.orderId ?? invoiceRecord.bitpayOrderId,
          bitpayToken: payload.data?.token ?? invoiceRecord.bitpayToken,
          posData: payload.data?.posData ?? invoiceRecord.posData,
          rawStatusPayload: payload as Prisma.InputJsonValue,
          paidAt:
            bitpayStatus === BitPayInvoiceStatus.PAID
              ? new Date()
              : invoiceRecord.paidAt,
          confirmedAt:
            bitpayStatus === BitPayInvoiceStatus.CONFIRMED
              ? new Date()
              : invoiceRecord.confirmedAt,
          completedAt:
            bitpayStatus === BitPayInvoiceStatus.COMPLETE
              ? new Date()
              : invoiceRecord.completedAt,
          expiredAt:
            bitpayStatus === BitPayInvoiceStatus.EXPIRED
              ? new Date()
              : invoiceRecord.expiredAt,
          invalidAt:
            bitpayStatus === BitPayInvoiceStatus.INVALID
              ? new Date()
              : invoiceRecord.invalidAt,
        },
      });

      if (isTerminalFailure(payload.data?.status)) {
        await tx.cryptoFundingIntent.update({
          where: { id: invoiceRecord.fundingIntentId },
          data: {
            status: fundingIntentStatus,
            failedAt: new Date(),
            failureCode: payload.data?.status ?? "BITPAY_FAILURE",
            failureMessage:
              payload.data?.exceptionStatus ??
              "BitPay payment did not complete",
            providerReference: invoiceId,
          },
        });

        await tx.cryptoWebhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processingStatus: CryptoWebhookProcessingStatus.PROCESSED,
            processedAt: new Date(),
          },
        });

        return;
      }

      if (!isTerminalSuccess(payload.data?.status)) {
        await tx.cryptoFundingIntent.update({
          where: { id: invoiceRecord.fundingIntentId },
          data: {
            status: fundingIntentStatus,
            providerReference: invoiceId,
          },
        });

        await tx.cryptoWebhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processingStatus: CryptoWebhookProcessingStatus.PROCESSED,
            processedAt: new Date(),
          },
        });

        return;
      }

      const fundingIntent = await tx.cryptoFundingIntent.findUnique({
        where: { id: invoiceRecord.fundingIntentId },
        include: {
          investmentOrder: true,
        },
      });

      if (!fundingIntent) {
        throw new Error("Crypto funding intent not found");
      }

      if (
        fundingIntent.status === CryptoFundingIntentStatus.FUNDED &&
        fundingIntent.creditedAt
      ) {
        await tx.cryptoWebhookEvent.update({
          where: { id: webhookEvent.id },
          data: {
            processingStatus: CryptoWebhookProcessingStatus.PROCESSED,
            processedAt: new Date(),
          },
        });

        return;
      }

      const creditedFiatAmount =
        decimalOrNull(payload.data?.price) ??
        fundingIntent.creditedFiatAmount ??
        fundingIntent.fiatAmount;

      const newAmountPaid = new Prisma.Decimal(
        fundingIntent.investmentOrder.amountPaid,
      ).plus(creditedFiatAmount);

      const isFullyPaid = newAmountPaid.gte(
        fundingIntent.investmentOrder.amount,
      );

      await tx.cryptoFundingIntent.update({
        where: { id: fundingIntent.id },
        data: {
          status: CryptoFundingIntentStatus.FUNDED,
          fundedAt: fundingIntent.fundedAt ?? new Date(),
          creditedAt: fundingIntent.creditedAt ?? new Date(),
          creditedFiatAmount,
          providerReference: invoiceId,
          failureCode: null,
          failureMessage: null,
        },
      });

      await tx.investmentOrder.update({
        where: { id: fundingIntent.investmentOrderId },
        data: {
          amountPaid: newAmountPaid,
          status: isFullyPaid
            ? InvestmentOrderStatus.PAID
            : InvestmentOrderStatus.PARTIALLY_PAID,
          paymentReference: invoiceId,
          paidAt: isFullyPaid
            ? (fundingIntent.investmentOrder.paidAt ?? new Date())
            : fundingIntent.investmentOrder.paidAt,
          paymentMetadata: {
            ...(typeof fundingIntent.investmentOrder.paymentMetadata ===
              "object" && fundingIntent.investmentOrder.paymentMetadata !== null
              ? (fundingIntent.investmentOrder.paymentMetadata as Record<
                  string,
                  unknown
                >)
              : {}),
            provider: "BITPAY",
            invoiceId,
            fundingIntentId: fundingIntent.id,
            creditedFiatAmount: creditedFiatAmount.toString(),
          },
        },
      });

      await tx.cryptoWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processingStatus: CryptoWebhookProcessingStatus.PROCESSED,
          processedAt: new Date(),
        },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await prisma.cryptoWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: {
        processingStatus: CryptoWebhookProcessingStatus.FAILED,
        failedAt: new Date(),
        errorMessage:
          error instanceof Error
            ? error.message
            : "Unknown webhook processing error",
      },
    });

    console.error("BitPay webhook processing error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
