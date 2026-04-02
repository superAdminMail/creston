import {
  ArrowUpRight,
  BriefcaseBusiness,
  Landmark,
  Layers3,
  Wallet,
} from "lucide-react";

import { formatUsd } from "@/lib/formatters";

type UserDashboardPageProps = {
  userName: string;
  stats: UserDashboardStats;
};

export type UserDashboardStats = {
  investmentsCount: number;
  currentInvestment: number;
  accountBalance: number;
  totalInvestment: number;
  investmentType: string;
};

type StatIconProps = {
  className?: string;
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
  icon: (props: StatIconProps) => React.JSX.Element;
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
}: UserDashboardPageProps) {
  return (
    <div className="min-h-full bg-transparent">
      <div className="space-y-5 sm:space-y-6">
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
            title="Investments"
            value={String(stats.investmentsCount)}
            subtitle="Total active and historical entries"
            icon={BriefcaseBusiness}
          />

          <DashboardStatCard
            title="Current Investment"
            value={formatUsd(stats.currentInvestment)}
            subtitle="Latest active investment position"
            icon={Layers3}
          />

          <DashboardStatCard
            title="Account Balance"
            value={formatUsd(stats.accountBalance)}
            subtitle="Available wallet balance"
            icon={Wallet}
          />

          <DashboardStatCard
            title="Total Investment"
            value={formatUsd(stats.totalInvestment)}
            subtitle="Combined capital across investments"
            icon={Landmark}
          />

          <DashboardStatCard
            title="Investment Type"
            value={stats.investmentType || "-"}
            subtitle="Primary selected plan"
            icon={BriefcaseBusiness}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Portfolio Summary
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  A simple overview of your current investment standing.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-white/60">Current Position</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatUsd(stats.currentInvestment)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-white/60">Total Portfolio Value</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatUsd(stats.totalInvestment)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-white/60">Available Balance</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatUsd(stats.accountBalance)}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-white/60">Investment Plan</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {stats.investmentType || "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] sm:p-6">
            <h2 className="text-lg font-semibold text-white">
              Account Insight
            </h2>
            <p className="mt-1 text-sm text-white/55">
              Your dashboard is structured to keep your key financial data
              visible at a glance.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-white/60">Status</p>
                <p className="mt-1 font-medium text-white">
                  Portfolio monitored
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-white/60">Focus</p>
                <p className="mt-1 font-medium text-white">
                  Stable growth and account visibility
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm text-white/60">Plan Type</p>
                <p className="mt-1 font-medium text-white">
                  {stats.investmentType || "Not selected"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
