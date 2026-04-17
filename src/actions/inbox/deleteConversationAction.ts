"use server";

import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { SUPPORT_CONVERSATION_TYPES } from "@/lib/support/supportConversationService";
import { revalidatePath } from "next/cache";

export async function deleteConversationAction(conversationId: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Unauthorized" };

  const isMember = await prisma.conversationMember.findFirst({
    where: { conversationId, userId },
    select: { id: true },
  });

  if (!isMember) return { error: "Not allowed in this conversation" };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      type: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  if (!conversation) return { error: "Conversation not found" };
  if (
    !SUPPORT_CONVERSATION_TYPES.includes(conversation.type) &&
    conversation._count.members > 1
  ) {
    return { error: "Shared conversations cannot be deleted from the inbox" };
  }

  await prisma.message.deleteMany({
    where: { conversationId },
  });

  await prisma.conversationMember.deleteMany({
    where: { conversationId },
  });

  await prisma.conversation.delete({
    where: { id: conversationId },
  });

  revalidatePath("/account/dashboard/user/support");
  revalidatePath(`/account/dashboard/user/support/${conversationId}`);
  revalidatePath("/account/dashboard/admin/support");
  revalidatePath(`/account/dashboard/admin/support/${conversationId}`);

  return { success: true };
}
