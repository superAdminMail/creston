import { Prisma } from "@/generated/prisma";
import { upsertSystemNotifications } from "@/lib/notifications/upsertSystemNotifications";

type ReviewNotificationInput = {
  tx: Prisma.TransactionClient;
  userId: string;
  key: string;
  title: string;
  message: string;
  link: string;
  metadata: Prisma.InputJsonValue;
};

export async function createReviewNotification({
  tx,
  userId,
  key,
  title,
  message,
  link,
  metadata,
}: ReviewNotificationInput) {
  await upsertSystemNotifications(tx, [
    {
      userId,
      key,
      title,
      message,
      link,
      metadata,
    },
  ]);
}
