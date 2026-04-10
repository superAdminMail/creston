"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { markNotificationRead } from "@/actions/notifications/markNotificationRead";
import { getNotificationIcon } from "@/lib/notifications/getNotificationIcon";
import type { NotificationDTO } from "@/lib/types/notification";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NotificationsPageClientProps = {
  initialNotifications: NotificationDTO[];
  initialUnreadCount: number;
};

function formatNotificationTime(value: string) {
  const date = new Date(value);
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 1) {
    return "Just now";
  }

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return rtf.format(diffDays, "day");
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatNotificationType(type?: string | null) {
  return type ? type.replaceAll("_", " ") : "SYSTEM";
}

export default function NotificationsPageClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isMarkingAll, startMarkAllTransition] = useTransition();

  const hasNotifications = notifications.length > 0;
  const hasUnread = unreadCount > 0;

  const summary = useMemo(
    () => ({
      total: notifications.length,
      unread: unreadCount,
      read: notifications.length - unreadCount,
    }),
    [notifications.length, unreadCount],
  );

  const syncNotificationsQuery = () => {
    queryClient.invalidateQueries({
      queryKey: ["notifications"],
    });
  };

  const handleNotificationClick = async (notification: NotificationDTO) => {
    if (!notification.read) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      await markNotificationRead(notification.id);
      syncNotificationsQuery();
    }

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = () => {
    if (!hasUnread) {
      return;
    }

    startMarkAllTransition(() => {
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true })),
      );
      setUnreadCount(0);

      void (async () => {
        await fetch("/api/notifications/read", {
          method: "POST",
        });

        syncNotificationsQuery();
      })();
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-300/80">
              Inbox
            </p>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                Notification Center
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Review account activity, profit updates, withdrawal status, and
                system announcements from one place.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={!hasUnread || isMarkingAll}
            className="rounded-2xl border-white/10 bg-white/[0.04] px-4 text-slate-100 hover:bg-white/[0.08] hover:text-white disabled:border-white/8 disabled:bg-white/[0.02] disabled:text-slate-500"
          >
            <CheckCheck className="h-4 w-4" />
            {isMarkingAll ? "Marking..." : "Mark all as read"}
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Total
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.total}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-400/15 bg-sky-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-200/80">
              Unread
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.unread}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">
              Read
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {summary.read}
            </p>
          </div>
        </div>
      </div>

      {!hasNotifications ? (
        <div className="rounded-[1.8rem] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Bell className="h-5 w-5 text-slate-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            No notifications yet
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            New investment, withdrawal, and system updates will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-4">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);

            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => handleNotificationClick(notification)}
                className={cn(
                  "group mb-3 flex w-full items-start gap-3 rounded-[20px] border border-transparent px-3 py-3.5 text-left text-sm transition duration-300 last:mb-0 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-36px_rgba(15,23,42,0.25)] sm:px-4",
                  !notification.read
                    ? "bg-sky-50/80 shadow-[0_18px_45px_-38px_rgba(14,165,233,0.45)] hover:border-sky-100 dark:border-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/10 dark:shadow-[0_18px_45px_-38px_rgba(60,158,224,0.35)] dark:hover:border-[var(--brand-blue)]/25 dark:hover:bg-[var(--brand-blue)]/12"
                    : "bg-transparent hover:border-white/10 hover:bg-white/[0.04]",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
                    !notification.read
                      ? "border-sky-200 bg-white text-sky-700 dark:border-[var(--brand-blue)]/20 dark:bg-zinc-950 dark:text-sky-300"
                      : "border-slate-200 bg-white text-slate-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-1 font-semibold tracking-tight text-slate-900 dark:text-white">
                      {notification.title}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-sky-500" />
                      )}
                      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 dark:text-zinc-400">
                        {formatNotificationTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>

                  {notification.message ? (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-zinc-400 sm:text-[13px]">
                      {notification.message}
                    </p>
                  ) : null}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-zinc-400">
                      {formatNotificationType(notification.type)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 transition group-hover:translate-x-0.5 dark:text-sky-300">
                      {notification.link ? "Open" : "Viewed"}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex justify-end">
        <Link
          href="/account/dashboard"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
