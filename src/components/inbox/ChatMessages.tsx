"use client";

import { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import { ChatMessage } from "@/lib/types/chat.types";
import { Spinner } from "@/components/ui/spinner";

type PresenceRole = "ADMIN" | "MODERATOR" | "SUPER_ADMIN" | "USER";

export default function ChatMessages({
  conversationId,
  title,
  subtitle,
  forceOnline,
  presenceTargetRoles,
  onOpenMenu,
  onPreviewUpdate,
}: {
  conversationId: string;
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
}) {
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setMessages(null);

      const res = await fetch(`/api/inbox/conversation/${conversationId}`);
      const data = await res.json();

      if (!ignore) setMessages(data.messages);
    }

    load();
    return () => {
      ignore = true;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    fetch("/api/messages/delivered", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    fetch("/api/messages/seen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    }).catch(() => {});
  }, [conversationId]);

  if (!messages) {
    return (
      <div className="flex h-full min-h-[60vh] w-full items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border bg-background px-5 py-4 shadow-sm">
          <Spinner className="h-5 w-5 animate-spin text-[var(--brand-blue)]" />
          <span className="text-sm font-medium text-muted-foreground">
            Loading conversation...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ChatBox
        conversationId={conversationId}
        initialMessages={messages}
        title={title}
        subtitle={subtitle}
        forceOnline={forceOnline}
        presenceTargetRoles={presenceTargetRoles}
        onOpenMenu={onOpenMenu}
        onPreviewUpdate={onPreviewUpdate}
      />
    </div>
  );
}
