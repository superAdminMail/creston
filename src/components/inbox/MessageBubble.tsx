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

function isOwnMessage(message: ChatMessage, viewerSenderType?: SenderType) {
  return message.senderType === (viewerSenderType ?? "USER");
}

export default function MessageBubble({ message, viewerSenderType }: Props) {
  const isUser = isOwnMessage(message, viewerSenderType);
  const parsedContent = parseChatMessageContent(message.content);

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-xl px-4 py-2 text-sm leading-relaxed",
          "shadow-[0_1px_2px_rgba(0,0,0,0.05)]",
          isUser
            ? "bg-blue-600 text-white/[0.8]"
            : "border border-white/8 bg-white/[0.05] text-foreground shadow-[0_10px_28px_rgba(0,0,0,0.12)]",
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
