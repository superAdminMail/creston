"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserId } from "@/lib/getCurrentUser";
import { asJsonObject, toJsonValue } from "@/lib/payments/paymentJson";
import { prisma } from "@/lib/prisma";

export async function dismissDashboardSuccessNotice(notificationId: string) {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { ok: false, message: "Please sign in again to dismiss this notice." };
  }

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
    select: {
      metadata: true,
    },
  });

  if (!notification) {
    return { ok: false, message: "This dashboard notice is no longer available." };
  }

  const metadata = asJsonObject(notification.metadata);
  const kind = metadata.dashboardNoticeKind;

  if (
    kind !== "INVESTMENT_PAYMENT_APPROVED" &&
    kind !== "SAVINGS_PAYMENT_APPROVED" &&
    kind !== "INVESTMENT_ORDER_CONFIRMED"
  ) {
    return { ok: false, message: "This notice cannot be dismissed here." };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      metadata: toJsonValue({
        ...metadata,
        dashboardDismissedAt: new Date().toISOString(),
      }),
    },
  });

  revalidatePath("/account/dashboard/user");

  return { ok: true };
}
