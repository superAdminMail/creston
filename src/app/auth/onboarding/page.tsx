import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      hasCompletedOnboarding: true,
      investorProfile: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  if (user.investorProfile || user.hasCompletedOnboarding) {
    redirect("/account/dashboard");
  }

  return <OnboardingDialog userName={user.name} />;
}
