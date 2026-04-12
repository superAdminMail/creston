"use server";

import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";

export async function getTestimonies() {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  return prisma.testimony.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      roleOrTitle: true,
      message: true,
      rating: true,
      isFeatured: true,
      status: true,
      avatarFileId: true,
      sortOrder: true,
      publishedAt: true,
      avatarFile: {
        select: {
          url: true,
        },
      },
    },
  });
}
