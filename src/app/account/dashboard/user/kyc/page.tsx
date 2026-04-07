import { getCurrentUser } from "@/lib/getCurrentUser";
import KYCSection from "./_components/KYCSection";
import KYCVerifiedCard from "./_components/KYCVerifiedCard";

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) return null;

  const kycStatus = user.investorProfile?.kycStatus ?? "NOT_STARTED";

  console.log("KYC Status:", kycStatus);

  console.log("USER ID:", user.id);

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
        <KYCVerifiedCard name={user.name} />
      ) : (
        <KYCSection initialStatus={kycStatus} userId={user.id} />
      )}
    </div>
  );
}
