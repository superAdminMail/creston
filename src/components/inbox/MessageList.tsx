"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { ChatMessage } from "@/lib/types/chat.types";
import { SenderType } from "@/generated/prisma/client";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

type Props = {
  messages: ChatMessage[];
  typing?: boolean;
  viewerSenderType?: SenderType;
};

function isOwnMessage(message: ChatMessage, viewerSenderType?: SenderType) {
  return message.senderType === (viewerSenderType ?? SenderType.USER);
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();

  const toYmd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const today = toYmd(now);
  const yesterday = toYmd(new Date(now.getTime() - 86_400_000));
  const current = toYmd(date);

  if (current === today) return "Today";
  if (current === yesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

export default function MessageList({
  messages,
  typing,
  viewerSenderType,
}: Props) {
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const knownIdsRef = useRef(new Set(messages.map((message) => message.id)));
  const [newCount, setNewCount] = useState(0);

  const isNearBottom = () => {
    const el = listRef.current;
    if (!el) return true;

    const threshold = 72;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  };

  const items = useMemo(() => {
    const output: Array<
      | { type: "date"; key: string; label: string }
      | { type: "message"; key: string; message: ChatMessage }
    > = [];

    let lastLabel = "";

    for (const message of messages) {
      const label = formatDateLabel(message.createdAt);

      if (label && label !== lastLabel) {
        output.push({
          type: "date",
          key: `date-${label}`,
          label,
        });
        lastLabel = label;
      }

      output.push({
        type: "message",
        key: message.id,
        message,
      });
    }

    return output;
  }, [messages]);

  useEffect(() => {
    const knownIds = knownIdsRef.current;
    const hasNewForeignMessage = messages.some(
      (message) =>
        !knownIds.has(message.id) && !isOwnMessage(message, viewerSenderType),
    );

    const hasNewOwnMessage = messages.some(
      (message) =>
        !knownIds.has(message.id) && isOwnMessage(message, viewerSenderType),
    );

    if (hasNewOwnMessage || isNearBottom()) {
      scrollToBottom(hasNewOwnMessage ? "smooth" : "auto");
      queueMicrotask(() => setNewCount(0));
    } else if (hasNewForeignMessage) {
      const incomingCount = messages.reduce((count, message) => {
        if (knownIds.has(message.id)) return count;
        if (isOwnMessage(message, viewerSenderType)) return count;
        return count + 1;
      }, 0);

      if (incomingCount > 0) {
        queueMicrotask(() =>
          setNewCount((prev) => prev + incomingCount),
        );
      }
    }

    knownIdsRef.current = new Set(messages.map((message) => message.id));
  }, [messages, viewerSenderType]);

  useEffect(() => {
    if (typing && isNearBottom()) {
      scrollToBottom("smooth");
    }
  }, [typing]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (isNearBottom()) {
        setNewCount(0);
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative h-full min-h-0">
      <div
        ref={listRef}
        className="h-full overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-gutter:stable]"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          {items.map((item) =>
            item.type === "date" ? (
              <div
                key={item.key}
                className="sticky top-3 z-10 mx-auto rounded-full border border-white/10 bg-background/85 px-3 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur"
              >
                {item.label}
              </div>
            ) : (
              <MessageBubble
                key={item.key}
                message={item.message}
                viewerSenderType={viewerSenderType}
              />
            ),
          )}

          {typing ? <TypingIndicator /> : null}

          <div ref={bottomRef} className="h-px w-full shrink-0" />
        </div>
      </div>

      {newCount > 0 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="pointer-events-auto rounded-full bg-[var(--brand-blue)] px-4 py-2 text-xs font-medium text-white shadow-[0_12px_28px_rgba(37,99,235,0.28)]"
          >
            {newCount} new message{newCount > 1 ? "s" : ""}
          </button>
        </div>
      ) : null}
    </div>
  );
}
