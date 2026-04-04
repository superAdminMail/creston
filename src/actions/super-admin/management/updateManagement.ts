"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import {
  managementSchema,
  normalizeManagementValues,
  UpdateManagementFormInput,
  updateManagementSchema,
} from "@/lib/zodValidations/management";

export async function updateManagement(
  id: string,
  values: UpdateManagementFormInput,
) {
  await requireSuperAdminAccess();

  const parsed = updateManagementSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid input",
    };
  }

  const normalizedValues = normalizeManagementValues(parsed.data);

  await prisma.management.update({
    where: { id },
    data: normalizedValues,
  });

  return {
    status: "success",
    message: "Management updated",
  };
}
