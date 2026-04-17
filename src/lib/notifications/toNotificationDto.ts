import type { Notification } from "@/generated/prisma";
import type { NotificationDTO } from "@/lib/types/notification";

export function toNotificationDto(notification: Notification): NotificationDTO {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message ?? undefined,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    type: (notification.type as NotificationDTO["type"]) ?? "SYSTEM",
    link: notification.link ?? undefined,
    metadata: notification.metadata
      ? (notification.metadata as Record<string, unknown>)
      : undefined,
  };
}
