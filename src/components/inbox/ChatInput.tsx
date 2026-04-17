"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { sendMessageAction } from "@/actions/inbox/sendMessageAction";
import { sendTypingAction } from "@/actions/inbox/sendTypingAction";
import { Spinner } from "@/components/ui/spinner";
import { SenderType } from "@/generated/prisma/client";
import { ChatMessage } from "@/lib/types/chat.types";

type Props = {
  conversationId: string;
  senderType?: SenderType;
  placeholder?: string;
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
  onSendMessage?: (input: {
    conversationId: string;
    content: string;
  }) => Promise<{ error?: string; success?: boolean } | void>;
  onSendComplete?: () => void;
  onPreviewUpdate?: (payload: {
    content: string;
    senderType: SenderType;
    createdAt: string;
  }) => void;
};

export function ChatInput({
  conversationId,
  senderType = SenderType.USER,
  placeholder = "Type a message...",
  sendLabel = "Send",
  selfUserId = null,
  senderLookup,
  onSendMessage,
  onSendComplete,
  onPreviewUpdate,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const lastTypingAtRef = useRef(0);

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [text]);

  const send = async () => {
    if (!text.trim() || isSending) return;
    const value = text;
    setIsSending(true);
    try {
      const res = await (onSendMessage
        ? onSendMessage({ conversationId, content: value })
        : sendMessageAction({ conversationId, content: value }));
      if (res?.error) {
        toast.error(res.error);
      } else {
        setText("");
        const previewSender =
          selfUserId && senderLookup?.[selfUserId]
            ? senderLookup[selfUserId]
            : null;
        onPreviewUpdate?.({
          senderId: selfUserId,
          senderName: previewSender?.name ?? null,
          senderRole: previewSender?.role ?? null,
          senderEmail: previewSender?.email ?? null,
          content: value,
          senderType,
          createdAt: new Date().toISOString(),
        });
        onSendComplete?.();
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="px-4 py-1">
        <div className="relative">
          <Textarea
            value={text}
            ref={ref}
            rows={1}
            onChange={(e) => {
              setText(e.target.value);
              const now = Date.now();
              if (now - lastTypingAtRef.current > 1200) {
                lastTypingAtRef.current = now;
                void sendTypingAction({ conversationId });
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={placeholder}
            className="min-h-10 w-full resize-none max-h-40 overflow-y-auto rounded-md border px-3 py-2 pr-14 text-sm leading-6 focus:outline-none"
          />
          <Button
            onClick={send}
            disabled={isSending}
            className="absolute bottom-1.5 right-1.5 h-7 px-3 bg-[var(--brand-blue)] hover:bg-[var(--brand-blue)]/90 disabled:opacity-70"
          >
            {isSending ? (
              <span className="flex items-center">
                <Spinner className="h-4 w-4 animate-spin text-white" />
              </span>
            ) : (
              sendLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
