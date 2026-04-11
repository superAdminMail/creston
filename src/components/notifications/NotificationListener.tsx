"use client";

import { useEffect } from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";

import type { NotificationDTO } from "@/lib/types/notification";

type NotificationListenerProps = {
  userId: string;
};

export default function NotificationListener({
  userId,
}: NotificationListenerProps) {
  useEffect(() => {
    if (!userId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`notifications-${userId}`);

    channel.bind(
      "new-notification",
      (notification: Partial<NotificationDTO>) => {
        const title = notification.title?.trim();
        const message = notification.message?.trim();

        if (!title && !message) {
          return;
        }

        toast(title ?? "New notification", {
          description: message,
          duration: 5000,
          className:
            "border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.7))] text-white shadow-[0_14px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl",
          classNames: {
            title: "text-sm font-semibold tracking-tight text-white",
            description: "text-[13px] leading-5 text-white/62",
            content: "gap-1.5",
            closeButton:
              "border border-white/8 bg-white/4 text-white/60 transition-colors hover:bg-white/8 hover:text-white/85",
          },
        });
      }
    );

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId]);

  return null;
}
