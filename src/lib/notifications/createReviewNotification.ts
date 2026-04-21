import { Prisma } from "@/generated/prisma";

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
  await tx.notification.upsert({
    where: { key },
    create: {
      userId,
      type: "SYSTEM",
      key,
      title,
      message,
      link,
      metadata,
    },
    update: {
      userId,
      type: "SYSTEM",
      title,
      message,
      link,
      metadata,
    },
  });
}
