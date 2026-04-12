"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import {
  createErrorFormState,
  createSuccessFormState,
  createValidationErrorState,
  getFriendlyServerError,
} from "@/lib/forms/actionState";
import {
  normalizeTestimonyValues,
  updateTestimonySchema,
} from "@/lib/zodValidations/testimony";
import { TestimonyFormActionState } from "./testimonyForm.state";

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
      sortOrder: formData.get("sortOrder"),
    });

    if (!parsed.success) {
      return createValidationErrorState(
        parsed.error.flatten().fieldErrors,
        "Please review the highlighted testimony fields.",
      );
    }

    const values = normalizeTestimonyValues(parsed.data);

    await prisma.testimony.update({
      where: { id: parsed.data.testimonyId },
      data: values,
    });

    revalidatePath("/account/dashboard/admin/testimonies");
    revalidatePath("/");

    return createSuccessFormState("Testimony updated");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(error, "Unable to update the testimony right now."),
    );
  }
}
