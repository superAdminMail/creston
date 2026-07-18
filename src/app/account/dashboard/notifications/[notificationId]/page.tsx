import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getCurrentUserId } from "@/lib/getCurrentUser";
import { getCurrentUserRole } from "@/lib/getCurrentUser";
import { renderNotificationIcon } from "@/lib/notifications/getNotificationIcon";
import {
  getNotificationActionLabel,
  getNotificationDisplayType,
} from "@/lib/notifications/notificationPresentation";
import { toNotificationDto } from "@/lib/notifications/toNotificationDto";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { NotificationTimestamp } from "@/components/notifications/NotificationTimestamp";
import { UserRole } from "@/generated/prisma/client";

export default async function NotificationDetailsPage({
  params,
}: {
  params: Promise<{ notificationId: string }>;
}) {
  const userId = await getCurrentUserId();
  const role = await getCurrentUserRole();

  if (!userId) {
    redirect("/auth/login");
  }

  const { notificationId } = await params;
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    notFound();
  }

  if (!notification.read) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { read: true },
    });
  }

  const dto = toNotificationDto(notification);
  const metadata = (dto.metadata ?? {}) as Record<string, unknown>;
  const supportConversationId =
    typeof metadata.conversationId === "string"
      ? metadata.conversationId
      : null;
  const isSupportNotification =
    metadata.kind === "support_ticket" || metadata.kind === "support_reply";
  const supportBasePath =
    role === UserRole.SUPER_ADMIN
      ? "/account/dashboard/super-admin/support"
      : role === UserRole.ADMIN
        ? "/account/dashboard/admin/support"
        : "/account/dashboard/user/support";
  const supportLink =
    isSupportNotification && supportConversationId
      ? `${supportBasePath}?conversation=${supportConversationId}`
      : null;
  const actionLabel = getNotificationActionLabel(dto);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          asChild
          variant="ghost"
          className="w-fit rounded-full border border-slate-200/80 bg-white/85 px-3 py-2 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:text-white"
        >
          <Link href="/account/dashboard/notifications">
            <ArrowLeft className="h-4 w-4" />
            Back to notifications
          </Link>
        </Button>

        {supportLink || dto.link ? (
          <Button
            asChild
            variant="outline"
            className="w-full rounded-2xl border-slate-200/80 bg-slate-50/90 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.08] sm:w-auto"
          >
            <Link href={supportLink ?? dto.link!}>
              {actionLabel ?? "Open linked page"}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <article
        className="rounded-[1.8rem] border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:p-6 lg:p-8 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-start">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200/80 bg-sky-50 text-sky-700 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300 sm:h-12 sm:w-12">
            {renderNotificationIcon(dto, "h-4 w-4 sm:h-5 sm:w-5")}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300/80">
                {getNotificationDisplayType(dto)}
              </p>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-3xl">
                {dto.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 sm:text-[15px]">
                <NotificationTimestamp value={dto.createdAt} />
              </p>
            </div>

            <div
              className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-5"
            >
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-[15px] sm:leading-8">
                {dto.message ??
                  "No additional notification details were provided."}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
