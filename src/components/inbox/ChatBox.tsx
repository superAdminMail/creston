"use client";

import { useState } from "react";
import { ChatMessage } from "@/lib/types/chat.types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useConversationPresence } from "@/hooks/useConversationPresence";
import { useConversationMessages } from "@/hooks/useConversationMessages";

type PresenceRole = "ADMIN" | "MODERATOR" | "SUPER_ADMIN" | "USER";

type Props = {
  conversationId: string;
  initialMessages: ChatMessage[];
  title: string;
  subtitle?: string;
  forceOnline?: boolean;
  presenceTargetRoles?: PresenceRole[];
  onOpenMenu?: () => void;
  onPreviewUpdate?: (payload: {
    content: string;
    senderType: ChatMessage["senderType"];
    createdAt: string;
  }) => void;
};

function isIncomingMessage(message: ChatMessage) {
  return message.senderType === "SUPPORT" || message.senderType === "SYSTEM";
}

function isOwnMessage(message: ChatMessage) {
  return message.senderType === "USER";
}

export default function ChatBox({
  conversationId,
  initialMessages,
  title,
  subtitle,
  forceOnline,
  presenceTargetRoles,
  onOpenMenu,
  onPreviewUpdate,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const { online, typing, lastSeenAt } = useConversationPresence(
    conversationId,
    {
      targetRoles: presenceTargetRoles,
      selfUserId: null,
    },
  );

  useConversationMessages({
    conversationId,
    onMessage: async (message) => {
      setMessages((prev) => {
        if (prev.find((current) => current.id === message.id)) return prev;
        return [...prev, message];
      });

      onPreviewUpdate?.({
        content: message.content,
        senderType: message.senderType,
        createdAt: message.createdAt,
      });

      if (isIncomingMessage(message)) {
        await fetch("/api/messages/delivered", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        }).catch(() => {});

        await fetch("/api/messages/seen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId }),
        }).catch(() => {});
      }
    },
    onDelivered: ({ deliveredAt }) => {
      setMessages((prev) =>
        prev.map((message) =>
          isOwnMessage(message) && !message.deliveredAt
            ? { ...message, deliveredAt }
            : message,
        ),
      );
    },
    onSeen: ({ readAt }) => {
      setMessages((prev) =>
        prev.map((message) =>
          isOwnMessage(message) && !message.readAt
            ? { ...message, readAt }
            : message,
        ),
      );
    },
  });

  return (
    <div className="flex h-full min-h-0 flex-col justify-between overflow-hidden bg-background py-4">
      {/* { <button onClick={onOpenMenu} className="text-white">
        Back
      </button>} */}
      <div className="shrink-0">
        <ChatHeader
          title={title}
          subtitle={subtitle}
          online={forceOnline ? true : online}
          lastSeenAt={forceOnline ? null : lastSeenAt}
          showMenuButton
          onMenuToggle={onOpenMenu}
        />
      </div>

      <MessageList
        messages={messages}
        typing={typing}
        viewerSenderType="USER"
      />

      <div className="shrink-0">
        <ChatInput
          conversationId={conversationId}
          onPreviewUpdate={onPreviewUpdate}
        />
      </div>
    </div>
  );
}
