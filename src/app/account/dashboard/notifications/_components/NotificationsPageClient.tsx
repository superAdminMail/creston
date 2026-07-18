"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { markNotificationRead } from "@/actions/notifications/markNotificationRead";
import { clearNotifications } from "@/actions/notifications/clearNotifications";
import { renderNotificationIcon } from "@/lib/notifications/getNotificationIcon";
import {
  getNotificationActionLabel,
  getNotificationDisplayType,
} from "@/lib/notifications/notificationPresentation";
import type { NotificationDTO } from "@/lib/types/notification";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NotificationTimestamp } from "@/components/notifications/NotificationTimestamp";
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
      <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-300">
              Inbox
            </p>
            <div>
              <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
                Notification Center
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
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
            className="rounded-2xl border-slate-200/80 bg-slate-50/90 px-4 text-slate-700 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-950 disabled:border-slate-200/60 disabled:bg-slate-50/60 disabled:text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            <CheckCheck className="h-4 w-4" />
            {isMarkingAll ? "Marking..." : "Mark all as read"}
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Total
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {summary.total}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-200/60 bg-sky-50/80 p-4 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
            <p className="text-xs uppercase tracking-[0.18em] text-sky-700/80 dark:text-sky-200/80">
              Unread
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {summary.unread}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/80 p-4 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-400/10">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700/80 dark:text-emerald-200/80">
              Read
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
              {summary.read}
            </p>
          </div>
        </div>
      </div>

      {!hasNotifications ? (
        <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/90 px-6 py-14 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <Bell className="h-5 w-5 text-sky-700 dark:text-sky-300" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            No notifications yet
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            New investment, promotion, withdrawal, and system updates will
            appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-[1.8rem] border border-slate-200/70 bg-white/90 p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-slate-200/80 bg-slate-50/90 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Checkbox
                checked={allVisibleSelected}
                onCheckedChange={toggleSelectAll}
                className="border-slate-300 bg-white text-sky-700 shadow-sm ring-1 ring-slate-200/70 dark:border-white/20 dark:bg-white/[0.04] dark:text-sky-300 dark:ring-white/10 data-checked:border-sky-600 data-checked:bg-sky-600 data-checked:text-white dark:data-checked:border-sky-500 dark:data-checked:bg-sky-500"
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
                  className="h-8 rounded-full border border-slate-200/80 bg-white/85 px-3 text-xs text-slate-600 shadow-sm hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
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
                "group mb-3 flex w-full items-start gap-3 rounded-[20px] border px-3 py-3.5 text-left text-sm transition duration-300 last:mb-0 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-36px_rgba(15,23,42,0.18)] sm:px-4",
                !notification.read
                  ? "border-sky-200/60 bg-sky-50/90 shadow-[0_18px_45px_-38px_rgba(14,165,233,0.18)] hover:border-sky-300/70 hover:bg-sky-50/95 dark:border-[var(--brand-blue)]/10 dark:bg-white/[0.04] dark:shadow-[0_18px_45px_-38px_rgba(60,158,224,0.18)] dark:hover:border-[var(--brand-blue)]/20 dark:hover:bg-white/[0.06]"
                  : "border-slate-200/80 bg-white/90 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/15 dark:hover:bg-white/[0.06]",
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
                  className="border-slate-300 bg-white text-sky-700 shadow-sm ring-1 ring-slate-200/70 dark:border-white/20 dark:bg-white/[0.04] dark:text-sky-300 dark:ring-white/10 data-checked:border-sky-600 data-checked:bg-sky-600 data-checked:text-white dark:data-checked:border-sky-500 dark:data-checked:bg-sky-500"
                />
              </div>

              <div
                  className={cn(
                    "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
                    !notification.read
                    ? "border-sky-200 bg-white text-sky-700 dark:border-[var(--brand-blue)]/20 dark:bg-zinc-950 dark:text-sky-300"
                    : "border-slate-200/80 bg-white text-slate-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400",
                  )}
                >
                {renderNotificationIcon(notification, "h-4 w-4")}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="line-clamp-1 font-semibold tracking-tight text-slate-950 dark:text-white">
                    {notification.title}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    {!notification.read && (
                      <span className="h-2 w-2 rounded-full bg-sky-500" />
                    )}
                    <NotificationTimestamp
                      value={notification.createdAt}
                      className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
                    />
                  </div>
                </div>

                {notification.message ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400 sm:text-[13px]">
                    {notification.message}
                  </p>
                ) : null}

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    {getNotificationDisplayType(notification)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 transition group-hover:translate-x-0.5 dark:text-sky-300">
                    {notification.link
                      ? getNotificationActionLabel(notification) ?? "Open"
                      : "Viewed"}
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
          className="text-sm text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          Back to dashboard
        </Link>
      </div>

      <AlertDialog open={clearOpen} onOpenChange={setClearOpen}>
        <AlertDialogContent className="border-slate-200/80 bg-white/98 text-slate-950 shadow-[0_28px_80px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-slate-950 dark:text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear selected notifications?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected notifications from your
              inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-4 -mb-4 border-t border-slate-200/80 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <AlertDialogCancel
              disabled={isClearing}
              className="border-slate-200/80 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
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
