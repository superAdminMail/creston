"use client";

import { useEffect, useState } from "react";
import { ChatMessage } from "@/lib/types/chat.types";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import { ChatInput } from "./ChatInput";
import { useConversationPresence } from "@/hooks/useConversationPresence";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { SenderType } from "@/generated/prisma/client";
import { getChatMessagePreviewText } from "@/lib/inbox/chatMessageContent";

type PresenceRole = "ADMIN" | "MODERATOR" | "SUPER_ADMIN" | "USER";

type Props = {
  conversationId: string;
  initialMessages: ChatMessage[];
  title: string;
  subtitle?: string;
  forceOnline?: boolean;
  presenceTargetRoles?: PresenceRole[];
  viewerSenderType?: SenderType;
  incomingSenderTypes?: SenderType[];
  canReply?: boolean;
  sendLabel?: string;
  selfUserId?: string | null;
  senderLookup?: Record<
    string,
    {
      name: string;
      email?: string | null;
      role?: ChatMessage["senderRole"];
    }
  >;
  sendAction?: (input: {
    conversationId: string;
    content: string;
  }) => Promise<{ error?: string; success?: boolean } | void>;
  onSendComplete?: () => void;
  onOpenMenu?: () => void;
  onPreviewUpdate?: (payload: {
    senderId?: string | null;
    senderName?: string | null;
    senderRole?: ChatMessage["senderRole"];
    senderEmail?: string | null;
    content: string;
    senderType: ChatMessage["senderType"];
    createdAt: string;
  }) => void;
};

function isOwnMessage(message: ChatMessage, viewerSenderType: SenderType) {
  return message.senderType === viewerSenderType;
}

export default function ChatBox({
  conversationId,
  initialMessages,
  title,
  subtitle,
  forceOnline,
  presenceTargetRoles,
  viewerSenderType = SenderType.USER,
  incomingSenderTypes = [SenderType.SUPPORT, SenderType.SYSTEM],
  canReply = true,
  sendLabel,
  selfUserId = null,
  senderLookup,
  sendAction,
  onSendComplete,
  onOpenMenu,
  onPreviewUpdate,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const { online, typing, lastSeenAt } = useConversationPresence(
    conversationId,
    {
      targetRoles: presenceTargetRoles,
      selfUserId,
    },
  );

  useConversationMessages({
    conversationId,
    onMessage: async (message) => {
      const senderMeta =
        message.senderId && senderLookup?.[message.senderId]
          ? senderLookup[message.senderId]
          : null;
      const nextMessage = senderMeta
        ? {
            ...message,
            senderName: senderMeta.name,
            senderEmail: senderMeta.email ?? null,
            senderRole: senderMeta.role ?? message.senderRole ?? null,
          }
        : message;

      setMessages((prev) => {
        if (prev.find((current) => current.id === nextMessage.id)) return prev;
        return [...prev, nextMessage];
      });

      onPreviewUpdate?.({
        senderId: nextMessage.senderId ?? null,
        senderName: nextMessage.senderName ?? null,
        senderRole: nextMessage.senderRole ?? null,
        senderEmail: nextMessage.senderEmail ?? null,
        content: getChatMessagePreviewText(nextMessage.content),
        senderType: nextMessage.senderType,
        createdAt: nextMessage.createdAt,
      });

      if (incomingSenderTypes.includes(nextMessage.senderType)) {
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
          isOwnMessage(message, viewerSenderType) && !message.deliveredAt
            ? { ...message, deliveredAt }
            : message,
        ),
      );
    },
    onSeen: ({ readAt }) => {
      setMessages((prev) =>
        prev.map((message) =>
          isOwnMessage(message, viewerSenderType) && !message.readAt
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
        viewerSenderType={viewerSenderType}
      />

      <div className="shrink-0">
        {canReply ? (
          <ChatInput
            conversationId={conversationId}
            senderType={viewerSenderType}
            sendLabel={sendLabel}
            selfUserId={selfUserId}
            senderLookup={senderLookup}
            onSendMessage={sendAction}
            onSendComplete={onSendComplete}
            onPreviewUpdate={onPreviewUpdate}
          />
        ) : null}
      </div>
    </div>
  );
}
