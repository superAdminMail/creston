import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck, Sparkles } from "lucide-react";

type MaintenanceModePageProps = {
  siteName: string;
  siteTagline: string;
  supportEmail?: string | null;
  siteLogoUrl?: string | null;
};

export function MaintenanceModePage({
  siteName,
  siteTagline,
  supportEmail,
  siteLogoUrl,
}: MaintenanceModePageProps) {
  const supportHref = supportEmail ? `mailto:${supportEmail}` : "/contact";

  return (
    <section className="flex min-h-full flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,16,34,0.98),rgba(9,18,38,0.94))] px-4 py-6 shadow-[0_26px_80px_rgba(0,0,0,0.32)] sm:px-6 sm:py-8 lg:px-10 lg:py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 h-56 w-56 rounded-full bg-sky-500/12 blur-3xl sm:h-72 sm:w-72" />
          <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl sm:h-80 sm:w-80" />
        </div>

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] lg:items-center">
          <div className="space-y-5 sm:space-y-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200/20 bg-sky-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-100 sm:px-4 sm:text-[11px] sm:tracking-[0.22em]">
              <Clock3 className="h-3.5 w-3.5" />
              Scheduled maintenance
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/10 bg-white/[0.05] shadow-[0_14px_40px_rgba(37,99,235,0.14)] sm:h-16 sm:w-16">
                {siteLogoUrl ? (
                  <Image
                    src={siteLogoUrl}
                    alt={`${siteName} logo`}
                    width={48}
                    height={48}
                    className="h-10 w-10 rounded-2xl object-cover sm:h-12 sm:w-12"
                  />
                ) : (
                  <span className="text-base font-semibold uppercase tracking-[0.18em] text-white sm:text-lg sm:tracking-[0.2em]">
                    {siteName.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400 sm:text-sm sm:tracking-[0.28em]">
                  {siteTagline}
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                  We&apos;re improving the platform
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8 lg:text-lg">
              {siteName} is currently undergoing scheduled maintenance. We are
              making improvements to keep the experience fast, secure, and
              polished. Access will resume automatically as soon as the update
              is complete.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {supportEmail ? (
                <a
                  href={supportHref}
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
                >
                  Contact support
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={supportHref}
                  className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold sm:w-auto"
                >
                  Contact support
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              <div className="inline-flex w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 sm:w-auto">
                <Sparkles className="h-4 w-4 text-sky-300" />
                Premium service recovery in progress
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center">
                <div>
                  <ShieldCheck className="h-5 w-5 shrink-0 text-sky-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Security monitored
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    All platform services remain protected while the update is
                    applied.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center">
                <div>
                  <Clock3 className="h-5 w-5 shrink-0 text-sky-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Temporary interruption
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    The platform will be temporarily unavailable during the
                    update.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-sky-500/10 px-4 py-4 sm:flex-row sm:items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-200/30 bg-sky-500/15 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100">
                  OK
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    Designed for a clean return
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    The platform is designed to return to a clean, stable state
                    after the update.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
