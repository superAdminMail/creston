"use client";

import type { ComponentType } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Gift,
  Landmark,
  PieChart,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import type { UserPerformanceData } from "@/actions/dashboard/get-user-performance-data";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DASHBOARD_PAGE_SURFACE_CLASS } from "../../../_components/dashboardSurfaces";
import { formatUsd } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";

type Props = {
  data: UserPerformanceData;
};

function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatReferenceLabel(reference: string) {
  if (reference.length <= 18) {
    return reference;
  }

  return `${reference.slice(0, 10)}…${reference.slice(-6)}`;
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className={surfaceCardClassName}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              {value}
            </h3>
            <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 shadow-sm sm:h-11 sm:w-11 dark:border-sky-400/20 dark:bg-sky-400/10">
            <Icon className="h-5 w-5 text-sky-700 dark:text-sky-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityRow({
  title,
  subtitle,
  dateLabel,
  reference,
  amount,
  direction,
}: UserPerformanceData["activities"][number]) {
  const isCredit = direction === "CREDIT";
  const Icon = isCredit ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex flex-col gap-3 rounded-[1.4rem] border border-border/60 bg-white/75 px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border px-3 py-3 shadow-sm",
            isCredit
              ? "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200"
              : "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-950 dark:text-white">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
          <p
            className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400"
            title={reference}
          >
            {dateLabel} | {formatReferenceLabel(reference)}
          </p>
        </div>
      </div>

      <span
        className={cn(
          "text-sm font-medium",
          isCredit ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300",
        )}
      >
        {isCredit ? "+" : "-"}
        {formatUsd(amount)}
      </span>
    </div>
  );
}

const performanceChartConfig = {
  investedCapital: {
    label: "Invested capital",
    color: "#7dc5ff",
  },
  realizedProfit: {
    label: "Realized profit",
    color: "#22c55e",
  },
};

const allocationChartConfig = {
  value: {
    label: "Current value",
    color: "#60a5fa",
  },
};

const surfaceCardClassName = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "rounded-[1.75rem] shadow-sm",
);

const softPillClassName =
  "inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100";

