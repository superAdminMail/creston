"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { clearSuperAdminNotifications } from "@/actions/super-admin/system-health/clearSuperAdminNotifications";
import type { SystemHealthNotificationCleanup as SystemHealthNotificationCleanupState } from "@/actions/super-admin/system-health/getSuperAdminSystemHealth";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { NotificationTimestamp } from "@/components/notifications/NotificationTimestamp";
import { getNotificationDisplayType } from "@/lib/notifications/notificationPresentation";
import { cn } from "@/lib/utils";

type SystemHealthNotificationCleanupProps = {
  cleanup: SystemHealthNotificationCleanupState;
};

export function SystemHealthNotificationCleanup({
  cleanup,
}: SystemHealthNotificationCleanupProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmMode, setConfirmMode] = useState<"selected" | "all" | null>(
    null,
  );
  const [isClearing, startClearTransition] = useTransition();

  const visibleIds = useMemo(
    () => cleanup.items.map((item) => item.id),
    [cleanup.items],
  );

  const selectedCount = selectedIds.length;
  const allVisibleSelected =
    cleanup.items.length > 0 &&
    cleanup.items.every((item) => selectedIds.includes(item.id));

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("notificationPage", String(nextPage));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedIds((current) =>
      current.includes(notificationId)
        ? current.filter((id) => id !== notificationId)
        : [...current, notificationId],
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds])),
    );
  };

  const requestClear = (mode: "selected" | "all") => {
    if (mode === "selected" && selectedCount === 0) {
      return;
    }

    if (mode === "all" && cleanup.total === 0) {
      return;
    }

    setConfirmMode(mode);
  };

  const confirmClear = () => {
    if (!confirmMode) {
      return;
    }

    const mode = confirmMode;
    const notificationIds = selectedIds;

    startClearTransition(() => {
      void (async () => {
        const response = await clearSuperAdminNotifications({
          mode,
          notificationIds,
        });

        if (response?.error) {
          toast.error(response.error);
          return;
        }

        toast.success(
          mode === "all"
            ? `Deleted ${response.deletedCount} notification(s) across the app.`
            : `Deleted ${response.deletedCount} selected notification(s).`,
        );

        setSelectedIds([]);
        setConfirmMode(null);

        queryClient.invalidateQueries({
          queryKey: ["notifications"],
        });

        router.refresh();
      })();
    });
  };

  const confirmationTitle =
    confirmMode === "all"
      ? "Delete all notifications?"
      : "Delete selected notifications?";
  const confirmationDescription =
    confirmMode === "all"
      ? "This will permanently remove every notification from the app-wide notification menu and the database."
      : "This will permanently remove the selected notifications from the app-wide notification menu and the database.";
  const confirmationActionLabel =
    confirmMode === "all"
      ? isClearing
        ? "Clearing..."
        : "Delete all notifications"
      : isClearing
        ? "Clearing..."
        : "Delete selected notifications";

  return (
    <div className="rounded-[1.75rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm sm:p-5 md:p-6 lg:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.32em] text-sky-700/90 sm:text-[11px] dark:text-sky-300/80">
            Notification cleanup
          </p>
          <h2 className="text-balance mt-2 text-xl font-semibold tracking-tight text-sky-950 dark:text-sky-100">
            App-wide notification acknowledgment cleanup
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-7 text-slate-400">
            Remove stale notifications from the shared notification menu across
            the dashboard. This page shows 10 records at a time and supports
            single-row selection, bulk selection, and full cleanup.
          </p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 lg:max-w-[340px]">
          <div className="min-w-0 rounded-2xl border border-border/60 bg-white/75 dark:bg-white/[0.04] px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:text-[11px]">
              Total
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">
              {cleanup.total}
            </p>
          </div>
          <div className="min-w-0 rounded-2xl border border-border/60 bg-white/75 dark:bg-white/[0.04] px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 sm:text-[11px]">
              Unread
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">
              {cleanup.unreadCount}
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-6 flex flex-col gap-4 rounded-[1.5rem] border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-white/[0.04] lg:flex-row lg:items-center lg:justify-between",
          selectedCount > 0 && "sticky top-4 z-20",
        )}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={toggleSelectAll}
              disabled={cleanup.items.length === 0}
              aria-label="Select all notifications on this page"
              className="border-slate-400/80 bg-white text-sky-700 shadow-sm dark:border-white/20 dark:bg-white/[0.04] dark:text-sky-300 data-checked:border-sky-700 data-checked:bg-sky-700 dark:data-checked:border-sky-500 dark:data-checked:bg-sky-500"
            />
            <span className="text-[13px] leading-6 text-slate-950 dark:text-slate-300">
              {selectedCount > 0
                ? `${selectedCount} selected on this page`
                : "Select rows to delete them from the menu"}
            </span>
          </div>

          <span className="rounded-full border border-border/60 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Page {cleanup.page} of {cleanup.totalPages}
          </span>

          <span className="rounded-full border border-border/60 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            10 per page
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => requestClear("selected")}
            disabled={selectedCount === 0}
            className="border-border/60 bg-background/80 text-slate-950 dark:text-slate-100 hover:bg-white/10 hover:text-slate-950 dark:text-white text-white"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete selected
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => requestClear("all")}
            disabled={cleanup.total === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete all
          </Button>
        </div>
      </div>

      {cleanup.items.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/60 bg-white/5 px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-white/75 dark:bg-white/[0.04] text-slate-950 dark:text-slate-300 shadow-sm">
            <Bell className="h-5 w-5" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
            No notifications on this page
          </h3>
          <p className="mt-2 text-[15px] leading-7 text-slate-400">
            Use the pagination controls to move through the notification archive
            or clear everything if the menu is already clean.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3 md:hidden">
            {cleanup.items.map((notification) => {
              const displayType = getNotificationDisplayType({
                type: notification.type,
                metadata: notification.metadata,
              });
              const selected = selectedIds.includes(notification.id);

              return (
                <div
                  key={notification.id}
                  className={cn(
                    "rounded-[1.25rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] p-4 shadow-sm",
                    selected && "border-sky-400/30 bg-sky-500/5",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() =>
                        toggleNotificationSelection(notification.id)
                      }
                      aria-label={`Select notification ${notification.title}`}
                      className="border-slate-400/80 bg-white text-sky-700 shadow-sm dark:border-white/20 dark:bg-white/[0.04] dark:text-sky-300 data-checked:border-sky-700 data-checked:bg-sky-700 dark:data-checked:border-sky-500 dark:data-checked:bg-sky-500"
                    />

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-border/60 bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-950 dark:text-slate-300">
                          {displayType}
                        </span>
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
                            notification.read
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-700"
                              : "border-sky-400/20 bg-sky-500/10 text-sky-700",
                          )}
                        >
                          {notification.read ? "Read" : "Unread"}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <p className="text-[15px] font-medium leading-6 text-slate-950 dark:text-white">
                          {notification.userName.trim() ||
                            notification.userEmail}
                        </p>
                        <p className="mt-1 text-[13px] leading-6 text-slate-400">
                          {notification.userEmail}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[15px] font-medium leading-6 text-slate-950 dark:text-slate-100">
                          {notification.title}
                        </p>
                        {notification.message ? (
                          <p className="line-clamp-3 text-[13px] leading-6 text-slate-400">
                            {notification.message}
                          </p>
                        ) : (
                          <p className="text-[13px] leading-6 text-slate-500">
                            No additional details were attached.
                          </p>
                        )}
                      </div>

                      <NotificationTimestamp
                        value={notification.createdAt}
                        className="text-[13px] leading-6 text-slate-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 hidden overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 dark:bg-white/[0.04] shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-white/5 text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    <th className="w-12 px-4 py-3 font-medium">Select</th>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Notification</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">State</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {cleanup.items.map((notification) => {
                    const displayType = getNotificationDisplayType({
                      type: notification.type,
                      metadata: notification.metadata,
                    });
                    const selected = selectedIds.includes(notification.id);

                    return (
                      <tr
                        key={notification.id}
                        className={cn(
                          "transition-colors hover:bg-white/[0.03]",
                          selected && "bg-sky-500/5",
                        )}
                      >
                        <td className="px-4 py-4 align-top">
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() =>
                              toggleNotificationSelection(notification.id)
                            }
                            aria-label={`Select notification ${notification.title}`}
                            className="border-slate-400/80 bg-white text-sky-700 shadow-sm dark:border-white/20 dark:bg-white/[0.04] dark:text-sky-300 data-checked:border-sky-700 data-checked:bg-sky-700 dark:data-checked:border-sky-500 dark:data-checked:bg-sky-500"
                          />
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="min-w-0">
                            <p className="text-[15px] font-medium leading-6 text-slate-950 dark:text-white">
                              {notification.userName.trim() ||
                                notification.userEmail}
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-slate-400">
                              {notification.userEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="min-w-0 max-w-xl">
                            <p className="text-[15px] font-medium leading-6 text-slate-950 dark:text-slate-100">
                              {notification.title}
                            </p>
                            {notification.message ? (
                              <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-slate-400">
                                {notification.message}
                              </p>
                            ) : (
                              <p className="mt-1 text-[13px] leading-6 text-slate-500">
                                No additional details were attached.
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span className="inline-flex rounded-full border border-border/60 bg-white/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-950 dark:text-slate-300">
                            {displayType}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={cn(
                              "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
                              notification.read
                                ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-700"
                                : "border-sky-400/20 bg-sky-500/10 text-sky-700",
                            )}
                          >
                            {notification.read ? "Read" : "Unread"}
                          </span>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <NotificationTimestamp
                            value={notification.createdAt}
                            className="text-[13px] leading-6 text-slate-950 dark:text-slate-300"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] leading-6 text-slate-400">
                Showing {cleanup.items.length} of {cleanup.total} notification
                {cleanup.total === 1 ? "" : "s"}.
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(cleanup.page - 1)}
                  disabled={!cleanup.hasPreviousPage}
                  className="min-w-[96px] justify-center whitespace-nowrap border-border/70 bg-white/90 px-4 text-slate-800 shadow-sm hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(cleanup.page + 1)}
                  disabled={!cleanup.hasNextPage}
                  className="min-w-[96px] justify-center whitespace-nowrap border-border/70 bg-white/90 px-4 text-slate-800 shadow-sm hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <AlertDialog
        open={confirmMode !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmMode(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>
              Keep notifications
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                confirmClear();
              }}
              disabled={isClearing}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {confirmationActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
