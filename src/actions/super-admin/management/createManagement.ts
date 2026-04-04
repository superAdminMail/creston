"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import {
  ManagementFormInput,
  managementSchema,
  normalizeManagementValues,
} from "@/lib/zodValidations/management";

export async function createManagement(values: ManagementFormInput) {
  await requireSuperAdminAccess();

  const parsed = managementSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Invalid input",
    };
  }

  const normalizedValues = normalizeManagementValues(parsed.data);

  await prisma.management.create({
    data: normalizedValues,
  });

  return {
    status: "success",
    message: "Management profile created",
  };
}
