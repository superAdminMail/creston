"use server";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";

export async function skipOnboardingAction() {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      hasCompletedOnboarding: false,
      skippedOnboardingAt: new Date(),
    },
  });

  return { success: true };
}
