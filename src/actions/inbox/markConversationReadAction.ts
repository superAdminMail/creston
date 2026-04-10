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

  await prisma.message.updateMany({
    where: {
      conversationId,
      OR: [
        { senderId: { not: userId } },
        { senderId: null, senderType: { in: ["SUPPORT", "SYSTEM"] } },
      ],
    },
    data: {
      readAt: new Date(),
    },
  });
}
