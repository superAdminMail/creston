"use client";

import { ChatMessage } from "@/lib/types/chat.types";
import { SenderType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { MessageStatus } from "./MessageStatus";
import ConversationImagePreview from "./ConversationImagePreview";
import {
  getChatMessagePreviewText,
  parseChatMessageContent,
} from "@/lib/inbox/chatMessageContent";

type Props = {
  message: ChatMessage;
  viewerSenderType?: SenderType;
};

function formatMessageTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function isOwnMessage(message: ChatMessage, viewerSenderType?: SenderType) {
  return message.senderType === (viewerSenderType ?? "USER");
}

export default function MessageBubble({ message, viewerSenderType }: Props) {
  const isUser = isOwnMessage(message, viewerSenderType);
  const parsedContent = parseChatMessageContent(message.content);

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(75%,42rem)] rounded-[1.35rem] px-4 py-3 text-sm leading-6",
          "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          isUser
            ? "rounded-br-md border border-sky-200/40 bg-sky-500 text-white shadow-[0_12px_28px_rgba(56,189,248,0.18)] [&_p]:text-white [&_span]:text-white [&_svg]:text-white [&_strong]:text-white [&_em]:text-white [&_a]:text-white [&_code]:text-white"
            : "rounded-bl-md border border-slate-200/80 bg-white/92 text-slate-950 shadow-[0_10px_28px_rgba(15,23,42,0.06)] dark:border-white/8 dark:bg-white/[0.05] dark:text-white dark:shadow-[0_10px_28px_rgba(0,0,0,0.12)]",
        )}
      >
        {parsedContent?.kind === "image" ? (
          <div className="space-y-3">
            <ConversationImagePreview
              src={parsedContent.imageUrl}
              alt={parsedContent.imageName ?? "Conversation image"}
              caption={parsedContent.caption}
            />

            {parsedContent.caption?.trim() ? (
              <p className="whitespace-pre-wrap break-words text-[15px] leading-6 text-inherit">
                {parsedContent.caption.trim()}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words text-[15px] leading-6 text-inherit">
            {getChatMessagePreviewText(message.content)}
          </p>
        )}

        <div
          className={cn(
            "mt-2 flex items-center justify-end gap-1.5 text-[11px]",
            isUser
              ? "text-white/75"
              : "text-slate-500 dark:text-muted-foreground",
          )}
        >
          <span>{formatMessageTime(message.createdAt)}</span>

          {isUser ? (
            <MessageStatus
              deliveredAt={message.deliveredAt}
              readAt={message.readAt}
              sent
              isSender
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
