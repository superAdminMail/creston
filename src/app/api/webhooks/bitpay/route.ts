import { NextRequest, NextResponse } from "next/server";
import {
  CryptoFundingIntentStatus,
  CryptoWebhookProcessingStatus,
  CryptoWebhookSource,
  Prisma,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { applySuccessfulCryptoFundingToInvestmentOrder } from "@/lib/payments/crypto/applySuccessfulCryptoFundingToInvestmentOrder";
import {
  retrieveBitPayInvoice,
  toBitPayInvoiceStatus,
} from "@/lib/payments/crypto/bitpay";

type BitPayWebhookPayload = {
  event?: {
    name?: string;
    code?: number;
  };
  data?: {
    id?: string;
    status?: string;
  };
};

function mapFundingIntentStatus(
  value: string | null | undefined,
): CryptoFundingIntentStatus {
  switch ((value ?? "").toLowerCase()) {
    case "new":
      return CryptoFundingIntentStatus.REQUIRES_ACTION;
    case "paid":
    case "confirmed":
      return CryptoFundingIntentStatus.AWAITING_PROVIDER_CONFIRMATION;
    case "complete":
      return CryptoFundingIntentStatus.FUNDED;
    case "expired":
      return CryptoFundingIntentStatus.EXPIRED;
    case "invalid":
      return CryptoFundingIntentStatus.FAILED;
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

function getIdempotencyKey(
  invoiceId: string,
  status: string,
  eventName?: string,
): string {
  return `bitpay:${(eventName ?? "bitpay").toLowerCase()}:${invoiceId}:${status.toLowerCase()}`;
}

export async function POST(request: NextRequest) {
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

  let verifiedInvoice;
  try {
    verifiedInvoice = await retrieveBitPayInvoice(invoiceId);
  } catch (error) {
    console.error("Failed to verify BitPay invoice via API:", error);
    return NextResponse.json(
      { error: "Unable to verify invoice with BitPay" },
      { status: 502 },
    );
  }

  const eventType =
    payload.event?.name?.trim() ||
    verifiedInvoice.status ||
    "bitpay.invoice.unknown";

  const idempotencyKey = getIdempotencyKey(
    invoiceId,
    verifiedInvoice.status,
    payload.event?.name,
  );

  const existingProcessedEvent = await prisma.cryptoWebhookEvent.findUnique({
    where: { idempotencyKey },
    select: { id: true, processingStatus: true },
  });

  if (
    existingProcessedEvent?.processingStatus ===
    CryptoWebhookProcessingStatus.PROCESSED
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

  const webhookEvent = await prisma.cryptoWebhookEvent.create({
    data: {
      source: CryptoWebhookSource.BITPAY,
      eventType,
      processingStatus: CryptoWebhookProcessingStatus.RECEIVED,
      fundingIntentId: invoiceRecord?.fundingIntentId ?? null,
      providerObjectId: invoiceId,
      idempotencyKey,
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

  const verifiedStatus = verifiedInvoice.status;
  const bitpayStatus = toBitPayInvoiceStatus(verifiedStatus);
  const fundingIntentStatus = mapFundingIntentStatus(verifiedStatus);

  const amountPaid = decimalOrNull(verifiedInvoice.amountPaid);
  const amountDue = decimalOrNull(verifiedInvoice.amountDue);
  const exchangeRate = decimalOrNull(verifiedInvoice.rate);
  const creditedFiatAmount =
    decimalOrNull(verifiedInvoice.price) ??
    invoiceRecord.fundingIntent.creditedFiatAmount ??
    invoiceRecord.fundingIntent.fiatAmount;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.bitPayInvoicePayment.update({
        where: { id: invoiceRecord.id },
        data: {
          status: bitpayStatus,
          amountPaid: amountPaid ?? undefined,
          amountDue: amountDue ?? undefined,
          exchangeRate: exchangeRate ?? undefined,
          invoiceUrl: verifiedInvoice.invoiceUrl ?? invoiceRecord.invoiceUrl,
          bitpayOrderId: verifiedInvoice.orderId ?? invoiceRecord.bitpayOrderId,
          bitpayToken: verifiedInvoice.token ?? invoiceRecord.bitpayToken,
          posData: verifiedInvoice.posData ?? invoiceRecord.posData,
          rawStatusPayload: verifiedInvoice.raw as Prisma.InputJsonValue,
          paidAt:
            bitpayStatus === "PAID"
              ? (invoiceRecord.paidAt ?? new Date())
              : invoiceRecord.paidAt,
          confirmedAt:
            bitpayStatus === "CONFIRMED"
              ? (invoiceRecord.confirmedAt ?? new Date())
              : invoiceRecord.confirmedAt,
          completedAt:
            bitpayStatus === "COMPLETE"
              ? (invoiceRecord.completedAt ?? new Date())
              : invoiceRecord.completedAt,
          expiredAt:
            bitpayStatus === "EXPIRED"
              ? (invoiceRecord.expiredAt ?? new Date())
              : invoiceRecord.expiredAt,
          invalidAt:
            bitpayStatus === "INVALID"
              ? (invoiceRecord.invalidAt ?? new Date())
              : invoiceRecord.invalidAt,
        },
      });

      if (isTerminalFailure(verifiedStatus)) {
        await tx.cryptoFundingIntent.update({
          where: { id: invoiceRecord.fundingIntentId },
          data: {
            status: fundingIntentStatus,
            failedAt: new Date(),
            failureCode: verifiedStatus,
            failureMessage:
              verifiedInvoice.exceptionStatus ??
              "BitPay payment did not complete successfully",
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

      if (isTerminalSuccess(verifiedStatus)) {
        await applySuccessfulCryptoFundingToInvestmentOrder(tx, {
          fundingIntentId: invoiceRecord.fundingIntentId,
          providerReference: invoiceId,
          creditedFiatAmount,
          receivedCryptoAmount: amountPaid,
          creditedAt: new Date(),
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

      await tx.cryptoFundingIntent.update({
        where: { id: invoiceRecord.fundingIntentId },
        data: {
          status: fundingIntentStatus,
          providerReference: invoiceId,
          failureCode: null,
          failureMessage: null,
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
            : "Unknown BitPay webhook processing error",
      },
    });

    console.error("BitPay webhook processing error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
