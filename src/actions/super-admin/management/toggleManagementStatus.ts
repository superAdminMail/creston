"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";

export async function toggleManagementStatus(id: string) {
  await requireSuperAdminAccess();

  const current = await prisma.management.findUnique({
    where: { id },
    select: { isActive: true },
  });

  if (!current) {
    throw new Error("Management not found");
  }

  await prisma.management.update({
    where: { id },
    data: {
      isActive: !current.isActive,
    },
  });

  return { success: true };
}
