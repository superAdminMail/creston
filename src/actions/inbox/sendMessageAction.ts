"use server";

import { prisma } from "@/lib/prisma";
import { createAndProcessConversationMessage } from "@/lib/inbox/conversationService";
import { SenderType } from "@/generated/prisma/client";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function sendMessageAction({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Unauthorized" };

  const text = content.trim();
  if (!text) {
    return { error: "Message cannot be empty" };
  }

  const isMember = await prisma.conversationMember.findFirst({
    where: {
      conversationId,
      userId,
    },
  });

  if (!isMember) {
    return { error: "Not allowed in this conversation" };
  }

  await createAndProcessConversationMessage(
    {
      conversationId,
      senderType: SenderType.USER,
      content: text,
    },
    {
      publish: true,
    },
  );

  return { success: true };
}
