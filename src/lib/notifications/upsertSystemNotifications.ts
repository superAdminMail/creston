import { Prisma } from "@/generated/prisma";

export type SystemNotificationInput = {
  key: string;
  userId: string;
  title: string;
  message: string;
  link: string;
  metadata: Prisma.InputJsonValue;
};

export async function upsertSystemNotifications(
  tx: Prisma.TransactionClient,
  notifications: readonly SystemNotificationInput[],
) {
  for (const notification of notifications) {
    await tx.notification.upsert({
      where: {
        key: notification.key,
      },
      create: {
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: "SYSTEM",
        key: notification.key,
        link: notification.link,
        metadata: notification.metadata,
      },
      update: {
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: "SYSTEM",
        link: notification.link,
        metadata: notification.metadata,
      },
    });
  }
}
