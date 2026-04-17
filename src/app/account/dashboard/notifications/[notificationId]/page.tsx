import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { getCurrentUserId } from "@/lib/getCurrentUser";
import { renderNotificationIcon } from "@/lib/notifications/getNotificationIcon";
import { getNotificationDisplayType } from "@/lib/notifications/notificationPresentation";
import { toNotificationDto } from "@/lib/notifications/toNotificationDto";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NotificationDetailsPage({
  params,
}: {
  params: Promise<{ notificationId: string }>;
}) {
  const userId = await getCurrentUserId();

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
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" className="px-0 text-slate-300 hover:text-white">
          <Link href="/account/dashboard/notifications">
            <ArrowLeft className="h-4 w-4" />
            Back to notifications
          </Link>
        </Button>

        {dto.link ? (
          <Button asChild variant="outline" className="rounded-2xl border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]">
            <Link href={dto.link}>
              Open linked page
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <article className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
            {renderNotificationIcon(dto, "h-5 w-5")}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
                {getNotificationDisplayType(dto)}
              </p>
              <h1 className="text-2xl font-semibold text-white">{dto.title}</h1>
              <p className="text-sm text-slate-400">
                {formatNotificationTime(dto.createdAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {dto.message ?? "No additional notification details were provided."}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
