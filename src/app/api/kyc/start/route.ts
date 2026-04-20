import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import {
  createDiditSession,
  isDiditRetryableStatus,
  isDiditResumableStatus,
  isDiditSessionStale,
} from "@/lib/kyc/didit";
import {
  createLocalKycVerificationSession,
  syncLatestKycSessionIfNeeded,
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
        isVerified: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Investor profile not found" },
        { status: 404 },
      );
    }

    if (profile.isVerified || profile.kycStatus === "VERIFIED") {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }

    const latestSession = await syncLatestKycSessionIfNeeded(profile.id);

    const refreshedProfile = await prisma.investorProfile.findUnique({
      where: { id: profile.id },
      select: {
        id: true,
        kycStatus: true,
        isVerified: true,
      },
    });

    const latestSessionAgeAnchor =
      latestSession?.lastSyncedAt ?? latestSession?.updatedAt ?? null;

    if (refreshedProfile?.isVerified || refreshedProfile?.kycStatus === "VERIFIED") {
      return NextResponse.json({ error: "Already verified" }, { status: 400 });
    }

    if (
      latestSession &&
      latestSession.sessionUrl &&
      isDiditResumableStatus(latestSession.status) &&
      !isDiditSessionStale(latestSessionAgeAnchor)
    ) {
      return NextResponse.json({
        url: latestSession.sessionUrl,
        reused: true,
      });
    }

    if (latestSession && latestSession.status === "In Review") {
      return NextResponse.json(
        { error: "Verification is currently under review" },
        { status: 409 },
      );
    }

    if (
      latestSession &&
      (isDiditRetryableStatus(latestSession.status) ||
        (isDiditResumableStatus(latestSession.status) &&
          isDiditSessionStale(latestSessionAgeAnchor)))
    ) {
      if (
        isDiditResumableStatus(latestSession.status) &&
        isDiditSessionStale(latestSessionAgeAnchor)
      ) {
        await prisma.kycVerificationSession.update({
          where: { id: latestSession.id },
          data: {
            status: "Abandoned",
            abandonedAt: new Date(),
            lastSyncedAt: new Date(),
          },
        });
      }

      await prisma.investorProfile.update({
        where: { id: refreshedProfile?.id ?? profile.id },
        data: { kycStatus: "NOT_STARTED", isVerified: false },
      });
    }

    const callbackUrl = `${getBaseUrl()}/account/dashboard/user/kyc`;

    const diditSession = await createDiditSession({
      vendorData: userId,
      callbackUrl,
    });

    await createLocalKycVerificationSession({
      investorProfileId: profile.id,
      providerSessionId: diditSession.session_id,
      sessionUrl: diditSession.url,
      callbackUrl,
      status: diditSession.status,
      rawPayload: diditSession.raw,
    });

    return NextResponse.json({
      url: diditSession.url,
      reused: false,
    });
  } catch (error) {
    console.error("[KYC_START_ROUTE_ERROR]", error);

    const message =
      error instanceof Error ? error.message : "Failed to start verification";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
