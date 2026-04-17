"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import type { NotificationDTO } from "@/lib/types/notification";
import { createPusherClient } from "@/lib/pusher-client";

type NotificationListenerProps = {
  userId: string;
};

export default function NotificationListener({
  userId,
}: NotificationListenerProps) {
  useEffect(() => {
    if (!userId) return;

    const pusher = createPusherClient();

    const channel = pusher.subscribe(`notifications-${userId}`);

    channel.bind(
      "new-notification",
      (notification: Partial<NotificationDTO>) => {
        const title = notification.title?.trim();
        const message = notification.message?.trim();

        if (!title && !message) return;

        toast(title ?? "New notification", {
          description: message,
          duration: 5000,
          className: [
            "group relative overflow-hidden rounded-2xl",
            "border border-white/15",
            "bg-[linear-gradient(135deg,rgba(6,11,23,0.88),rgba(11,19,35,0.78),rgba(16,31,58,0.72))]",
            "text-white backdrop-blur-2xl",
            "shadow-[0_18px_48px_rgba(0,0,0,0.35),0_0_35px_rgba(60,158,224,0.12)]",
            "before:absolute before:left-0 before:top-0 before:h-full before:w-[4px]",
            "before:bg-[linear-gradient(180deg,#7dd3fc_0%,#3c9ee0_45%,rgba(60,158,224,0.35)_100%)]",
            "before:content-['']",
            "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl",
            "after:ring-1 after:ring-inset after:ring-white/8",
            "after:content-['']",
          ].join(" "),
          classNames: {
            toast: "pl-5 pr-3 py-3",
            title: "text-[14px] font-semibold tracking-tight text-white",
            description: "mt-1 text-[13px] leading-5 text-white/72",
            content: "gap-0",
            closeButton: [
              "right-3 top-3",
              "flex h-7 w-7 items-center justify-center rounded-full",
              "border border-white/10 bg-white/8 text-white/60",
              "transition-all duration-200",
              "hover:border-white/20 hover:bg-white/14 hover:text-white",
              "focus:outline-none focus:ring-2 focus:ring-[#3c9ee0]/40",
            ].join(" "),
          },
        });
      },
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId]);

  return null;
}
