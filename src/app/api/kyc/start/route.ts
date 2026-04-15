import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "Missing userId" }, { status: 400 });
    }

    const investor = await prisma.investorProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        kycStatus: true,
      },
    });

    if (!investor) {
      return NextResponse.json(
        { message: "Investor not found" },
        { status: 404 },
      );
    }

    if (investor.kycStatus === "PENDING_REVIEW") {
      return NextResponse.json(
        { message: "Verification already in progress" },
        { status: 409 },
      );
    }

    const callbackBase =
      process.env.NEXT_PUBLIC_APP_URL || process.env.APP_BASE_URL;

    const callbackUrl = callbackBase
      ? `${callbackBase.replace(/\/$/, "")}/api/webhooks/didit`
      : undefined;

    const diditRes = await fetch("https://verification.didit.me/v3/session/", {
      method: "POST",
      headers: {
        "x-api-key": process.env.DIDIT_API_KEY!,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        workflow_id: process.env.DIDIT_WORKFLOW_ID,
        vendor_data: userId,
        ...(callbackUrl ? { callback: callbackUrl } : {}),
      }),
    });

    const rawText = await diditRes.text();
    let data: Record<string, unknown> | null = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { raw: rawText };
    }

    if (!diditRes.ok) {
      return NextResponse.json(
        {
          message: "Failed to create Didit session",
          diditStatus: diditRes.status,
          diditResponse: data,
        },
        { status: 502 },
      );
    }

    const sessionId =
      typeof data?.session_id === "string" ? data.session_id : null;
    const verificationUrl = typeof data?.url === "string" ? data.url : null;

    if (!sessionId || !verificationUrl) {
      return NextResponse.json(
        {
          message: "Didit returned an unexpected response",
          diditResponse: data,
        },
        { status: 502 },
      );
    }

    await prisma.kYCVerification.upsert({
      where: { investorProfileId: investor.id },
      update: {
        providerSessionId: sessionId,
        vendorData: userId,
        status: "PENDING_REVIEW",
        failureReason: null,
        verifiedAt: null,
      },
      create: {
        investorProfileId: investor.id,
        providerSessionId: sessionId,
        vendorData: userId,
        status: "PENDING_REVIEW",
      },
    });

    await prisma.investorProfile.update({
      where: { id: investor.id },
      data: {
        kycStatus: "PENDING_REVIEW",
      },
    });

    return NextResponse.json({
      url: verificationUrl,
      sessionId,
    });
  } catch (error) {
    console.error("Didit start KYC error:", error);

    return NextResponse.json(
      { message: "Unable to start verification" },
      { status: 500 },
    );
  }
}
