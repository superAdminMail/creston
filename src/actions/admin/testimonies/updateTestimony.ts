"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import {
  createErrorFormState,
  createValidationErrorState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";
import {
  normalizeTestimonyValues,
  updateTestimonySchema,
} from "@/lib/zodValidations/testimony";
import { TestimonyFormActionState } from "./testimonyForm.state";
import { deleteFileAssetAction } from "@/actions/files/file";

export async function updateTestimony(
  _: TestimonyFormActionState,
  formData: FormData,
): Promise<TestimonyFormActionState> {
  try {
    await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

    const parsed = updateTestimonySchema.safeParse({
      testimonyId: formData.get("testimonyId"),
      fullName: formData.get("fullName"),
      roleOrTitle: formData.get("roleOrTitle"),
      message: formData.get("message"),
      rating: formData.get("rating"),
      isFeatured: formData.get("isFeatured") === "true",
      status: formData.get("status"),
      avatarFileId: formData.get("avatarFileId"),
      videoFileId: formData.get("videoFileId"),
      sortOrder: formData.get("sortOrder"),
    });

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please review the highlighted testimony fields.",
      );
    }

    const values = normalizeTestimonyValues(parsed.data);
    const previousTestimony = await prisma.testimony.findUnique({
      where: { id: parsed.data.testimonyId },
      select: {
        avatarFileId: true,
        videoFileId: true,
      },
    });

    if (!previousTestimony) {
      return createErrorFormState("The requested testimony could not be found.");
    }

    await prisma.testimony.update({
      where: { id: parsed.data.testimonyId },
      data: values,
    });

    const cleanupTargets = [
      previousTestimony.avatarFileId &&
        previousTestimony.avatarFileId !== values.avatarFileId
        ? previousTestimony.avatarFileId
        : null,
      previousTestimony.videoFileId &&
        previousTestimony.videoFileId !== values.videoFileId
        ? previousTestimony.videoFileId
        : null,
    ].filter((value): value is string => Boolean(value));

    for (const fileAssetId of cleanupTargets) {
      const deletion = await deleteFileAssetAction(fileAssetId);
      if (deletion.error) {
        console.error("testimony file cleanup failed:", deletion.error);
      }
    }

    revalidatePath("/account/dashboard/admin/testimonies");
    revalidatePath("/");

    redirect("/account/dashboard/admin/testimonies");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(error, "Unable to update the testimony right now."),
    );
  }
}
