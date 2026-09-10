import { Prisma } from "@/generated/prisma";

import { upsertSystemNotifications } from "@/lib/notifications/upsertSystemNotifications";

export function referralNotificationKey(rewardId: string, suffix: string) {
  return `referral-reward:${rewardId}:${suffix}`;
}

export function promoRewardNotificationKey(rewardId: string, suffix: string) {
  return `promo-reward:${rewardId}:${suffix}`;
}

export async function upsertRewardNotification(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    key: string;
    title: string;
    message: string;
    link: string;
    metadata: Prisma.InputJsonValue;
  },
) {
  await upsertSystemNotifications(tx, [
    {
      userId: input.userId,
      key: input.key,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata,
    },
  ]);
}
