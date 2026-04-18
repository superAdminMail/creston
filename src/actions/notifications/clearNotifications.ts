"use server";

import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function clearNotifications(notificationIds: string[]) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { error: "Not authenticated" };
  }

  const uniqueIds = [...new Set(notificationIds.map((id) => id.trim()).filter(Boolean))];

  if (!uniqueIds.length) {
    return { error: "No notifications selected" };
  }

  const result = await prisma.notification.deleteMany({
    where: {
      id: { in: uniqueIds },
      userId,
    },
  });

  return { success: true, deletedCount: result.count };
}
