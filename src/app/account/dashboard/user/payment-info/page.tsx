import { getUserPaymentMethods } from "@/actions/accounts/payments/getUserPaymentMethods";
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
      key={methods
        .map((method) => `${method.id}:${method.isDefault ? "1" : "0"}`)
        .join("|")}
      initialMethods={methods}
      kycStatus={profile?.kycStatus ?? "NOT_STARTED"}
    />
  );
}
