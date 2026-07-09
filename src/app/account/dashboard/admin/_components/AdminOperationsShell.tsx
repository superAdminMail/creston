import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardResourceCollection } from "@/lib/services/dashboard/dashboardResourceService";
import { cn } from "@/lib/utils";
import { DashboardSectionCard } from "../../_components/DashboardSectionCard";
import {
  DASHBOARD_PAGE_SURFACE_CLASS,
  DASHBOARD_SECTION_INSET_CLASS,
} from "../../_components/dashboardSurfaces";

export type AdminOperationsStat = {
  title: string;
  value: string;
  hint: string;
};

type AdminOperationsShellProps = {
  title: string;
  description: string;
  collections?: DashboardResourceCollection[];
  stats?: AdminOperationsStat[];
  children?: ReactNode;
  showTitleIcon?: boolean;
};

export function AdminOperationsShell({
  title,
  description,
  collections,
  stats,
  children,
  showTitleIcon = true,
}: AdminOperationsShellProps) {
  return (
    <div className="space-y-6">
      <DashboardSectionCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-sky-700 dark:text-sky-300">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Admin workspace
            </div>
            <div className="flex items-center gap-3">
              {showTitleIcon ? (
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
              ) : null}
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
                {title}
              </h1>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
              {description}
            </p>
          </div>
        </div>
      </DashboardSectionCard>

      {stats?.length ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className={DASHBOARD_PAGE_SURFACE_CLASS}
            >
              <CardContent className="space-y-2 p-5">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-sky-700/90 dark:text-sky-300/80">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                  {stat.hint}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {children}

      {collections?.length ? (
        <section className="grid gap-6 xl:grid-cols-2">
          {collections.map((collection) => (
            <article
              key={collection.href}
              className="rounded-[1.9rem] border border-border/60 bg-white/75 p-6 shadow-sm sm:p-7 dark:bg-white/[0.04]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                    {collection.label}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {collection.total} record{collection.total === 1 ? "" : "s"}
                  </p>
                </div>

                <Link
                  href={collection.href}
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
                >
                  Open route
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {collection.items.length ? (
                  collection.items.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        DASHBOARD_SECTION_INSET_CLASS.replace(
                          "rounded-[1.75rem]",
                          "rounded-[1.2rem]",
                        ),
                        "px-4 py-3",
                      )}
                    >
                      <p className="text-sm font-medium text-slate-950 dark:text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        {item.subtitle}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                        {item.meta}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-white/75 px-4 py-5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                    No records found for this route yet.
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
