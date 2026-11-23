import type { NewConversation } from "@/lib/types/chat.types";
import {
  createSupportParticipant,
  type SupportConversationMessage,
  type SupportConversationPreview,
} from "@/lib/support/supportConversationView";

export function buildNewConversationPreview(
  conversation: NewConversation,
  viewerId: string,
): SupportConversationPreview {
  const lastMessage = conversation.messages.at(-1) ?? null;
  const createdAt = new Date().toISOString();

  const formattedLastMessage: SupportConversationMessage | null = lastMessage
    ? {
        id: lastMessage.id,
        conversationId: lastMessage.conversationId,
        content: lastMessage.content,
        senderId: lastMessage.senderId ?? null,
        senderName: lastMessage.senderName ?? "You",
        senderEmail: lastMessage.senderEmail ?? null,
        senderRole: lastMessage.senderRole ?? "USER",
        senderType: lastMessage.senderType,
        createdAt: lastMessage.createdAt,
        deliveredAt: lastMessage.deliveredAt ?? null,
        readAt: lastMessage.readAt ?? null,
      }
    : null;

  return {
    id: conversation.id,
    ticketId: conversation.ticketId ?? conversation.id,
    type: "SUPPORT",
    status: "OPEN",
    priority: "NORMAL",
    subject: conversation.subject ?? "Support Ticket",
    openedBy: createSupportParticipant({
      id: viewerId,
      name: "You",
      email: null,
      role: "USER",
    }),
    assignedTo: null,
    firstResponder: null,
    lastResponder: null,
    lastMessage: formattedLastMessage,
    unreadCount: 0,
    createdAt,
    updatedAt: createdAt,
    lastMessageAt: formattedLastMessage?.createdAt ?? createdAt,
    source: null,
    isAssignedToMe: false,
    canReply: true,
  };
}
