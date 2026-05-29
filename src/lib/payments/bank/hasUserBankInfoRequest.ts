import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import {
  scanLegacyBankInfoRequestNotifications,
} from "./legacyBankInfoRequestNotifications";

export async function hasUserBankInfoRequest(userId: string) {
  const scan = await scanLegacyBankInfoRequestNotifications(prisma, {
    requesterId: userId,
  });

  if (scan.orphanAckNotifications.length > 0) {
    await prisma.notification.deleteMany({
      where: {
        id: {
          in: scan.orphanAckNotifications.map((notification) => notification.id),
        },
      },
    });

    for (const path of scan.revalidatePaths) {
      revalidatePath(path);
    }
  }

  return scan.liveAckNotifications.some(
    (notification) => notification.requesterId === userId,
  );
}
