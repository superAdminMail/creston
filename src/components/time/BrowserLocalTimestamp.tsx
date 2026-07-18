"use client";

import { cn } from "@/lib/utils";

type BrowserLocalTimestampProps = {
  value?: string | Date | null;
  className?: string;
  variant?: "datetime" | "time" | "dateLabel" | "lastSeen";
  fallback?: string;
};

function toDate(value?: string | Date | null) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toLocalYmd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function formatLocalDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatLocalTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLocalDateTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateLabel(date: Date) {
  const now = new Date();
  const today = toLocalYmd(now);
  const yesterday = toLocalYmd(new Date(now.getTime() - 86_400_000));
  const current = toLocalYmd(date);

  if (current === today) return "Today";
  if (current === yesterday) return "Yesterday";

  return formatLocalDate(date);
}

function formatLastSeen(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 1) return "last seen just now";
  if (Math.abs(diffMinutes) < 60) {
    return `last seen ${Math.abs(diffMinutes)}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return `last seen ${Math.abs(diffHours)}h ago`;
  }

  const current = toLocalYmd(date);
  const today = toLocalYmd(now);
  const yesterday = toLocalYmd(new Date(now.getTime() - 86_400_000));

  if (current === today) {
    return `last seen today at ${formatLocalTime(date)}`;
  }

  if (current === yesterday) {
    return `last seen yesterday at ${formatLocalTime(date)}`;
  }

  return `last seen ${formatLocalDate(date)} at ${formatLocalTime(date)}`;
}

export function BrowserLocalTimestamp({
  value,
  className,
  variant = "datetime",
  fallback = "",
}: BrowserLocalTimestampProps) {
  const date = toDate(value);

  const label = (() => {
    if (!date) return fallback;

    if (variant === "time") return formatLocalTime(date);
    if (variant === "dateLabel") return formatDateLabel(date);
    if (variant === "lastSeen") return formatLastSeen(date);

    return formatLocalDateTime(date);
  })();

  return (
    <span suppressHydrationWarning className={cn(className)}>
      {label}
    </span>
  );
}
