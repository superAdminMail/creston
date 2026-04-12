"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";
import {
  normalizeManagementValues,
  updateManagementSchema,
} from "@/lib/zodValidations/management";
import { revalidatePath } from "next/cache";
import { ManagementFormActionState } from "./managementForm.state";

export async function updateManagement(
  _: ManagementFormActionState,
  formData: FormData,
): Promise<ManagementFormActionState> {
  try {
    await requireSuperAdminAccess();

    const managementId = String(formData.get("managementId") ?? "").trim();

    if (!managementId) {
      return createErrorFormState("Missing management profile id.");
    }

    const parsed = updateManagementSchema.safeParse({
      name: formData.get("name"),
      title: formData.get("title"),
      role: formData.get("role"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      bio: formData.get("bio"),
      photoFileId: formData.get("photoFileId"),
      isActive:
        formData.get("isActive") === null
          ? true
          : formData.get("isActive") === "true",
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    });

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please review the highlighted profile fields.",
      );
    }

    const normalizedValues = normalizeManagementValues(parsed.data);

    await prisma.management.update({
      where: { id: managementId },
      data: normalizedValues,
    });

    revalidatePath("/");
    revalidatePath("/account/dashboard/super-admin/management");

    return createSuccessFormState("Management profile updated");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to update the management profile right now.",
      ),
    );
  }
}
