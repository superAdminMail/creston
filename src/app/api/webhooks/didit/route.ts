import { NextResponse } from "next/server";
import { markKycVerificationSessionStatus } from "@/lib/kyc/kycVerificationSessionService";
import { verifyDiditWebhookSignature } from "@/lib/kyc/didit";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let payload: {
      session_id?: string;
      status?: string;
      webhook_type?: string;
      timestamp?: string;
    };

    try {
      payload = JSON.parse(rawBody) as typeof payload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const timestamp =
      req.headers.get("x-timestamp") ?? payload.timestamp ?? null;
    const signatureV2 = req.headers.get("x-signature-v2");
    const signatureSimple = req.headers.get("x-signature-simple");
    const signatureRaw = req.headers.get("x-signature");

    if (
      !verifyDiditWebhookSignature({
        rawBody,
        parsedBody: payload,
        signatureV2,
        signatureSimple,
        signatureRaw,
        timestamp,
      })
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (!payload.session_id || !payload.status) {
      return NextResponse.json(
        { error: "Missing session_id or status" },
        { status: 400 },
      );
    }

    console.log("[DIDIT_WEBHOOK_RECEIVED]", {
      sessionId: payload.session_id,
      status: payload.status,
      webhookType: payload.webhook_type ?? null,
    });

    const result = await markKycVerificationSessionStatus({
      providerSessionId: payload.session_id,
      status: payload.status,
      rawPayload: payload,
    });

    console.log("[DIDIT_WEBHOOK_FINALIZED]", {
      sessionId: payload.session_id,
      providerStatus: result.providerStatus,
      appStatus: result.appStatus,
      sessionUpdated: result.sessionUpdated,
      profileUpdated: result.profileUpdated,
      changed: result.changed,
    });

    if (result.changed) {
      await pusherServer.trigger(
        `private-kyc-${result.session.investorProfile.userId}`,
        "kyc-status-updated",
        {
          status: result.session.investorProfile.kycStatus,
          profileIsVerified: result.session.investorProfile.isVerified,
          providerStatus: payload.status,
        },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DIDIT_WEBHOOK_ERROR]", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
