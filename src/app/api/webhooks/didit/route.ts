export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

type DiditWebhookPayload = {
  webhook_type?: string;
  session_id?: string;
  status?: string;
  vendor_data?: string;
  decision?: {
    status?: string;
    reason?: string | null;
  } | null;
  result?: {
    face_match?: {
      score?: number | null;
    } | null;
    liveness?: {
      passed?: boolean | null;
    } | null;
  } | null;
  data?: {
    vendor_data?: string;
    status?: string;
    decision?: {
      status?: string;
      reason?: string | null;
    } | null;
    result?: {
      face_match?: {
        score?: number | null;
      } | null;
      liveness?: {
        passed?: boolean | null;
      } | null;
    } | null;
  } | null;
};

function safeCompare(a: string, b: string) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");

  if (aBuf.length !== bBuf.length) return false;

  return crypto.timingSafeEqual(aBuf, bBuf);
}

function signHex(secret: string, value: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(
    ([a], [b]) => a.localeCompare(b),
  );

  return `{${entries
    .map(([key, val]) => `${JSON.stringify(key)}:${stableStringify(val)}`)
    .join(",")}}`;
}

function verifyDiditSignature(
  rawBody: string,
  parsedBody: DiditWebhookPayload,
  headers: Headers,
) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing DIDIT_WEBHOOK_SECRET");
  }

  const signatureV2 = headers.get("x-signature-v2");
  const signatureSimple = headers.get("x-signature-simple");
  const signatureRaw = headers.get("x-signature");

  // 1) Recommended by Didit: X-Signature-V2
  if (signatureV2) {
    const canonicalBody = stableStringify(parsedBody);
    const expected = signHex(secret, canonicalBody);

    if (safeCompare(signatureV2, expected)) {
      return { ok: true as const, method: "x-signature-v2" };
    }
  }

  // 2) Fallback: X-Signature-Simple
  if (signatureSimple) {
    const sessionId = parsedBody.session_id ?? "";
    const status =
      parsedBody.status ??
      parsedBody.decision?.status ??
      parsedBody.data?.status ??
      parsedBody.data?.decision?.status ??
      "";
    const webhookType = parsedBody.webhook_type ?? "";

    const simplePayload = `${Date.now()}:${sessionId}:${status}:${webhookType}`;
    // Keep disabled by default because timestamp source must match Didit's exact payload/header.
    // Left here as a future fallback once you inspect your real test webhook payload/headers.

    void simplePayload;
  }

  // 3) Raw body HMAC
  if (signatureRaw) {
    const expected = signHex(secret, rawBody);

    if (safeCompare(signatureRaw, expected)) {
      return { ok: true as const, method: "x-signature" };
    }
  }

  return { ok: false as const, method: null };
}

function mapDiditStatusToKycStatus(payload: DiditWebhookPayload) {
  const status =
    payload.status ??
    payload.decision?.status ??
    payload.data?.status ??
    payload.data?.decision?.status ??
    "";

  const normalized = status.toLowerCase();

  if (["approved", "verified", "success", "completed"].includes(normalized)) {
    return "VERIFIED" as const;
  }

  if (
    [
      "declined",
      "failed",
      "rejected",
      "error",
      "cancelled",
      "canceled",
    ].includes(normalized)
  ) {
    return "REJECTED" as const;
  }

  return "PENDING_REVIEW" as const;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const parsedBody = JSON.parse(rawBody) as DiditWebhookPayload;

    const verification = verifyDiditSignature(rawBody, parsedBody, req.headers);

    if (!verification.ok) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const vendorData =
      parsedBody.vendor_data ?? parsedBody.data?.vendor_data ?? null;

    const providerSessionId = parsedBody.session_id ?? null;

    if (!vendorData) {
      return NextResponse.json(
        {
          received: false,
          message: "Missing vendor_data in Didit webhook payload",
        },
        { status: 400 },
      );
    }

    const investor = await prisma.investorProfile.findUnique({
      where: { userId: vendorData },
      select: { id: true },
    });

    if (!investor) {
      return new NextResponse("User not found", { status: 404 });
    }

    const finalStatus = mapDiditStatusToKycStatus(parsedBody);

    const faceMatchScore =
      parsedBody.result?.face_match?.score ??
      parsedBody.data?.result?.face_match?.score ??
      null;

    const livenessPassed =
      parsedBody.result?.liveness?.passed ??
      parsedBody.data?.result?.liveness?.passed ??
      null;

    const failureReason =
      finalStatus === "REJECTED"
        ? (parsedBody.decision?.reason ??
          parsedBody.data?.decision?.reason ??
          "verification_failed")
        : null;

    await prisma.kYCVerification.upsert({
      where: { investorProfileId: investor.id },
      update: {
        providerSessionId: providerSessionId ?? undefined,
        vendorData,
        status: finalStatus,
        faceMatchScore:
          typeof faceMatchScore === "number" ? faceMatchScore : null,
        livenessPassed:
          typeof livenessPassed === "boolean" ? livenessPassed : null,
        verifiedAt: finalStatus === "VERIFIED" ? new Date() : null,
        failureReason,
      },
      create: {
        investorProfileId: investor.id,
        providerSessionId: providerSessionId ?? undefined,
        vendorData,
        status: finalStatus,
        faceMatchScore:
          typeof faceMatchScore === "number" ? faceMatchScore : null,
        livenessPassed:
          typeof livenessPassed === "boolean" ? livenessPassed : null,
        verifiedAt: finalStatus === "VERIFIED" ? new Date() : null,
        failureReason,
      },
    });

    await prisma.investorProfile.update({
      where: { id: investor.id },
      data: {
        kycStatus: finalStatus,
      },
    });

    await pusherServer.trigger(`kyc-${vendorData}`, "kyc-status-updated", {
      userId: vendorData,
      investorProfileId: investor.id,
      status: finalStatus,
      providerSessionId,
    });

    return NextResponse.json({
      received: true,
      verificationMethod: verification.method,
    });
  } catch (error) {
    console.error("Didit webhook error:", error);

    return NextResponse.json(
      {
        received: false,
        message: "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
