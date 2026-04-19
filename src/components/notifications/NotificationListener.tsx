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
          "group relative isolate overflow-hidden rounded-2xl",
          "border border-slate-200/45 bg-white/62 text-slate-950",
          "backdrop-blur-xl shadow-[0_12px_30px_rgba(15,23,42,0.08)]",
          "dark:border-white/10 dark:bg-slate-950/68 dark:text-white",
          "dark:shadow-[0_12px_30px_rgba(0,0,0,0.22)]",
          "before:absolute before:inset-x-0 before:top-0 before:h-px",
          "before:bg-white/45 dark:before:bg-white/10",
          "before:content-['']",
          "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
          "after:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_48%)]",
          "after:content-['']",
        ].join(" "),
        classNames: {
          toast: "pl-5 pr-3 py-3",
          title: "text-[14px] font-semibold tracking-tight text-slate-950 dark:text-white",
          description: "mt-1 text-[13px] leading-5 text-slate-600 dark:text-slate-300",
          content: "gap-0",
          closeButton: [
            "z-10 right-3 top-3",
            "flex h-7 w-7 items-center justify-center rounded-full",
            "border border-white/35 bg-white/55 text-slate-600 shadow-[0_6px_18px_rgba(15,23,42,0.08)] backdrop-blur-md",
            "transition-all duration-200",
            "hover:border-white/50 hover:bg-white/70 hover:text-slate-800",
            "focus:outline-none focus:ring-2 focus:ring-slate-300",
            "dark:border-white/12 dark:bg-white/8 dark:text-white/78",
            "dark:hover:border-white/20 dark:hover:bg-white/12 dark:hover:text-white",
            "dark:focus:ring-white/18",
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
