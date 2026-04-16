import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import {
  createDiditSession,
  isDiditActiveStatus,
  isDiditRetryableStatus,
  isDiditSessionStale,
} from "@/lib/kyc/didit";
import {
  createLocalKycVerificationSession,
  getLatestKycVerificationSession,
} from "@/lib/kyc/kycVerificationSessionService";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:3000"
  );
}

export async function POST() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.investorProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        kycStatus: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Investor profile not found" },
        { status: 404 },
      );
    }

    if (profile.kycStatus === "VERIFIED") {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }

    const latestSession = await getLatestKycVerificationSession(profile.id);

    if (
      latestSession &&
      latestSession.sessionUrl &&
      isDiditActiveStatus(latestSession.status) &&
      !isDiditSessionStale(latestSession.updatedAt)
    ) {
      return NextResponse.json({
        url: latestSession.sessionUrl,
        reused: true,
      });
    }

    if (
      latestSession &&
      (isDiditRetryableStatus(latestSession.status) ||
        (isDiditActiveStatus(latestSession.status) &&
          isDiditSessionStale(latestSession.updatedAt)))
    ) {
      await prisma.kycVerificationSession.update({
        where: { id: latestSession.id },
        data: {
          status: isDiditSessionStale(latestSession.updatedAt)
            ? "Abandoned"
            : latestSession.status,
          abandonedAt: new Date(),
          lastSyncedAt: new Date(),
        },
      });

      await prisma.investorProfile.update({
        where: { id: profile.id },
        data: { kycStatus: "NOT_STARTED" },
      });
    }

    const callbackUrl = `${getBaseUrl()}/account/dashboard/verification`;

    const diditSession = await createDiditSession({
      vendorData: userId,
      callbackUrl,
    });

    await createLocalKycVerificationSession({
      investorProfileId: profile.id,
      providerSessionId: diditSession.session_id,
      sessionUrl: diditSession.url,
      callbackUrl,
      rawPayload: diditSession,
    });

    return NextResponse.json({
      url: diditSession.url,
      reused: false,
    });
  } catch (error) {
    console.error("[KYC_START_ROUTE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to start verification" },
      { status: 500 },
    );
  }
}
