import { Prisma } from "@/generated/prisma";

import {
  SystemNotificationInput,
  upsertSystemNotifications,
} from "@/lib/notifications/upsertSystemNotifications";

export async function upsertBankDepositSubmissionNotifications(
  tx: Prisma.TransactionClient,
  notifications: readonly SystemNotificationInput[],
) {
  await upsertSystemNotifications(tx, notifications);
}
