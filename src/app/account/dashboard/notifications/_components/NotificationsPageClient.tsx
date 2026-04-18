"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { markNotificationRead } from "@/actions/notifications/markNotificationRead";
import { clearNotifications } from "@/actions/notifications/clearNotifications";
import { renderNotificationIcon } from "@/lib/notifications/getNotificationIcon";
import { getNotificationDisplayType } from "@/lib/notifications/notificationPresentation";
import type { NotificationDTO } from "@/lib/types/notification";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export default function NotificationsPageClient({
  initialNotifications,
  initialUnreadCount,
}: NotificationsPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isMarkingAll, startMarkAllTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clearOpen, setClearOpen] = useState(false);
  const [isClearing, startClearTransition] = useTransition();

  const hasNotifications = notifications.length > 0;
  const hasUnread = unreadCount > 0;
  const selectedCount = selectedIds.length;

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

  const allVisibleSelected =
    notifications.length > 0 &&
    notifications.every((notification) =>
      selectedIds.includes(notification.id),
    );

  const selectedUnreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          selectedIds.includes(notification.id) && !notification.read,
      ).length,
    [notifications, selectedIds],
  );

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

    router.push(`/account/dashboard/notifications/${notification.id}`);
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

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedIds((current) =>
      current.includes(notificationId)
        ? current.filter((id) => id !== notificationId)
        : [...current, notificationId],
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = notifications.map((notification) => notification.id);
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const handleClearSelected = () => {
    if (!selectedCount) return;
    setClearOpen(true);
  };

  const confirmClearSelected = () => {
    if (!selectedIds.length) return;

    startClearTransition(() => {
      const ids = selectedIds;
      const unreadSelectedCount = selectedUnreadCount;

      void (async () => {
        const response = await clearNotifications(ids);
        if (response?.error) {
          return;
        }

        setNotifications((current) =>
          current.filter((notification) => !ids.includes(notification.id)),
        );

        setUnreadCount((current) => Math.max(0, current - unreadSelectedCount));

        setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
        setClearOpen(false);
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
                Review account activity, promotion messages, profit updates,
                withdrawal status, and system announcements from one place.
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
            New investment, promotion, withdrawal, and system updates will
            appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.25)] sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-3 py-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleSelectAll}
              />
              <span>
                {selectedCount
                  ? `${selectedCount} selected`
                  : "Select notifications to clear"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedCount ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="h-8 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs text-slate-300 hover:bg-white/[0.06] hover:text-white"
                >
                  Clear selection
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                disabled={!selectedCount}
                onClick={handleClearSelected}
                className="h-8 rounded-full bg-red-600 px-3 text-xs text-white hover:bg-red-700"
              >
                Clear selected
              </Button>
            </div>
          </div>

          {notifications.map((notification) => (
            <div
              key={notification.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(notification)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  void handleNotificationClick(notification);
                }
              }}
              className={cn(
                "group mb-3 flex w-full items-start gap-3 rounded-[20px] border px-3 py-3.5 text-left text-sm transition duration-300 last:mb-0 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-36px_rgba(15,23,42,0.25)] sm:px-4",
                !notification.read
                  ? "border-sky-200/40 bg-white/[0.06] shadow-[0_18px_45px_-38px_rgba(14,165,233,0.28)] hover:border-sky-200/50 hover:bg-white/[0.08] dark:border-[var(--brand-blue)]/10 dark:bg-[var(--brand-blue)]/10 dark:shadow-[0_18px_45px_-38px_rgba(60,158,224,0.22)] dark:hover:border-[var(--brand-blue)]/25 dark:hover:bg-[var(--brand-blue)]/12"
                  : "border-white/10 bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]",
              )}
            >
              <div
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                role="presentation"
                className="mt-0.5"
              >
                <Checkbox
                  checked={selectedIds.includes(notification.id)}
                  onCheckedChange={() =>
                    toggleNotificationSelection(notification.id)
                  }
                />
              </div>

              <div
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
                  !notification.read
                    ? "border-sky-200 bg-white text-sky-700 dark:border-[var(--brand-blue)]/20 dark:bg-zinc-950 dark:text-sky-300"
                    : "border-slate-200/80 bg-white/[0.92] text-slate-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
                )}
              >
                {renderNotificationIcon(notification, "h-4 w-4")}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-1 font-semibold tracking-tight text-slate-400 dark:text-white">
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
                    {getNotificationDisplayType(notification)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 transition group-hover:translate-x-0.5 dark:text-sky-300">
                    {notification.link ? "Open" : "Viewed"}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
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

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear selected notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected notifications from your
              inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmClearSelected();
              }}
              disabled={isClearing || !selectedCount}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isClearing ? "Clearing..." : "Clear notifications"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
