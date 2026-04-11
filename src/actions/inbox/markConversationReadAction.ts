"use server";

import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function markConversationReadAction(conversationId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const isMember = await prisma.conversationMember.findFirst({
    where: { conversationId, userId },
    select: { id: true },
  });

  if (!isMember) return;

  const now = new Date();

  await prisma.$transaction([
    prisma.message.updateMany({
      where: {
        conversationId,
        senderType: {
          in: ["SUPPORT", "SYSTEM"],
        },
      },
      data: {
        deliveredAt: now,
      },
    }),
    prisma.conversationMember.updateMany({
      where: { conversationId, userId },
      data: {
        lastReadAt: now,
        unreadCount: 0,
      },
    }),
  ]);
}
