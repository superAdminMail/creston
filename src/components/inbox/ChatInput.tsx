"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { deleteFileAssetAction } from "@/actions/files/file";
import { createFileAssetFromUpload } from "@/actions/files/createFileAssetFromUpload";
import { sendMessageAction } from "@/actions/inbox/sendMessageAction";
import { sendTypingAction } from "@/actions/inbox/sendTypingAction";
import { SenderType } from "@/generated/prisma/client";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { UploadButton } from "@/utils/uploadthing";
import { ChatMessage } from "@/lib/types/chat.types";
import {
  getChatMessagePreviewText,
  serializeChatMessageContent,
} from "@/lib/inbox/chatMessageContent";

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
    senderId?: string | null;
    senderName?: string | null;
    senderRole?: ChatMessage["senderRole"];
    senderEmail?: string | null;
    content: string;
    senderType: SenderType;
    createdAt: string;
  }) => void;
};

type Attachment = {
  assetId: string;
  storageKey: string;
  url: string;
  name: string | null;
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
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRemovingAttachment, setIsRemovingAttachment] = useState(false);
  const attachmentRef = useRef<Attachment | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.height = `${ref.current.scrollHeight}px`;
  }, [text]);

  useEffect(() => {
    attachmentRef.current = attachment;
  }, [attachment]);

  useEffect(() => {
    return () => {
      const current = attachmentRef.current;
      if (!current) return;

      void deleteFileAssetAction(current.assetId).catch(() => {});
    };
  }, []);

  const removeAttachment = async () => {
    if (!attachment || isRemovingAttachment) return;

    setIsRemovingAttachment(true);
    try {
      const result = await deleteFileAssetAction(attachment.assetId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      setAttachment(null);
    } finally {
      setIsRemovingAttachment(false);
    }
  };

  const send = async () => {
    const trimmedText = text.trim();

    if (!trimmedText && !attachment) return;
    if (isSending) return;

    const content = attachment
      ? serializeChatMessageContent({
          kind: "image",
          imageUrl: attachment.url,
          imageKey: attachment.storageKey,
          imageName: attachment.name,
          imageAssetId: attachment.assetId,
          caption: trimmedText || null,
        })
      : trimmedText;

    setIsSending(true);
    try {
      const res = await (onSendMessage
        ? onSendMessage({ conversationId, content })
        : sendMessageAction({ conversationId, content }));

      if (res?.error) {
        toast.error(res.error);
        return;
      }

      setText("");
      setAttachment(null);

      const previewSender =
        selfUserId && senderLookup?.[selfUserId]
          ? senderLookup[selfUserId]
          : null;

      onPreviewUpdate?.({
        senderId: selfUserId,
        senderName: previewSender?.name ?? null,
        senderRole: previewSender?.role ?? null,
        senderEmail: previewSender?.email ?? null,
        content: getChatMessagePreviewText(content),
        senderType,
        createdAt: new Date().toISOString(),
      });

      onSendComplete?.();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <div className="space-y-3 px-4 py-3">
        {attachment ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-white/10">
              <Image
                src={attachment.url}
                alt={attachment.name ?? "Attachment preview"}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {attachment.name ?? "Image attachment"}
              </p>
              <p className="text-xs text-muted-foreground">
                Will send as an image message
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isRemovingAttachment}
              onClick={removeAttachment}
              className="rounded-full text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
            >
              {isRemovingAttachment ? "Removing..." : "Remove"}
            </Button>
          </div>
        ) : null}

        <div className="flex items-end gap-2">
          <div className="flex-1">
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder={placeholder}
                className="min-h-12 max-h-40 w-full resize-none overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-16 text-sm leading-6 shadow-none focus:outline-none"
              />

              <div className="absolute bottom-2.5 right-2.5">
                <UploadButton
                  endpoint="conversationImage"
                  onClientUploadComplete={async (res) => {
                    try {
                      const file = res?.[0];
                      if (!file) {
                        toast.error("Upload failed");
                        return;
                      }

                      const asset = await createFileAssetFromUpload({
                        url: file.url,
                        key: file.key,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                      });

                      setAttachment({
                        assetId: asset.id,
                        storageKey: file.key,
                        url: file.url,
                        name: file.name ?? null,
                      });

                      toast.success("Image attached");
                    } catch {
                      toast.error("Unable to attach image");
                    }
                  }}
                  onUploadError={() => {
                    toast.error("Image upload failed");
                  }}
                  className="
                    ut-button:!inline-flex
                    ut-button:!h-8
                    ut-button:!items-center
                    ut-button:!gap-2
                    ut-button:!rounded-full
                    ut-button:!border
                    ut-button:!border-white/10
                    ut-button:!bg-slate-950
                    ut-button:!px-3
                    ut-button:!text-xs
                    ut-button:!font-semibold
                    ut-button:!text-white
                    ut-button:!shadow-[0_12px_28px_rgba(2,6,23,0.42)]
                    ut-button:!ring-1
                    ut-button:!ring-inset
                    ut-button:!ring-white/10
                    ut-button:transition
                    ut-button:duration-200
                    hover:ut-button:!-translate-y-0.5
                    hover:ut-button:!bg-slate-800
                  "
                />
              </div>
            </div>
          </div>

          <Button
            onClick={() => void send()}
            disabled={isSending || (!text.trim() && !attachment)}
            className="h-12 rounded-2xl bg-[var(--brand-blue)] px-4 text-white hover:bg-[var(--brand-blue)]/90 disabled:opacity-70"
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
