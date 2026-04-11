import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import type { NotificationDTO } from "@/lib/types/notification";
import { toNotificationDto } from "@/lib/notifications/toNotificationDto";

import NotificationsPageClient from "./_components/NotificationsPageClient";

export default async function NotificationsPage() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const initialNotifications: NotificationDTO[] =
    notifications.map(toNotificationDto);

  return (
    <NotificationsPageClient
      initialNotifications={initialNotifications}
      initialUnreadCount={unreadCount}
    />
  );
}
