"use client";

import Image from "next/image";

import { ChatMessage } from "@/lib/types/chat.types";
import { SenderType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { MessageStatus } from "./MessageStatus";
import {
  getChatMessagePreviewText,
  parseChatMessageContent,
} from "@/lib/inbox/chatMessageContent";

type Props = {
  message: ChatMessage;
  viewerSenderType?: SenderType;
};

function isOwnMessage(message: ChatMessage, viewerSenderType?: SenderType) {
  return message.senderType === (viewerSenderType ?? "USER");
}

export default function MessageBubble({ message, viewerSenderType }: Props) {
  const isUser = isOwnMessage(message, viewerSenderType);
  const parsedContent = parseChatMessageContent(message.content);
  const senderLabel =
    message.senderType === "SYSTEM"
      ? "System"
      : isUser
        ? "You"
        : message.senderName ??
          (message.senderRole === "CONTACT" ? "Contact" : message.senderRole) ??
          "Support";

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed",
          "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
          isUser ? "bg-blue-600  text-white/[0.8]" : "bg-muted text-foreground",
        )}
      >
        {!isUser ? (
          <div className="mb-1 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <span>{senderLabel}</span>
            {message.senderRole && message.senderRole !== "SYSTEM" ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {message.senderRole.replace("_", " ")}
              </span>
            ) : null}
          </div>
        ) : null}

        {parsedContent?.kind === "image" ? (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/5">
              <Image
                src={parsedContent.imageUrl}
                alt={parsedContent.imageName ?? "Conversation image"}
                width={1200}
                height={900}
                unoptimized
                className="max-h-80 w-full object-cover"
              />
            </div>

            {parsedContent.caption?.trim() ? (
              <p className="whitespace-pre-wrap break-words">
                {parsedContent.caption.trim()}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {getChatMessagePreviewText(message.content)}
          </p>
        )}

        <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted-foreground">
          <span>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>

          {isUser && (
            <MessageStatus
              deliveredAt={message.deliveredAt}
              readAt={message.readAt}
              sent
            />
          )}
        </div>
      </div>
    </div>
  );
}
