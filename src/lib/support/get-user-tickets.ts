import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "../getCurrentSessionUser";

export async function getUserSupportTickets() {
  const user = await getCurrentSessionUser();

  if (!user?.id) return [];

  const tickets = await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
      type: "SUPPORT",
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return tickets;
}
