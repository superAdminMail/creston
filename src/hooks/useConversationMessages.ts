"use client";

import { useEffect } from "react";
import { ChatMessage } from "@/lib/types/chat.types";
import { pusherClient } from "@/lib/pusher-client";

type TypingPayload = {
  userId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.conversationId === "string" &&
    typeof value.senderType === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string"
  );
}

function isTypingPayload(value: unknown): value is TypingPayload {
  return isRecord(value) && typeof value.userId === "string";
}

export function useConversationMessages({
  conversationId,
  onMessage,
  onDelivered,
  onSeen,
  onTyping,
}: {
  conversationId: string;
  onMessage: (message: ChatMessage) => void;
  onDelivered?: (payload: { deliveredAt: string }) => void;
  onSeen?: (payload: { readAt: string }) => void;
  onTyping?: (payload: TypingPayload) => void;
}) {
  useEffect(() => {
    const channelName = `conversation-${conversationId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleMessage = (...args: unknown[]) => {
      const [payload] = args;
      if (isChatMessage(payload)) onMessage(payload);
    };
    const handleDelivered = (...args: unknown[]) => {
      const [payload] = args;
      if (payload && isRecord(payload) && typeof payload.deliveredAt === "string") {
        onDelivered?.({ deliveredAt: payload.deliveredAt });
      }
    };
    const handleSeen = (...args: unknown[]) => {
      const [payload] = args;
      if (payload && isRecord(payload) && typeof payload.readAt === "string") {
        onSeen?.({ readAt: payload.readAt });
      }
    };
    const handleTyping = (...args: unknown[]) => {
      const [payload] = args;
      if (isTypingPayload(payload)) onTyping?.(payload);
    };

    channel.bind("new-message", handleMessage);
    if (onDelivered) channel.bind("delivered", handleDelivered);
    if (onSeen) channel.bind("seen", handleSeen);
    if (onTyping) channel.bind("typing", handleTyping);

    return () => {
      channel.unbind("new-message", handleMessage);
      if (onDelivered) channel.unbind("delivered", handleDelivered);
      if (onSeen) channel.unbind("seen", handleSeen);
      if (onTyping) channel.unbind("typing", handleTyping);
      pusherClient.unsubscribe(channelName);
    };
  }, [conversationId, onMessage, onDelivered, onSeen, onTyping]);
}
