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
  testimonySchema,
} from "@/lib/zodValidations/testimony";
import { TestimonyFormActionState } from "./testimonyForm.state";

export async function createTestimony(
  _: TestimonyFormActionState,
  formData: FormData,
): Promise<TestimonyFormActionState> {
  try {
    await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

    const parsed = testimonySchema.safeParse({
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

    await prisma.testimony.create({
      data: values,
    });

    revalidatePath("/account/dashboard/admin/testimonies");
    revalidatePath("/");

    return createSuccessFormState("Testimony created");
  } catch (error) {
    return createErrorFormState(
      getFriendlyServerError(error, "Unable to create the testimony right now."),
    );
  }
}
