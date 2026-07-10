export function AppSplashScreen() {
  return (
    <div className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center justify-center">
        <div className="w-full rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sm font-semibold text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
              H
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Loading
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                Preparing your workspace
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="h-3 w-24 rounded-full bg-muted" />
            <div className="h-4 w-full max-w-sm rounded-full bg-muted/70" />
            <div className="h-4 w-5/6 rounded-full bg-muted/70" />
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/30 p-4 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="h-4 w-36 rounded-full bg-muted/80" />
            <div className="mt-3 h-3 w-full max-w-md rounded-full bg-muted/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
