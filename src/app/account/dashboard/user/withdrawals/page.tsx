import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { getWithdrawalSourceOptions } from "@/lib/service/getAvailableWithdrawalSource";
import WithdrawalsClient from "../_components/WithdrawalsClient";

export default async function Page() {
  const userId = await getCurrentUserId();

  if (!userId) return null;

  const profile = await prisma.investorProfile.findUnique({
    where: { userId },
    include: {
      paymentMethods: true,
    },
  });

  const withdrawalSources = profile?.id
    ? await getWithdrawalSourceOptions(profile.id)
    : [];

  return (
    <WithdrawalsClient
      kycStatus={profile?.kycStatus ?? "NOT_STARTED"}
      paymentMethods={profile?.paymentMethods ?? []}
      withdrawalSources={withdrawalSources}
    />
  );
}