export function UserPerformancePageClient({ data }: Props) {
  const hasAssets = data.assets.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      <Tabs defaultValue="performance" className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className={softPillClassName}>
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              Portfolio intelligence
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl dark:text-white">
                Investment performance
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
                Track live portfolio value, realized gains, and historical
                investment activity from your confirmed orders.
              </p>
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-2 gap-2 rounded-[1.5rem] border border-border/60 bg-white/75 p-1 text-slate-400 shadow-sm sm:inline-flex sm:w-auto sm:grid-cols-none sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/[0.04]">
            <TabsTrigger
              value="performance"
              className="h-10 w-full justify-center rounded-xl border border-transparent px-3 text-xs font-medium text-slate-500 transition-colors transition-shadow duration-200 hover:text-slate-950 data-active:border-sky-200/70 data-active:bg-sky-50 data-active:text-sky-800 sm:h-11 sm:w-[172px] sm:justify-start sm:px-4 sm:text-sm dark:text-slate-400 dark:hover:text-white dark:data-active:border-sky-400/20 dark:data-active:bg-sky-400/10 dark:data-active:text-sky-100"
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-4.5 w-4.5 text-sky-700 dark:text-sky-300" />
                <span>Performance</span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              className="h-10 w-full justify-center rounded-xl border border-transparent px-3 text-xs font-medium text-slate-500 transition-colors transition-shadow duration-200 hover:text-slate-950 data-active:border-sky-200/70 data-active:bg-sky-50 data-active:text-sky-800 sm:h-11 sm:w-[172px] sm:justify-start sm:px-4 sm:text-sm dark:text-slate-400 dark:hover:text-white dark:data-active:border-sky-400/20 dark:data-active:bg-sky-400/10 dark:data-active:text-sky-100"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-300" />
                <span>Analytics</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="performance" className="mt-0 space-y-6">
          <Card
            className={cn(
              surfaceCardClassName,
              "overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.94))] dark:bg-[linear-gradient(135deg,rgba(10,31,68,0.88),rgba(7,18,38,0.98))]",
            )}
          >
            <CardContent className="relative p-6 sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.08),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.10),transparent_28%)]" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Total Portfolio Value
                  </p>
                  <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
                    {formatUsd(data.summary.totalPortfolioValue)}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-medium text-emerald-700 dark:text-emerald-300">
                      {formatUsd(data.summary.totalProfit)}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        data.summary.changePercent >= 0
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-rose-700 dark:text-rose-300",
                      )}
                    >
                      {formatPercent(data.summary.changePercent)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Invested capital
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                      {formatUsd(data.summary.totalInvestedCapital)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Active orders
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                      {data.summary.activeOrdersCount}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Matured orders
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                      {data.summary.maturedOrdersCount}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Profitable assets"
              value={String(data.summary.profitableAssetsCount)}
              hint="Orders currently carrying realized gains"
              icon={TrendingUp}
            />
            <StatCard
              title="Live portfolio balance"
              value={formatUsd(data.summary.totalPortfolioValue)}
              hint="Current valuation using order records and price data"
              icon={Landmark}
            />
            <StatCard
              title="Recent activity"
              value={String(data.activities.length)}
              hint="Latest investment, earning, and withdrawal entries"
              icon={Activity}
            />
          </div>

          <Card className={surfaceCardClassName}>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                    Referral overview
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Track your referral code, successful referrals, and rewards
                    credited to your account.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Referral code"
                  value={data.referral.referralCode ?? "Not generated"}
                  hint="Share this code to track new signups"
                  icon={Gift}
                />
                <StatCard
                  title="Referrals made"
                  value={String(data.referral.referredUsersCount)}
                  hint="Users linked to your referral code"
                  icon={Users}
                />
                <StatCard
                  title="Rewards earned"
                  value={formatUsd(data.referral.totalRewards)}
                  hint="Credited referral bonuses"
                  icon={TrendingUp}
                />
                <StatCard
                  title="Pending rewards"
                  value={String(data.referral.pendingRewardsCount)}
                  hint="Rewards waiting for an eligible destination"
                  icon={Activity}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={surfaceCardClassName}>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                    Promotional bonus
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Track your reserved platform bonus and the action needed to
                    unlock it.
                  </p>
                </div>

                <div className={softPillClassName}>
                  {data.welcomeBonus.nextActionLabel}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Reserved bonus"
                  value={formatUsd(data.welcomeBonus.pendingAmount)}
                  hint="Pending platform promotion reward"
                  icon={Gift}
                />
                <StatCard
                  title="Credited bonus"
                  value={formatUsd(data.welcomeBonus.creditedAmount)}
                  hint="Platform promotion rewards already unlocked"
                  icon={TrendingUp}
                />
                <StatCard
                  title="Pending rewards"
                  value={String(data.welcomeBonus.pendingRewardsCount)}
                  hint="Rewards waiting on your first eligible action"
                  icon={Activity}
                />
                <StatCard
                  title="Credited rewards"
                  value={String(data.welcomeBonus.creditedRewardsCount)}
                  hint="Welcome bonuses credited to your account"
                  icon={Landmark}
                />
              </div>
            </CardContent>
          </Card>

          {hasAssets ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {data.assets.map((asset) => (
                <Card
                  key={asset.orderId}
                  className={cn(
                    surfaceCardClassName,
                    "transition hover:border-sky-300/60 hover:bg-sky-50/60 dark:hover:bg-white/[0.05]",
                  )}
                >
                  <CardContent className="space-y-4 p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-medium text-slate-950 dark:text-white">
                          {asset.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {asset.planName} | {asset.typeLabel}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex w-fit self-start rounded-full border px-3 py-1 text-xs font-medium shadow-sm",
                          asset.model === "FIXED"
                            ? "border-sky-200/80 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-100"
                            : "border-emerald-200/70 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100",
                        )}
                      >
                        {asset.model}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                        {formatUsd(asset.value)}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Principal {formatUsd(asset.principal)}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Realized gain
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
                          {formatUsd(asset.profit)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          Return
                        </p>
                        <p
                          className={cn(
                            "mt-2 text-sm font-medium",
                            asset.profitPercent >= 0
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-rose-700 dark:text-rose-300",
                          )}
                        >
                          {formatPercent(asset.profitPercent)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{asset.periodLabel}</span>
                      <span className="text-slate-300 dark:text-slate-600">|</span>
                      <span>{asset.isMatured ? "Matured" : "Active"}</span>
                      {asset.symbol ? (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">|</span>
                          <span>{asset.symbol}</span>
                        </>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className={cn(surfaceCardClassName, "text-center")}>
              <CardContent className="space-y-3 p-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200/70 bg-sky-50 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/10">
                  <TrendingUp className="h-6 w-6 text-sky-700 dark:text-sky-300" />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                  No confirmed investments yet
                </h3>
                <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                  Once your investment orders are confirmed, this page will show
                  live valuation, realized gains, and performance activity from
                  the database.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className={surfaceCardClassName}>
            <CardContent className="space-y-4 p-6">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                  Recent activity
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Latest investment orders, profit postings, and withdrawal
                  events tied to your portfolio.
                </p>
              </div>

              <div className="space-y-3">
                {data.activities.length ? (
                  data.activities.map((item) => (
                    <ActivityRow key={item.id} {...item} />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/60 bg-white/75 px-4 py-5 text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                    No performance activity has been recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Invested capital"
              value={formatUsd(data.summary.totalInvestedCapital)}
              hint="Confirmed order volume across your portfolio"
              icon={Landmark}
            />
            <StatCard
              title="Realized gains"
              value={formatUsd(data.summary.totalProfit)}
              hint="Ledger-backed profits and accrued fixed returns"
              icon={ArrowUpRight}
            />
            <StatCard
              title="Tracked assets"
              value={String(data.assets.length)}
              hint="Orders included in valuation and analytics"
              icon={PieChart}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <Card className={surfaceCardClassName}>
              <CardContent className="space-y-5 p-6">
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                    Capital vs realized profit
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Six-month view of confirmed investment capital and realized
                    profit recorded in the ledger.
                  </p>
                </div>

                <ChartContainer
                  config={performanceChartConfig}
                  className="h-[320px] w-full"
                >
                  <AreaChart data={data.analytics.monthly}>
                    <defs>
                      <linearGradient
                        id="performance-capital"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-investedCapital)"
                          stopOpacity={0.28}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-investedCapital)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="performance-profit"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-realizedProfit)"
                          stopOpacity={0.24}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-realizedProfit)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        `$${Number(value).toLocaleString()}`
                      }
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <div className="flex w-full items-center justify-between gap-3">
                              <span className="text-muted-foreground">
                                {name === "investedCapital"
                                  ? "Invested capital"
                                  : "Realized profit"}
                              </span>
                              <span className="font-medium text-foreground">
                                {formatUsd(Number(value))}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="investedCapital"
                      stroke="var(--color-investedCapital)"
                      fill="url(#performance-capital)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="realizedProfit"
                      stroke="var(--color-realizedProfit)"
                      fill="url(#performance-profit)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className={surfaceCardClassName}>
              <CardContent className="space-y-5 p-6">
                <div>
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                    Asset allocation
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Current value by asset using confirmed orders and the latest
                    available valuation data.
                  </p>
                </div>

                <ChartContainer
                  config={allocationChartConfig}
                  className="h-[320px] w-full"
                >
                  <BarChart data={data.analytics.allocation} layout="vertical">
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        `$${Number(value).toLocaleString()}`
                      }
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={110}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          formatter={(value, _name, item) => (
                            <div className="grid gap-1">
                              <span className="font-medium text-foreground">
                                {formatUsd(Number(value))}
                              </span>
                              <span className="text-muted-foreground">
                                Return{" "}
                                {formatPercent(
                                  Number(item.payload?.profitPercent ?? 0),
                                )}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--color-value)"
                      radius={[8, 8, 8, 8]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
