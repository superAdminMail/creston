import { prisma } from "@/lib/prisma";
import KYCSection from "./_components/KYCSection";
import KYCVerifiedCard from "./_components/KYCVerifiedCard";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { syncLatestKycSessionIfNeeded } from "@/lib/kyc/kycVerificationSessionService";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export default async function Page() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName ?? "";

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      investorProfile: {
        select: {
          id: true,
          kycStatus: true,
        },
      },
    },
  });

  if (!user) return null;

  const profile = user.investorProfile;

  const latestSession = profile
    ? await syncLatestKycSessionIfNeeded(profile.id)
    : null;

  const refreshedProfile = profile
    ? await prisma.investorProfile.findUnique({
        where: { id: profile.id },
        select: {
          kycStatus: true,
        },
      })
    : null;

  const kycStatus = refreshedProfile?.kycStatus ?? profile?.kycStatus ?? "NOT_STARTED";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white/90 dark:text-gray-300">
          Identity Verification
        </h1>
        <p className="text-sm text-muted-foreground">
          Complete your KYC to unlock full access to your account.
        </p>
      </header>

      {kycStatus === "VERIFIED" ? (
        <KYCVerifiedCard name={user.name} siteName={siteName} />
      ) : (
        <KYCSection
          initialStatus={kycStatus}
          userId={user.id}
          latestSession={latestSession}
        />
      )}
    </div>
  );
}
