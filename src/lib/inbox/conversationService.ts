"use server";

import {
  SenderType,
  type Prisma,
  type PrismaClient,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
//import { moderateMessageAfterCreate } from "@/lib/moderation/messageModeration";
import { pusherServer } from "@/lib/pusher";

export type RealtimeMessagePayload = {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string | null;
  content: string;
  createdAt: string;
};

type MessageWriter = Prisma.TransactionClient | PrismaClient;
type PersistedConversationMessage = {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string | null;
  content: string;
  createdAt: Date;
};

export async function persistConversationMessage(
  db: MessageWriter,
  input: {
    conversationId: string;
    senderType: SenderType;
    senderId?: string | null;
    content: string;
  },
) {
  const message = await db.message.create({
    data: {
      conversationId: input.conversationId,
      senderId: input.senderId ?? null,
      senderType: input.senderType,
      content: input.content.trim(),
    },
  });

  const unreadRecipientRole = input.senderType === SenderType.USER ? "SUPPORT" : "USER";

  await db.conversation.update({
    where: { id: input.conversationId },
    data: {
      lastMessageAt: message.createdAt,
    },
  });

  await db.conversationMember.updateMany({
    where: {
      conversationId: input.conversationId,
      role: unreadRecipientRole,
    },
    data: {
      unreadCount: {
        increment: 1,
      },
    },
  });

  return message;
}

export async function processConversationMessageAfterWrite(
  message: PersistedConversationMessage,
  options?: {
    publish?: boolean;
  },
) {
  if (options?.publish) {
    await publishConversationMessage(message);
  }

  // try {
  //   // Moderation can reach external AI, so it must stay outside tx-capable writes.
  //   await moderateMessageAfterCreate(prisma, message);
  // } catch (error) {
  //   console.error("Message moderation failed", {
  //     messageId: message.id,
  //     conversationId: message.conversationId,
  //     error,
  //   });
  // }

  return message;
}

export async function createAndProcessConversationMessage(
  input: {
    conversationId: string;
    senderType: SenderType;
    senderId?: string | null;
    content: string;
  },
  options?: {
    publish?: boolean;
  },
) {
  const message = await persistConversationMessage(prisma, input);
  return processConversationMessageAfterWrite(message, options);
}

function toRealtimeMessagePayload(message: {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string | null;
  content: string;
  createdAt: Date;
}): RealtimeMessagePayload {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderType: message.senderType,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function publishConversationMessage(message: {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderId: string | null;
  content: string;
  createdAt: Date;
}) {
  await pusherServer.trigger(
    `private-conversation-${message.conversationId}`,
    "new-message",
    toRealtimeMessagePayload(message),
  );
}
