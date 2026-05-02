import { prisma } from "@/lib/prisma";
import { NotificationEvent } from "./notificationEvents";
import { Prisma, PrismaClient } from "@/generated/prisma";
import { pusherServer } from "@/lib/pusher";

type CreateNotificationInput = {
  userId: string;
  event: NotificationEvent;
  title: string;
  message: string;
  link?: string;
  key?: string;
  metadata?: Prisma.InputJsonValue;
  db?: Prisma.TransactionClient | PrismaClient;
};

async function createNotificationRecord({
  userId,
  event,
  title,
  message,
  link,
  key,
  metadata,
  db = prisma,
}: CreateNotificationInput) {
  if (key) {
    try {
      const notification = await db.notification.create({
        data: {
          userId,
          title,
          message,
          link,
          type: event,
          key,
          metadata,
        },
      });

      return {
        notification,
        created: true,
      };
    } catch (error) {
      if ((error as { code?: string } | null)?.code !== "P2002") {
        throw error;
      }

      const notification = await db.notification.findUnique({
        where: { key },
      });

      if (!notification) {
        throw error;
      }

      return {
        notification,
        created: false,
      };
    }
  }

  const notification = await db.notification.create({
    data: {
      userId,
      title,
      message,
      link,
      type: event,
      key,
      metadata,
    },
  });

  return {
    notification,
    created: true,
  };
}

export async function createNotification({
  userId,
  event,
  title,
  message,
  link,
  key,
  metadata,
  db,
}: CreateNotificationInput) {
  const result = await createNotificationRecord({
    userId,
    event,
    title,
    message,
    link,
    key,
    metadata,
    db,
  });

  return result.notification;
}

type CreateRealtimeNotificationInput = Omit<CreateNotificationInput, "db">;

export async function createRealtimeNotification(
  input: CreateRealtimeNotificationInput,
) {
  const result = await createNotificationRecord({
    ...input,
    db: prisma,
  });

  if (result.created) {
    await pusherServer.trigger(
      `private-notifications-${input.userId}`,
      "new-notification",
      result.notification,
    );
  }

  return result.notification;
}
