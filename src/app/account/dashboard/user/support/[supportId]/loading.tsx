import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto min-h-[calc(100dvh-7rem)] w-full max-w-none px-0 py-0">
      <section className="flex min-h-[calc(100dvh-7rem)] flex-1 justify-center">
        <div className="flex h-full min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-[1.9rem] border border-slate-200/80 bg-white/88 text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/92 dark:text-white dark:shadow-[0_24px_60px_rgba(2,6,23,0.25)]">
          <div className="shrink-0 rounded-t-[1.9rem] border-b border-slate-200/80 bg-white/75 px-4 py-3 dark:border-white/10 dark:bg-slate-950/92">
            <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-3.5 w-56 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <Skeleton className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto overscroll-contain px-4 py-4 [scrollbar-gutter:stable]">
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-3">
                <div className="mx-auto rounded-full border border-slate-200/80 bg-white/88 px-3 py-1 dark:border-white/10 dark:bg-slate-950/85">
                  <Skeleton className="h-3 w-16 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>

                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`flex w-full ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[min(75%,42rem)] rounded-[1.35rem] px-4 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
                        index % 2 === 0
                          ? "border border-slate-200/80 bg-white/92 dark:border-white/8 dark:bg-white/[0.05]"
                          : "border border-sky-200/40 bg-sky-500"
                      }`}
                    >
                      <div className="space-y-2">
                        <Skeleton
                          className={`h-4 rounded-full ${
                            index % 2 === 0
                              ? "bg-slate-200/80 dark:bg-white/10"
                              : "bg-white/30"
                          }`}
                        />
                        <Skeleton
                          className={`h-4 w-5/6 rounded-full ${
                            index % 2 === 0
                              ? "bg-slate-200/80 dark:bg-white/10"
                              : "bg-white/30"
                          }`}
                        />
                        <div className="flex justify-end">
                          <Skeleton
                            className={`h-3 w-16 rounded-full ${
                              index % 2 === 0
                                ? "bg-slate-200/80 dark:bg-white/10"
                                : "bg-white/30"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="h-px w-full shrink-0" />
              </div>
            </div>
          </div>

          <div className="shrink-0 rounded-b-[1.9rem] border-t border-slate-200/80 bg-white/75 px-4 py-3 dark:border-white/10 dark:bg-slate-950/92">
            <div className="mx-auto w-full max-w-4xl">
              <div className="space-y-3">
                <div className="flex items-end gap-2 rounded-[1.5rem] border border-slate-200/80 bg-white/88 p-2 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_14px_40px_rgba(2,6,23,0.16)]">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-full bg-slate-200/80 dark:bg-white/10" />
                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-11 w-full rounded-2xl bg-slate-200/80 dark:bg-white/10" />
                  </div>
                  <Skeleton className="h-11 w-20 shrink-0 rounded-full bg-slate-200/80 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
