"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { parseChatMessageContent } from "@/lib/inbox/chatMessageContent";
import type { NotificationDTO } from "@/lib/types/notification";
import { createPusherClient } from "@/lib/pusher-client";

type NotificationListenerProps = {
  userId: string;
};

export default function NotificationListener({
  userId,
}: NotificationListenerProps) {
  function isNotificationPayload(
    payload: unknown,
  ): payload is Partial<NotificationDTO> {
    return !!payload && typeof payload === "object";
  }

  useEffect(() => {
    if (!userId) return;

    const pusher = createPusherClient();

    const channel = pusher.subscribe(`private-notifications-${userId}`);

    const handleNotification = (payload: unknown) => {
      if (!isNotificationPayload(payload)) return;

      const title = payload.title?.trim();
      const message = payload.message?.trim();
      const parsedMessage = message
        ? parseChatMessageContent(message)
        : null;

      if (!title && !message) return;

      const isImageMessage =
        payload.metadata?.kind === "support_reply" &&
        parsedMessage?.kind === "image";

      toast(isImageMessage ? "Image received" : title ?? "New notification", {
        description: isImageMessage
          ? parsedMessage?.caption?.trim()
            ? parsedMessage.caption.trim()
            : "Tap to view the image."
          : message,
        duration: 5000,
        className: [
          "group relative overflow-hidden rounded-2xl",
          "border border-white/12",
          "bg-[linear-gradient(180deg,rgba(12,18,32,0.84),rgba(10,15,26,0.72))]",
          "text-white backdrop-blur-xl",
          "shadow-[0_16px_40px_rgba(0,0,0,0.26),0_0_0_1px_rgba(255,255,255,0.03)]",
          "before:absolute before:inset-x-0 before:top-0 before:h-px",
          "before:bg-white/20",
          "before:content-['']",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
          "after:bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.08),transparent_45%)]",
          "after:content-['']",
        ].join(" "),
        classNames: {
          toast: "pl-5 pr-3 py-3",
          title: "text-[14px] font-semibold tracking-tight text-white",
          description: "mt-1 text-[13px] leading-5 text-white/68",
          content: "gap-0",
          closeButton: [
            "right-3 top-3",
            "flex h-7 w-7 items-center justify-center rounded-full",
            "border border-white/10 bg-white/6 text-white/58",
            "transition-all duration-200",
            "hover:border-white/18 hover:bg-white/12 hover:text-white",
            "focus:outline-none focus:ring-2 focus:ring-white/18",
          ].join(" "),
        },
      });
    };

    channel.bind("new-notification", handleNotification);

    return () => {
      channel.unbind("new-notification", handleNotification);
      pusher.unsubscribe(`private-notifications-${userId}`);
    };
  }, [userId]);

  return null;
}
