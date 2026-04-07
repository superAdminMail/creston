"use server";

import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function markNotificationRead(notificationId: string) {
  const userId = await getCurrentUserId();

  if (!userId) return;

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      read: true,
    },
  });
}
