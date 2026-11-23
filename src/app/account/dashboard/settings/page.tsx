import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

import SecuritySection from "@/components/settings/SecuritySection";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { cn } from "@/lib/utils";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../_components/dashboardSurfaces";

const SECURITY_PAGE_CLASS = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "overflow-hidden rounded-[2rem] p-5 sm:p-7 lg:p-8",
);

export default async function Page() {
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className={SECURITY_PAGE_CLASS}>
        <header className="space-y-5">
          <Link
            href="/account/dashboard/profile"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                Account security
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-white">
                  Security & access
                </h1>

                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
                  Manage your password, account protection and access settings
                  for {siteName}.
                </p>
              </div>
            </div>

            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-700 dark:text-sky-200">
              <ShieldCheck className="size-7" />
            </div>
          </div>
        </header>
      </div>

      <section aria-label="Security settings">
        <SecuritySection siteName={siteName} />
      </section>
    </div>
  );
}
