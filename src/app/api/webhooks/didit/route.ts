import crypto from "crypto";
import { NextResponse } from "next/server";
import { markKycVerificationSessionStatus } from "@/lib/kyc/kycVerificationSessionService";
import { pusherServer } from "@/lib/pusher";

function verifyDiditSignature(rawBody: string, signature: string | null) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-signature-v2") || req.headers.get("x-didit-signature");

    if (!verifyDiditSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      session_id?: string;
      status?: string;
    };

    if (!payload.session_id || !payload.status) {
      return NextResponse.json(
        { error: "Missing session_id or status" },
        { status: 400 },
      );
    }

    const session = await markKycVerificationSessionStatus({
      providerSessionId: payload.session_id,
      status: payload.status,
      rawPayload: payload,
    });

    await pusherServer.trigger(
      `kyc-${session.investorProfile.userId}`,
      "kyc-status-updated",
      {
        status: session.investorProfile.kycStatus,
        providerStatus: payload.status,
      },
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DIDIT_WEBHOOK_ERROR]", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
