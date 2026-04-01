"use server";

import { getCurrentUser } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function skipOnboardingAction() {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      hasCompletedOnboarding: true,
      skippedOnboardingAt: new Date(),
    },
  });

  return { success: true };
}
