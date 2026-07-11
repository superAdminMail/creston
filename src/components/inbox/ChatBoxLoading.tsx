"use client";

import { cn } from "@/lib/utils";

type ChatBoxLoadingProps = {
  fillViewport?: boolean;
  className?: string;
};

function LoadingLine({ className }: { className: string }) {
  return <div className={cn("rounded-full bg-slate-200/80 dark:bg-white/10", className)} />;
}

function LoadingBubble({
  align = "left",
}: {
  align?: "left" | "right";
}) {
  const isOwn = align === "right";

  return (
    <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(75%,42rem)] rounded-[1.35rem] px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
          isOwn
            ? "border border-sky-200/40 bg-sky-500"
            : "border border-slate-200/80 bg-white/92 dark:border-white/8 dark:bg-white/[0.05]",
        )}
      >
        <div className="space-y-2">
          <LoadingLine
            className={cn("h-4", isOwn ? "bg-white/30" : "bg-slate-200/80 dark:bg-white/10")}
          />
          <LoadingLine
            className={cn(
              "h-4 w-5/6",
              isOwn ? "bg-white/30" : "bg-slate-200/80 dark:bg-white/10",
            )}
          />
          <div className="flex justify-end">
            <LoadingLine
              className={cn(
                "h-3 w-16",
                isOwn ? "bg-white/30" : "bg-slate-200/80 dark:bg-white/10",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatBoxLoading({
  fillViewport = false,
  className,
}: ChatBoxLoadingProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-[1.9rem] border border-slate-200/80 bg-white/88 text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/92 dark:text-white dark:shadow-[0_24px_60px_rgba(2,6,23,0.25)]",
        fillViewport &&
          "h-[calc(100dvh-9rem)] max-h-[calc(100dvh-9rem)]",
        className,
      )}
    >
      <div className="shrink-0 rounded-t-[1.9rem] border-b border-slate-200/80 bg-white/75 dark:border-white/10 dark:bg-slate-950/92">
        <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-4 py-3">
          <div className="h-9 w-9 shrink-0 rounded-full bg-slate-200/80 dark:bg-white/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <LoadingLine className="h-4 w-40" />
            <LoadingLine className="h-3.5 w-56" />
            <LoadingLine className="h-3 w-24" />
          </div>
          <LoadingLine className="h-8 w-20 shrink-0" />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-gutter:stable]">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-3">
            <div className="mx-auto rounded-full border border-slate-200/80 bg-white/88 px-3 py-1 dark:border-white/10 dark:bg-slate-950/85">
              <LoadingLine className="h-3 w-16" />
            </div>

            <LoadingBubble align="left" />
            <LoadingBubble align="right" />
            <LoadingBubble align="left" />

            <div className="h-px w-full shrink-0" />
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-b-[1.9rem] border-t border-slate-200/80 bg-white/75 dark:border-white/10 dark:bg-slate-950/92">
        <div className="mx-auto w-full max-w-4xl px-4 py-3">
          <div className="space-y-3">
            <div className="flex items-end gap-2 rounded-[1.5rem] border border-slate-200/80 bg-white/88 p-2 shadow-[0_14px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_14px_40px_rgba(2,6,23,0.16)]">
              <div className="h-11 w-11 shrink-0 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <div className="min-w-0 flex-1">
                <LoadingLine className="h-11 w-full rounded-2xl" />
              </div>
              <LoadingLine className="h-11 w-20 shrink-0 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
