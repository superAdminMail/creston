"use client";

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  online?: boolean;
  lastSeenAt?: Date | string | null;
  showMenuButton?: boolean;
  onMenuToggle?: () => void;
};

export default function ChatHeader({
  title,
  subtitle,
  online,
  lastSeenAt,
  showMenuButton,
  onMenuToggle,
}: Props) {
  const lastSeenText = (() => {
    if (!lastSeenAt) return "offline";
    const date =
      typeof lastSeenAt === "string" ? new Date(lastSeenAt) : lastSeenAt;
    if (Number.isNaN(date.getTime())) return "offline";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (diffMs >= 0 && diffMs < 60_000) return "last seen just now";
    if (diffMs >= 60_000 && diffMs < 3_600_000) {
      const mins = Math.floor(diffMs / 60_000);
      return `last seen ${mins}m ago`;
    }

    const toUtcYmd = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
        d.getUTCDate(),
      ).padStart(2, "0")}`;

    const formatTimeUtc = (d: Date) => {
      const hours = String(d.getUTCHours()).padStart(2, "0");
      const minutes = String(d.getUTCMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    const todayUtc = toUtcYmd(now);
    const dateUtc = toUtcYmd(date);
    const yesterdayUtc = toUtcYmd(new Date(now.getTime() - 86_400_000));

    if (dateUtc === todayUtc) {
      return `last seen today at ${formatTimeUtc(date)}`;
    }
    if (dateUtc === yesterdayUtc) {
      return `last seen yesterday at ${formatTimeUtc(date)}`;
    }
    return `last seen ${dateUtc} at ${formatTimeUtc(date)}`;
  })();

  const clickable = Boolean(onMenuToggle);
  const Root = clickable ? "button" : "div";

  return (
    <Root
      type={clickable ? "button" : undefined}
      onClick={onMenuToggle}
      aria-label={clickable ? "Open conversation details" : undefined}
      className={cn(
        "flex h-full min-h-0 w-full items-center bg-transparent text-left text-slate-950 dark:text-white",
        clickable &&
          "cursor-pointer transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.03]",
      )}
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-slate-100 text-sm font-medium text-slate-700 dark:bg-muted dark:text-white">
            {subtitle?.charAt(0).toUpperCase() ?? "S"}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-tight">
            {title}
          </p>
          <p>
            <span className="text-sm text-slate-600 dark:text-muted-foreground">
              {subtitle}
            </span>
          </p>
          <p
            className={cn(
              "text-[11px]",
              online
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-500 dark:text-muted-foreground",
            )}
          >
            {online ? "online" : lastSeenText}
          </p>
        </div>

        {clickable && showMenuButton ? (
          <span className="ml-3 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 text-xs font-medium text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            Details
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
    </Root>
  );
}
