"use server";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";

export async function getManagementList() {
  await requireSuperAdminAccess();

  return prisma.management.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      title: true,
      role: true,
      isActive: true,
      sortOrder: true,
      photoFile: {
        select: {
          url: true,
        },
      },
    },
  });
}
