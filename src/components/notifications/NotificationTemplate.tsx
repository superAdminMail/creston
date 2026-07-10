"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { renderNotificationIcon } from "@/lib/notifications/getNotificationIcon";
import { getNotificationDisplayType } from "@/lib/notifications/notificationPresentation";
import type { NotificationDTO } from "@/lib/types/notification";

type NotificationVariant = "info" | "success" | "warning" | "error";

type NotificationTemplateProps = {
  notification: NotificationDTO;
  href?: string;
  variant?: NotificationVariant;
  actionLabel?: string;
  onAction?: () => void;
};

const VARIANT_STYLES: Record<NotificationVariant, string> = {
  info: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/20",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20",
  error: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/20",
};

const NotificationTemplate = ({
  notification,
  href,
  variant = "info",
  actionLabel,
  onAction,
}: NotificationTemplateProps) => {
  const containerClass = notification.read
    ? "border border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-white/[0.03]"
    : "border border-sky-200/60 bg-sky-50/90 dark:border-sky-400/20 dark:bg-sky-400/10";

  const time = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  const Wrapper = href ? Link : "div";

  return (
    <article>
      <Wrapper
        href={href ?? "#"}
        className={`flex items-start gap-4 rounded-2xl p-4 shadow-sm transition hover:shadow-md ${containerClass}`}
      >
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border shadow-sm ${VARIANT_STYLES[variant]}`}
        >
          {renderNotificationIcon(notification, "h-4 w-4")}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-950 dark:text-white">
              {notification.title}
            </h4>

            <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
              {time}
            </span>
          </div>

          {notification.message && (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {notification.message}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            {href && (
              <Link
                href={href}
                className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-300"
              >
                View details
              </Link>
            )}

            {actionLabel && onAction && (
              <button
                type="button"
                onClick={onAction}
                className="text-sm font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </div>

        {!notification.read && (
          <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
        )}
      </Wrapper>
      <span className="sr-only">{getNotificationDisplayType(notification)}</span>
    </article>
  );
};

export default NotificationTemplate;
