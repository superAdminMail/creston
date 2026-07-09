"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { prisma } from "@/lib/prisma";

export type SuperAdminNotificationCleanupMode = "selected" | "all";

export async function clearSuperAdminNotifications(input: {
  mode: SuperAdminNotificationCleanupMode;
  notificationIds?: string[];
}) {
  await requireSuperAdminAccess();

  const mode = input.mode;
  const notificationIds =
    input.notificationIds
      ?.map((id) => id.trim())
      .filter(Boolean) ?? [];

  if (mode === "selected" && notificationIds.length === 0) {
    return {
      error: "Select at least one notification before clearing it.",
    };
  }

  try {
    const result =
      mode === "all"
        ? await prisma.notification.deleteMany()
        : await prisma.notification.deleteMany({
            where: {
              id: {
                in: notificationIds,
              },
            },
          });

    revalidatePath("/account/dashboard/super-admin/system-health");
    revalidatePath("/account/dashboard/notifications");

    return {
      success: true,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error("Failed to clear super admin notifications", error);

    return {
      error: "Unable to clear notifications right now.",
    };
  }
}
