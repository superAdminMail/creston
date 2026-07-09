const ROOT_CLASS =
  "min-h-screen bg-white/75 px-4 py-5 text-slate-950 backdrop-blur-xl sm:px-6 sm:py-6 lg:px-8 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.92),rgba(5,11,31,0.98))] dark:text-slate-100";

const SHELL_CLASS =
  "mx-auto w-full max-w-7xl rounded-[2rem] border border-slate-200/80 bg-white/75 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-6 md:p-8 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(8,18,36,0.94),rgba(5,11,31,0.98))] dark:shadow-[0_28px_60px_rgba(0,0,0,0.34)]";

const PANEL_CLASS =
  "rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:bg-white/[0.04]";

const CARD_CLASS =
  "rounded-[1.5rem] border border-border/60 bg-white/75 shadow-sm dark:bg-white/[0.04]";

const SUBCARD_CLASS =
  "rounded-2xl border border-border/60 bg-white/75 shadow-sm dark:bg-white/[0.04]";

const ACCENT_LINE = "bg-sky-700/10 dark:bg-sky-300/10";
const PRIMARY_LINE = "bg-slate-200/80 dark:bg-white/10";
const SOFT_LINE = "bg-slate-200/60 dark:bg-white/5";

export default function Loading() {
  return (
    <div className={SHELL_CLASS}>
      <div className="flex flex-col gap-6 border-b border-slate-200/80 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 dark:border-white/10">
        <div className="max-w-3xl">
          <div className={`h-3 w-24 rounded-full ${ACCENT_LINE}`} />
          <div className={`mt-4 h-10 w-56 rounded-2xl ${PRIMARY_LINE}`} />
          <div className={`mt-3 h-16 max-w-3xl rounded-2xl ${SOFT_LINE}`} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:min-w-[340px] lg:max-w-[420px]">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className={PANEL_CLASS}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <div className={`h-3 w-20 rounded-full ${ACCENT_LINE}`} />
                  <div className={`h-5 w-28 rounded-2xl ${PRIMARY_LINE}`} />
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 shadow-sm">
                  <div className="h-5 w-5 rounded-md bg-sky-700/20 dark:bg-sky-300/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-5">
          <div className={`h-3 w-20 rounded-full ${ACCENT_LINE}`} />
          <div className={`mt-3 h-6 w-64 rounded-2xl ${PRIMARY_LINE}`} />
          <div className={`mt-3 h-12 max-w-3xl rounded-2xl ${SOFT_LINE}`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className={CARD_CLASS}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 shadow-sm">
                  <div className="h-5 w-5 rounded-md bg-sky-700/20 dark:bg-sky-300/20" />
                </div>
                <div className={`h-7 w-20 rounded-full ${PRIMARY_LINE}`} />
              </div>
              <div className={`mt-5 h-4 w-36 rounded-full ${PRIMARY_LINE}`} />
              <div className={`mt-3 h-12 rounded-2xl ${SOFT_LINE}`} />
              <div className={`mt-4 h-3 w-28 rounded-full ${ACCENT_LINE}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className={PANEL_CLASS}>
            <div className="mb-5">
              <div className={`h-3 w-16 rounded-full ${ACCENT_LINE}`} />
              <div className={`mt-3 h-6 w-52 rounded-2xl ${PRIMARY_LINE}`} />
              <div className={`mt-3 h-12 max-w-3xl rounded-2xl ${SOFT_LINE}`} />
            </div>

            <div className="space-y-4">
              {Array.from({ length: 4 }).map((__, rowIndex) => (
                <div key={rowIndex} className={SUBCARD_CLASS}>
                  <div className="flex items-start justify-between gap-3">
                    <div className={`h-12 flex-1 rounded-2xl ${SOFT_LINE}`} />
                    <div className={`h-12 w-24 rounded-2xl ${PRIMARY_LINE}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className={PANEL_CLASS}>
            <div className={`h-10 w-40 rounded-full ${ACCENT_LINE}`} />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <div key={rowIndex} className={SUBCARD_CLASS}>
                  <div className={`h-24 rounded-2xl ${SOFT_LINE}`} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:bg-white/[0.04] sm:p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className={`h-3 w-28 rounded-full ${ACCENT_LINE}`} />
            <div className={`mt-3 h-6 w-72 rounded-2xl ${PRIMARY_LINE}`} />
            <div className={`mt-3 h-12 max-w-3xl rounded-2xl ${SOFT_LINE}`} />
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[340px]">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className={PANEL_CLASS} />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className={`h-5 w-64 rounded-full ${PRIMARY_LINE}`} />
            <div className="flex items-center gap-2">
              <div className={`h-8 w-28 rounded-full ${PRIMARY_LINE}`} />
              <div className={`h-8 w-20 rounded-full ${PRIMARY_LINE}`} />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 shadow-sm dark:bg-white/[0.04]">
            <div className={`h-12 ${SOFT_LINE}`} />
            <div className="space-y-0 divide-y divide-border/60">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 px-4 py-4">
                  <div className={`h-4 w-4 rounded-sm ${PRIMARY_LINE}`} />
                  <div className={`h-12 rounded-2xl ${SOFT_LINE}`} />
                  <div className={`h-12 rounded-2xl ${SOFT_LINE}`} />
                  <div className={`h-6 rounded-full ${PRIMARY_LINE}`} />
                  <div className={`h-6 rounded-full ${PRIMARY_LINE}`} />
                  <div className={`h-5 rounded-full ${PRIMARY_LINE}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:bg-white/[0.04] sm:p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className={`h-3 w-24 rounded-full ${ACCENT_LINE}`} />
            <div className={`mt-3 h-6 w-72 rounded-2xl ${PRIMARY_LINE}`} />
            <div className={`mt-3 h-12 max-w-3xl rounded-2xl ${SOFT_LINE}`} />
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[440px]">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={PANEL_CLASS} />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-white/75 p-4 shadow-sm dark:bg-white/[0.04]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className={`h-5 w-72 rounded-full ${PRIMARY_LINE}`} />
            <div className="flex items-center gap-2">
              <div className={`h-8 w-28 rounded-full ${PRIMARY_LINE}`} />
              <div className={`h-8 w-20 rounded-full ${PRIMARY_LINE}`} />
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border/60 bg-white/75 shadow-sm dark:bg-white/[0.04]">
            <div className={`h-12 ${SOFT_LINE}`} />
            <div className="space-y-0 divide-y divide-border/60">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 px-4 py-4">
                  <div className={`h-4 w-4 rounded-sm ${PRIMARY_LINE}`} />
                  <div className={`h-12 rounded-2xl ${SOFT_LINE}`} />
                  <div className={`h-12 rounded-2xl ${SOFT_LINE}`} />
                  <div className={`h-12 rounded-2xl ${SOFT_LINE}`} />
                  <div className={`h-6 rounded-full ${PRIMARY_LINE}`} />
                  <div className={`h-5 rounded-full ${PRIMARY_LINE}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
