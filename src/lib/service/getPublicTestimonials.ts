import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type PublicTestimonyViewModel = {
  id: string;
  quote: string;
  name: string;
  role: string;
  organization: string;
  avatarUrl: string | null;
};

export const getPublicTestimonials = cache(
  async (): Promise<PublicTestimonyViewModel[]> => {
    const testimonies = await prisma.testimony.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: [
        { isFeatured: "desc" },
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        fullName: true,
        roleOrTitle: true,
        message: true,
        avatarFile: {
          select: {
            url: true,
          },
        },
      },
    });

    return testimonies.map((testimony) => ({
      id: testimony.id,
      quote: testimony.message,
      name: testimony.fullName,
      role: testimony.roleOrTitle ?? "Client",
      organization: "Verified Client",
      avatarUrl: testimony.avatarFile?.url ?? null,
    }));
  },
);
