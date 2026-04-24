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

import { formatUsd } from "@/lib/formatters/formatters";
import { Alert, AlertTitle } from "@/components/ui/alert";

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
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#3c9ee0]/30 hover:shadow-[0_18px_40px_rgba(0,0,0,0.24)] sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(60,158,224,0.10),transparent_35%)] opacity-100" />

      <div className="relative flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 space-y-2.5 sm:space-y-3">
          <p className="text-sm font-medium text-white/65">{title}</p>
          <div className="min-w-0 space-y-1">
            <h3 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl xl:text-[1.75rem]">
              {value}
            </h3>
            {subtitle ? (
              <p className="text-xs leading-5 text-white/50 sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#3c9ee0] sm:h-11 sm:w-11">
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
    <div className="min-h-full bg-transparent">
      <div className="space-y-5 sm:space-y-6">
        {!investmentProfileComplete ? (
          <Alert className="rounded-[1.5rem] border border-amber-400/20 bg-amber-500/10 px-5 py-4 text-amber-100 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <AlertTriangle className="h-4 w-4 text-amber-200" />
            <AlertTitle className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold">
                Your investment profile is not set up yet
              </span>
              <Link
                href="/account/dashboard/user/investment-profile/edit"
                className="inline-flex items-center rounded-full border border-amber-300/30 bg-white/5 px-3 py-1 text-xs font-medium text-amber-50 transition hover:bg-white/10"
              >
                Complete profile
              </Link>
            </AlertTitle>
          </Alert>
        ) : null}

        <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,33,0.98),rgba(15,23,42,0.96))] px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(60,158,224,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_30%)]" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 px-3 py-1 text-xs font-medium text-[#8fd0ff]">
                <span className="h-2 w-2 rounded-full bg-[#3c9ee0]" />
                Investment Dashboard
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Hi, {userName}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                  Welcome back. Here&apos;s a clear overview of your investment
                  account, current position, and portfolio activity.
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 sm:w-fit">
              <ArrowUpRight className="h-4 w-4 text-[#3c9ee0]" />
              Secure portfolio overview
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-5">
          <DashboardStatCard
            title="Account Balance"
            value={formatUsd(stats.accountBalance)}
            subtitle="Available balance for withdrawals"
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
            subtitle="Current active investment amount"
            icon={Layers3}
          />
          <DashboardStatCard
            title="Total Investment"
            value={formatUsd(stats.totalInvestment)}
            subtitle="Combined capital across investments"
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
    </div>
  );
}
