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
  managementSchema,
  normalizeManagementValues,
} from "@/lib/zodValidations/management";
import { ManagementFormActionState } from "./managementForm.state";
import { revalidatePath } from "next/cache";

/* ---------------- ACTION ---------------- */
export async function createManagement(
  _: ManagementFormActionState,
  formData: FormData,
): Promise<ManagementFormActionState> {
  try {
    await requireSuperAdminAccess();

    const parsed = managementSchema.safeParse({
      name: formData.get("name"),
      title: formData.get("title"),
      role: formData.get("role"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      bio: formData.get("bio"),
      photoFileId: formData.get("photoFileId"),
      isActive: formData.get("isActive") === "true",
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    });

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please review the highlighted profile fields.",
      );
    }

    const values = normalizeManagementValues(parsed.data);

    await prisma.management.create({
      data: values,
    });

    revalidatePath("/account/dashboard/super-admin/management");

    return createSuccessFormState("Management profile created");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(
        error,
        "Unable to create the management profile right now.",
      ),
    );
  }
}
