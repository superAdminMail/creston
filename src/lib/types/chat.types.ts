import {
  ConversationType,
  SenderType,
  UserRole,
} from "@/generated/prisma/client";

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderType: SenderType;
  content: string;
  createdAt: string;
  readAt?: string | null;
  deliveredAt?: string | null;
};

export type InboxPreview = {
  id: string;
  type: ConversationType;
  subject: string | null;
  agentId?: string | null;
  agentName?: string | null;
  participantName?: string | null;
  participantRole?: UserRole | null;

  canDelete?: boolean;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderType: SenderType;
  };
  unreadCount: number;
};

export type NewConversation = {
  id: string;
  subject: string | null;
  messages: ChatMessage[];
};

export type Member = {
  id: string;
  conversationId: string;
  userId: string;
  conversation: string;
};
