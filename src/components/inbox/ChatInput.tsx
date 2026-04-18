"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

import { deleteFileAssetAction } from "@/actions/files/file";
import { createFileAssetFromUpload } from "@/actions/files/createFileAssetFromUpload";
import { sendMessageAction } from "@/actions/inbox/sendMessageAction";
import { sendTypingAction } from "@/actions/inbox/sendTypingAction";
import { SenderType } from "@/generated/prisma/client";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
  placeholder = "Type....",
  sendLabel = "Send",
  selfUserId = null,
  senderLookup,
  onSendMessage,
  onSendComplete,
  onPreviewUpdate,
}: Props) {
  const lastTypingAtRef = useRef(0);

  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRemovingAttachment, setIsRemovingAttachment] = useState(false);
  const attachmentRef = useRef<Attachment | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

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
    <div className="bg-background pb-[max(env(safe-area-inset-bottom),0px)]">
      <div className="px-4 py-3">
        <div className="space-y-3">
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

          <div className="flex items-end gap-2 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-2 shadow-[0_14px_40px_rgba(2,6,23,0.16)] backdrop-blur-xl">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setUploadOpen(true)}
              className="h-11 w-11 shrink-0 rounded-full border border-white/10 bg-white/[0.03] text-slate-200 shadow-none hover:bg-white/[0.08] hover:text-white"
              aria-label="Add image attachment"
            >
              <Plus className="h-5 w-5" />
            </Button>

            <div className="min-w-0 flex-1">
              <Textarea
                value={text}
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
                className="no-scrollbar min-h-11 max-h-40 w-full resize-none overflow-y-auto border-0 bg-transparent px-2 py-3 text-[15px] leading-6 text-foreground shadow-none placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <Button
              onClick={() => void send()}
              disabled={isSending || (!text.trim() && !attachment)}
              className="h-11 shrink-0 rounded-full bg-[var(--brand-blue)] px-5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(37,99,235,0.28)] hover:bg-[var(--brand-blue)]/90 disabled:opacity-70"
            >
              {isSending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4 animate-spin text-white" />
                  Sending
                </span>
              ) : (
                sendLabel
              )}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent
          className="border-white/10 bg-[linear-gradient(180deg,rgba(10,19,41,0.98),rgba(7,12,24,0.98))] text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:max-w-md"
          showCloseButton={false}
        >
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="text-lg font-semibold text-white">
                Add image
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setUploadOpen(false)}
                className="h-9 w-9 rounded-full border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] hover:text-white"
                aria-label="Close upload dialog"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-sm leading-6 text-slate-400">
              Upload payment receipts or account screenshots for a faster
              review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 rounded-[1.75rem] border border-dashed border-sky-400/25 bg-white/[0.03] p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">Image upload</p>
              <p className="text-xs leading-5 text-slate-400">
                PNG, JPG, and WEBP up to 8MB.
              </p>
            </div>

            <UploadButton
              endpoint="conversationImage"
              className="ut-button:mx-auto ut-button:inline-flex ut-button:h-11 ut-button:items-center ut-button:justify-center ut-button:rounded-full ut-button:border ut-button:border-white/10 ut-button:bg-slate-950 ut-button:px-5 ut-button:text-sm ut-button:font-semibold ut-button:text-white ut-button:shadow-[0_12px_28px_rgba(2,6,23,0.42)] ut-button:transition ut-button:hover:-translate-y-0.5 ut-button:hover:bg-slate-800 ut-button:disabled:translate-y-0 ut-button:disabled:opacity-70"
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
                  setUploadOpen(false);
                } catch {
                  toast.error("Unable to attach image");
                }
              }}
              onUploadError={() => {
                toast.error("Image upload failed");
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
