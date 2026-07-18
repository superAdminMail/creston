"use client";

import { cn } from "@/lib/utils";

type NotificationTimestampProps = {
  value: string;
  className?: string;
};

function formatLocalNotificationTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationTimestamp({
  value,
  className,
}: NotificationTimestampProps) {
  const label =
    typeof window === "undefined"
      ? ""
      : formatLocalNotificationTimestamp(value);

  return (
    <span suppressHydrationWarning className={cn(className)}>
      {label}
    </span>
  );
}
