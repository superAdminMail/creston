import { redirect } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";
import { DEFAULT_ONBOARDING_REDIRECT } from "@/routes";

export default async function AccountIndexPage() {
  const sessionUser = await getCurrentSessionUser();

  if (!sessionUser?.id) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      role: true,
      hasCompletedOnboarding: true,
      investorProfile: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  if (
    user.role === "USER" &&
    !user.hasCompletedOnboarding &&
    !user.investorProfile?.id
  ) {
    redirect(DEFAULT_ONBOARDING_REDIRECT);
  }

  redirect(getDashboardHomeByRole(user.role));
}
