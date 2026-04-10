import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import WithdrawalsClient from "../_components/WithdrawalsClient";

export default async function Page() {
  const userId = await getCurrentUserId();

  if (!userId) return null;

  const profile = await prisma.investorProfile.findUnique({
    where: { userId: userId },
    include: {
      paymentMethods: true,
    },
  });

  // 💰 TODO: replace with real wallet later
  const balance = 2450.75;

  return (
    <WithdrawalsClient
      kycStatus={profile?.kycStatus ?? "NOT_STARTED"}
      paymentMethods={profile?.paymentMethods ?? []}
      balance={balance}
    />
  );
}
