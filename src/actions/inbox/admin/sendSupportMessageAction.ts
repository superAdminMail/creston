"use server";

import { prisma } from "@/lib/prisma";
import { createAndProcessConversationMessage } from "@/lib/inbox/conversationService";
import { SenderType } from "@/generated/prisma/client";
import { getCurrentUserId, getCurrentUserRole } from "@/lib/getCurrentUser";

export async function sendSupportMessageAction({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}) {
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();
  if (!userId || role !== "ADMIN") return { error: "Unauthorized" };

  const text = content.trim();
  if (!text) return { error: "Message cannot be empty" };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { agentId: true },
  });

  if (!conversation) return { error: "Conversation not found" };
  if (conversation.agentId && conversation.agentId !== userId) {
    return { error: "Assigned to another agent" };
  }

  await createAndProcessConversationMessage(
    {
      conversationId,
      senderType: SenderType.SUPPORT,
      content: text,
    },
    {
      publish: true,
    },
  );

  return { success: true };
}
