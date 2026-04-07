import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await req.json();

  const investor = await prisma.investorProfile.findUnique({
    where: { userId },
  });

  if (!investor) throw new Error("Investor not found");

  const res = await fetch("https://api.didit.me/v1/verification/session", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DIDIT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workflowId: process.env.DIDIT_WORKFLOW_ID,
      vendorData: userId,
    }),
  });

  const data = await res.json();

  await prisma.kYCVerification.upsert({
    where: { investorProfileId: investor.id },
    update: {
      providerSessionId: data.session_id,
      status: "PENDING_REVIEW",
    },
    create: {
      investorProfileId: investor.id,
      providerSessionId: data.session_id,
      vendorData: userId,
    },
  });

  return NextResponse.json({ url: data.verification_url });
}
