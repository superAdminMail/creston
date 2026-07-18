"use server";

import { revalidatePath } from "next/cache";

import { deleteFileAssetAction } from "@/actions/files/file";
import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

export async function deleteTestimony(formData: FormData): Promise<void> {
  try {
    await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

    const testimonyId = String(formData.get("testimonyId") ?? "").trim();

    if (!testimonyId) {
      throw new Error("Missing testimony id.");
    }

    const testimony = await prisma.testimony.findUnique({
      where: { id: testimonyId },
      select: {
        id: true,
        avatarFileId: true,
        videoFileId: true,
      },
    });

    if (!testimony) {
      throw new Error("Testimony not found.");
    }

    await prisma.testimony.delete({
      where: { id: testimony.id },
    });

    for (const fileAssetId of [testimony.avatarFileId, testimony.videoFileId]) {
      if (!fileAssetId) continue;

      const deletion = await deleteFileAssetAction(fileAssetId);
      if (deletion.error) {
        console.error("testimony file cleanup failed:", deletion.error);
      }
    }

    revalidatePath("/account/dashboard/admin/testimonies");
    revalidatePath("/");
  } catch (error) {
    console.error("deleteTestimony error:", error);
  }
}
