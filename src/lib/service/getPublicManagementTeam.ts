import { prisma } from "@/lib/prisma";

export async function getPublicManagementTeam() {
  return prisma.management.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      title: true,
      role: true,
      bio: true,
      photoFile: {
        select: {
          url: true,
        },
      },
    },
    take: 3,
  });
}
