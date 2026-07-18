export default function Loading() {
  return (
    <div className="dashboard-shell min-h-screen bg-card text-slate-950 dark:bg-card dark:text-slate-100">
      <div className="h-16 border-b border-slate-200 bg-card px-4 sm:px-6 lg:px-8 dark:border-white/10">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[1.35rem] bg-slate-200/80 dark:bg-white/10" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <div className="h-2.5 w-40 rounded-full bg-slate-200/70 dark:bg-white/10" />
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="h-10 w-24 rounded-full bg-slate-200/70 dark:bg-white/10" />
            <div className="h-10 w-10 rounded-2xl bg-slate-200/70 dark:bg-white/10" />
          </div>
        </div>
      </div>

      <div className="md:pl-72">
        <aside className="dashboard-sidebar-shell fixed left-0 top-16 hidden h-[calc(100dvh-4rem)] w-72 md:block">
          <div className="h-full px-4 py-4">
            <div className="flex h-full flex-col rounded-[1.6rem] border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1728]/95">
              <div className="space-y-3">
                <div className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <div className="h-10 rounded-2xl bg-slate-200/70 dark:bg-white/10" />
                <div className="h-10 rounded-2xl bg-slate-200/70 dark:bg-white/10" />
              </div>

              <div className="mt-6 space-y-2">
                <div className="h-3 w-20 rounded-full bg-slate-200/80 dark:bg-white/10" />
                <div className="space-y-2">
                  <div className="h-11 rounded-2xl bg-slate-200/70 dark:bg-white/10" />
                  <div className="h-11 rounded-2xl bg-slate-200/70 dark:bg-white/10" />
                  <div className="h-11 rounded-2xl bg-slate-200/70 dark:bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="dashboard-shell-main min-h-[calc(100dvh-4rem)] bg-card px-4 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <div className="space-y-3">
              <div className="h-3 w-24 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <div className="h-8 w-72 rounded-full bg-slate-200/80 dark:bg-white/10" />
              <div className="h-4 w-full max-w-2xl rounded-full bg-slate-200/70 dark:bg-white/10" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="h-40 rounded-[1.6rem] border border-slate-200 bg-white/90 shadow-sm dark:border-white/10 dark:bg-[#0b1728]/95" />
              <div className="h-40 rounded-[1.6rem] border border-slate-200 bg-white/90 shadow-sm dark:border-white/10 dark:bg-[#0b1728]/95" />
              <div className="h-40 rounded-[1.6rem] border border-slate-200 bg-white/90 shadow-sm dark:border-white/10 dark:bg-[#0b1728]/95" />
            </div>

            <div className="h-96 rounded-[1.6rem] border border-slate-200 bg-white/90 shadow-sm dark:border-white/10 dark:bg-[#0b1728]/95" />
          </div>
        </main>
      </div>
    </div>
  );
}
