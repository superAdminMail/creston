import {
  ArrowUpRight,
  AlertTriangle,
  BriefcaseBusiness,
  Landmark,
  Layers3,
  type LucideIcon,
  ShoppingBagIcon,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/formatters/formatters";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../_components/dashboardSurfaces";

type UserDashboardPageProps = {
  userName: string;
  stats: UserDashboardStats;
  investmentProfileComplete: boolean;
};

export type UserDashboardStats = {
  investmentsCount: number;
  currentInvestment: number;
  accountBalance: number;
  totalInvestment: number;
  investmentPlan: string;
  totalEarnedProfits: number;
  inactiveInvestmentOrder: {
    id: string;
    planName: string;
    href: string;
  } | null;
};

function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
}) {
  return (
    <div
      className={cn(
        DASHBOARD_PAGE_SURFACE_CLASS,
        "group p-4 sm:p-5 transition-colors hover:border-sky-400/30",
      )}
    >
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 space-y-2.5 sm:space-y-3">
          <p className="text-sm font-medium text-sky-700/90 dark:text-sky-300/80">
            {title}
          </p>
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl xl:text-[1.75rem]">
              {value}
            </h3>
            {subtitle ? (
              <p className="text-xs leading-5 text-slate-600 dark:text-slate-400 sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10 text-sky-700 shadow-[0_10px_24px_rgba(59,130,246,0.16)] sm:h-11 sm:w-11 dark:text-sky-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function UserDashboardPage({
  userName,
  stats,
  investmentProfileComplete,
}: UserDashboardPageProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="space-y-5 sm:space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-sky-700 shadow-sm dark:text-sky-200">
              <span className="h-2 w-2 rounded-full bg-[#3c9ee0]" />
              Investment Dashboard
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-white">
                Hi, {userName}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
                Welcome back. Here&apos;s a clear overview of your investment
                account, current position, and portfolio activity.
              </p>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 rounded-2xl border border-sky-400/20 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-[0_12px_28px_rgba(59,130,246,0.14)] sm:w-fit dark:bg-white/[0.04] dark:text-slate-200">
            <ArrowUpRight className="h-4 w-4 text-sky-700 dark:text-sky-300" />
            Secure portfolio overview
          </div>
        </div>
      </section>

      {!investmentProfileComplete ? (
        <Alert className="rounded-[1.5rem] border border-amber-200/70 bg-amber-50/90 px-5 py-4 text-amber-950 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-200" />
          <AlertTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold">
              Your investment profile is not set up yet
            </span>
            <Link
              href="/account/dashboard/user/investment-profile/edit"
              className="inline-flex items-center rounded-full border border-amber-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-amber-900 transition hover:bg-white dark:bg-white/[0.04] dark:border-amber-400/20 dark:text-amber-100"
            >
              Complete profile
            </Link>
          </AlertTitle>
        </Alert>
      ) : null}

      {stats.inactiveInvestmentOrder ? (
        <Alert className="rounded-[1.5rem] border border-amber-200/70 bg-amber-50/90 px-5 py-4 text-amber-950 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-200" />
          <AlertTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold">
              One of your investment orders is now inactive
              {stats.inactiveInvestmentOrder.planName
                ? `: ${stats.inactiveInvestmentOrder.planName}`
                : "."}
            </span>
            <Link
              href={stats.inactiveInvestmentOrder.href}
              className="inline-flex items-center rounded-full border border-amber-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-amber-900 transition hover:bg-white dark:bg-white/[0.04] dark:border-amber-400/20 dark:text-amber-100"
            >
              View order
            </Link>
          </AlertTitle>
        </Alert>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <DashboardStatCard
          title="Account Balance"
          value={formatUsd(stats.accountBalance)}
          subtitle="Available balance for withdrawal"
          icon={Wallet}
        />
        <DashboardStatCard
          title="Earned profits"
          value={formatUsd(stats.totalEarnedProfits)}
          subtitle="Total earnings across investments"
          icon={ArrowUpRight}
        />
        <DashboardStatCard
          title="Current Investment"
          value={formatUsd(stats.currentInvestment)}
          subtitle="Current active investment capital"
          icon={Layers3}
        />
        <DashboardStatCard
          title="Total Investment"
          value={formatUsd(stats.totalInvestment)}
          subtitle="Combined capital invested"
          icon={Landmark}
        />
        <DashboardStatCard
          title="Active Orders"
          value={String(stats.investmentsCount)}
          subtitle="Total active and historical entries"
          icon={ShoppingBagIcon}
        />
        <DashboardStatCard
          title="Investment Plan"
          value={stats.investmentPlan || "-"}
          subtitle="Most recent or active investment plan"
          icon={BriefcaseBusiness}
        />
      </section>
    </div>
  );
}
