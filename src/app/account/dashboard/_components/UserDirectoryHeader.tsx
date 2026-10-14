"use client";

import type { ReactNode } from "react";
import { ShieldCheck, TrendingUp, UserCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDirectoryCurrency } from "@/lib/formatters/directory";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "./dashboardSurfaces";
import { cn } from "@/lib/utils";

const heroPillClass =
  "inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300";

const statTitleClass =
  "text-xs font-medium uppercase tracking-[0.22em] text-sky-700/90 dark:text-sky-300/80";

type UserDirectoryHeaderProps = {
  badgeLabel: string;
  title: string;
  description: string;
  stats: {
    totalUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    totalManagedFunds: number;
  };
};

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
};

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className={DASHBOARD_PAGE_SURFACE_CLASS}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className={statTitleClass}>{title}</p>

            <h3 className="break-words text-2xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-white">
              {value}
            </h3>

            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-500/10 px-3 py-3 text-sky-700 dark:text-sky-200">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserDirectoryHeader({
  badgeLabel,
  title,
  description,
  stats,
}: UserDirectoryHeaderProps) {
  return (
    <>
      <section
        className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-6 md:p-8`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge className={cn(heroPillClass, "hidden md:block")}>
              {badgeLabel}
            </Badge>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
                {title}
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 md:text-base">
                {description}
              </p>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
              <p className={statTitleClass}>Managed accounts</p>

              <p className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-950 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>

            <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-4`}>
              <p className={statTitleClass}>Managed capital</p>

              <p className="mt-2 break-words text-2xl font-semibold leading-tight text-slate-950 dark:text-white">
                {formatDirectoryCurrency(stats.totalManagedFunds)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total accounts"
          value={String(stats.totalUsers)}
          description="Accounts included in this directory"
          icon={<Users className="h-5 w-5" />}
        />

        <StatCard
          title="Verified Accounts"
          value={String(stats.verifiedUsers)}
          description="Profiles with verified identity or account status"
          icon={<ShieldCheck className="h-5 w-5" />}
        />

        <StatCard
          title="Active Accounts"
          value={String(stats.activeUsers)}
          description="Accounts currently active on the platform"
          icon={<UserCheck className="h-5 w-5" />}
        />

        <StatCard
          title="Invested Capital"
          value={formatDirectoryCurrency(stats.totalManagedFunds)}
          description="Total capital tracked across all listed records"
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </section>
    </>
  );
}
