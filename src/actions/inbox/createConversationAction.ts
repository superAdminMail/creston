"use server";

import { prisma } from "@/lib/prisma";
import { SenderType } from "@/generated/prisma/client";
import {
  persistConversationMessage,
  processConversationMessageAfterWrite,
} from "@/lib/inbox/conversationService";
import { getCurrentUserId } from "@/lib/getCurrentUser";

export async function createConversationAction({
  subject,
  message,
}: {
  subject?: string;
  message: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Unauthorized" };

  const cleanMessage = message.trim();
  if (!cleanMessage) return { error: "Message cannot be empty" };

  const conversation = await prisma.$transaction(async (tx) => {
    const createdConversation = await tx.conversation.create({
      data: {
        type: "SUPPORT",
        status: "OPEN",
        subject: subject?.trim() || "Support Ticket",
        members: {
          create: {
            userId,
          },
        },
      },
      select: {
        id: true,
        subject: true,
      },
    });

    await persistConversationMessage(tx, {
      conversationId: createdConversation.id,
      senderType: SenderType.SYSTEM,
      content:
        "Hello. I'm your AI Assistant. A support agent will assist you shortly.",
    });

    const createdUserMessage = await persistConversationMessage(tx, {
      conversationId: createdConversation.id,
      senderType: SenderType.USER,
      content: cleanMessage,
    });

    const messages = await tx.message.findMany({
      where: { conversationId: createdConversation.id },
      orderBy: { createdAt: "asc" },
    });

    return {
      ...createdConversation,
      createdUserMessage,
      messages,
    };
  });

  await processConversationMessageAfterWrite(conversation.createdUserMessage);

  return {
    ok: true,
    conversation: {
      id: conversation.id,
      subject: conversation.subject,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        conversationId: conversation.id,
        senderType: m.senderType,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        deliveredAt: m.deliveredAt?.toISOString() ?? null,
      })),
    },
  };
}
