export const runtime = "nodejs";

import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-didit-signature")!;
  const expected = crypto
    .createHmac("sha256", process.env.DIDIT_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (signature !== expected) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(rawBody);

  const { vendorData, status, result } = body;

  const faceMatchScore = result?.faceMatch?.score;
  const livenessPassed = result?.liveness?.passed;

  const finalStatus = status === "approved" ? "VERIFIED" : "REJECTED";

  const investor = await prisma.investorProfile.findUnique({
    where: { userId: vendorData },
  });

  if (!investor) return new Response("User not found", { status: 404 });

  await prisma.kYCVerification.update({
    where: { investorProfileId: investor.id },
    data: {
      status: finalStatus,
      faceMatchScore,
      livenessPassed,
      verifiedAt: finalStatus === "VERIFIED" ? new Date() : null,
      failureReason: finalStatus === "REJECTED" ? "face_mismatch" : null,
    },
  });

  await prisma.investorProfile.update({
    where: { id: investor.id },
    data: { kycStatus: finalStatus },
  });

  return NextResponse.json({ received: true });
}
