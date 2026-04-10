import { getUserPaymentMethods } from "@/actions/accounts/payments/getUserPaymentMethods";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import PaymentInfoClient from "../_components/PaymentInfoClient";
import { getCurrentUserId } from "@/lib/getCurrentUser";
export default async function Page() {
  const userId = await getCurrentUserId();

  if (!userId) return null;

  const [methods, profile] = await Promise.all([
    getUserPaymentMethods(),
    prisma.investorProfile.findUnique({
      where: { userId: userId },
      select: {
        kycStatus: true,
      },
    }),
  ]);

  return (
    <PaymentInfoClient
      initialMethods={methods}
      kycStatus={profile?.kycStatus ?? "NOT_STARTED"}
    />
  );
}
