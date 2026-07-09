"use client";

import {
  Activity,
  BriefcaseBusiness,
  CircleDollarSign,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/formatters/formatters";
import type { AdminAnalyticsData } from "@/lib/service/getAdminAnalyticsData";
import type { ComponentType } from "react";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../../_components/dashboardSurfaces";

const cashFlowChartConfig = {
  savingsDeposits: {
    label: "Savings deposits",
    color: "#38bdf8",
  },
  investmentFunding: {
    label: "Investment funding",
    color: "#8b5cf6",
  },
  withdrawalVolume: {
    label: "Withdrawal volume",
    color: "#fb7185",
  },
  earnings: {
    label: "Earnings",
    color: "#22c55e",
  },
} as const;

const activityChartConfig = {
  newUsers: {
    label: "New users",
    color: "#60a5fa",
  },
  paymentReviews: {
    label: "Payment reviews",
    color: "#f59e0b",
  },
  withdrawalRequests: {
    label: "Withdrawal requests",
    color: "#c084fc",
  },
} as const;

const queueChartConfig = {
  investmentPayments: {
    label: "Investment payments",
    color: "#38bdf8",
  },
  withdrawals: {
    label: "Withdrawals",
    color: "#8b5cf6",
  },
  kyc: {
    label: "KYC",
    color: "#f59e0b",
  },
  investmentOrders: {
    label: "Investment orders",
    color: "#22c55e",
  },
} as const;

const heroPillClass =
  "inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm transition hover:shadow-md dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300";

const summaryPillClass =
  "inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.08] dark:hover:text-white";

const queuePillClass =
  "inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 shadow-sm transition hover:shadow-md dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300";

function formatCompactCurrency(value: number) {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}b`;
  }

  if (absolute >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }

  if (absolute >= 1_000) {
    return `$${(value / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return formatCurrency(value);
}

function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function MetricCard({
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
    <Card
      className={`${DASHBOARD_PAGE_SURFACE_CLASS} rounded-[1.5rem] sm:rounded-[1.75rem]`}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky-700 sm:text-xs sm:tracking-[0.22em] dark:text-sky-300">
              {title}
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
              {value}
            </h3>
            <p className="text-xs leading-5 text-slate-600 sm:text-sm dark:text-slate-400">
              {hint}
            </p>
          </div>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-sky-200/80 bg-sky-50 text-sky-700 shadow-sm sm:h-11 sm:w-11 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeroHighlight({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className={`${DASHBOARD_PAGE_SURFACE_CLASS} rounded-2xl p-4 sm:p-5`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700 sm:tracking-[0.22em] dark:text-sky-300">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-xs sm:leading-5 dark:text-slate-400">
        {hint}
      </p>
    </div>
  );
}

export function AdminAnalyticsClient({ data }: { data: AdminAnalyticsData }) {
  const hasQueueItems = data.reviewQueue.some((item) => item.value > 0);

  return (
    <div className="space-y-5 ">
      <Card
        className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]`}
      >
        <CardContent className="p-5 sm:p-6 md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className={heroPillClass}>
                {data.siteName} Admin Analytics
              </Badge>

              <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl md:text-4xl dark:text-white">
                  Platform analytics
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base dark:text-slate-400">
                  A consolidated view of capital flow, review queues, user
                  growth, and operational activity across the platform.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={summaryPillClass}>
                  Active plans {formatCount(data.summary.activePlans)}
                </Badge>
                <Badge className={summaryPillClass}>
                  Funded orders {formatCount(data.summary.fundedOrders)}
                </Badge>
                <Badge className={summaryPillClass}>
                  Open queue {formatCount(data.summary.openReviewQueue)}
                </Badge>
              </div>
            </div>

            <div className="grid w-full gap-3 md:grid-cols-2 lg:max-w-xl">
              <HeroHighlight
                label="Capital tracked"
                value={formatCompactCurrency(data.summary.totalCapitalTracked)}
                hint="Savings deposits plus funded investment volume"
              />
              <HeroHighlight
                label="Total earnings"
                value={formatCompactCurrency(data.summary.totalEarnings)}
                hint="Accumulated investment earnings recorded in the ledger"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total users"
          value={formatCompactCount(data.summary.totalUsers)}
          hint="Registered customer accounts across the platform"
          icon={Users}
        />
        <MetricCard
          title="Active investors"
          value={formatCompactCount(data.summary.activeInvestors)}
          hint="Users with funded savings or investment activity"
          icon={BriefcaseBusiness}
        />
        <MetricCard
          title="Funded orders"
          value={formatCompactCount(data.summary.fundedOrders)}
          hint="Orders already converted into live capital"
          icon={CircleDollarSign}
        />
        <MetricCard
          title="Open review queue"
          value={formatCompactCount(data.summary.openReviewQueue)}
          hint="Pending withdrawals, KYC, payments, and funding reviews"
          icon={Activity}
        />
      </section>

      <div className="grid gap-5 xl:grid-cols-12">
        <Card
          className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden rounded-[1.75rem] xl:col-span-8`}
        >
          <CardHeader className="space-y-2 border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Capital flow
            </CardTitle>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Monthly movement across savings deposits, funded investment
              orders, withdrawals, and earnings.
            </p>
          </CardHeader>
          <CardContent className="px-3 py-4 sm:px-4 sm:py-5">
            <ChartContainer
              config={cashFlowChartConfig}
              className="h-[260px] w-full sm:h-[300px] lg:h-[340px]"
            >
              <LineChart data={data.monthly}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    formatCompactCurrency(Number(value))
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {name === "savingsDeposits"
                              ? "Savings deposits"
                              : name === "investmentFunding"
                                ? "Investment funding"
                                : name === "withdrawalVolume"
                                  ? "Withdrawal volume"
                                  : "Earnings"}
                          </span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend
                  verticalAlign="bottom"
                  content={<ChartLegendContent />}
                />
                <Line
                  type="monotone"
                  dataKey="savingsDeposits"
                  stroke="var(--color-savingsDeposits)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="investmentFunding"
                  stroke="var(--color-investmentFunding)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="withdrawalVolume"
                  stroke="var(--color-withdrawalVolume)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--color-earnings)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card
          className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden rounded-[1.75rem] xl:col-span-4`}
        >
          <CardHeader className="space-y-2 border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10">
            <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
              Current workload
            </CardTitle>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Live operational queue split by the main admin review surfaces.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-5 sm:py-5">
            {hasQueueItems ? (
              <>
                <ChartContainer
                  config={queueChartConfig}
                  className="h-[220px] w-full sm:h-[240px] lg:h-[260px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          hideLabel={false}
                          formatter={(value, name) => (
                            <div className="flex w-full items-center justify-between gap-4">
                              <span className="text-muted-foreground">
                                {name === "investmentPayments"
                                  ? "Investment payment reviews"
                                  : name === "withdrawals"
                                    ? "Withdrawal requests"
                                    : name === "kyc"
                                      ? "KYC reviews"
                                      : "Pending investment orders"}
                              </span>
                              <span className="font-medium text-foreground">
                                {formatCount(Number(value))}
                              </span>
                            </div>
                          )}
                        />
                      }
                    />
                    <Pie
                      data={data.reviewQueue}
                      dataKey="value"
                      nameKey="key"
                      innerRadius={48}
                      outerRadius={82}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {data.reviewQueue.map((item) => (
                        <Cell
                          key={item.key}
                          fill={`var(--color-${item.key})`}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="grid gap-3">
                  {data.reviewQueue.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]"
                    >
                      <p className="min-w-0 text-sm text-slate-600 dark:text-slate-300">
                        {item.label}
                      </p>
                      <Badge className={queuePillClass}>
                        {formatCount(item.value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/60 bg-white/75 px-6 text-center sm:h-[260px] dark:border-white/10 dark:bg-white/[0.04]">
                <ShieldCheck className="h-8 w-8 text-sky-700 dark:text-sky-300" />
                <p className="mt-4 text-base font-medium text-slate-950 dark:text-white">
                  No active workload
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Pending review queues are clear right now, so this surface is
                  waiting for incoming admin tasks.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card
        className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden rounded-[1.75rem]`}
      >
        <CardHeader className="space-y-2 border-b border-border/60 px-4 py-4 sm:px-6 sm:py-5 dark:border-white/10">
          <CardTitle className="text-base text-slate-950 sm:text-lg dark:text-white">
            Operational activity
          </CardTitle>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Monthly trend of new users, payment reviews, and withdrawal request
            volume.
          </p>
        </CardHeader>
        <CardContent className="px-3 py-4 sm:px-4 sm:py-5">
          <ChartContainer
            config={activityChartConfig}
            className="h-[240px] w-full sm:h-[280px] lg:h-[320px]"
          >
            <BarChart data={data.monthly}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatCompactCount(Number(value))}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-muted-foreground">
                          {name === "newUsers"
                            ? "New users"
                            : name === "paymentReviews"
                              ? "Payment reviews"
                              : "Withdrawal requests"}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatCount(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend
                verticalAlign="bottom"
                content={<ChartLegendContent />}
              />
              <Bar
                dataKey="newUsers"
                fill="var(--color-newUsers)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="paymentReviews"
                fill="var(--color-paymentReviews)"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="withdrawalRequests"
                fill="var(--color-withdrawalRequests)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
