"use client";

import type { ComponentType } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  CreditCard,
  DollarSign,
  LineChart as LineChartIcon,
  PiggyBank,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
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

import type { AdminAnalyticsData } from "@/lib/service/getAdminAnalyticsData";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/formatters/formatters";

type Props = {
  data: AdminAnalyticsData;
};

type TrendDirection = "up" | "down" | "neutral";

const capitalChartConfig = {
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
} as const;

const queueChartConfig = {
  investmentPayments: {
    label: "Investment payment reviews",
    color: "#38bdf8",
  },
  withdrawals: {
    label: "Withdrawal requests",
    color: "#8b5cf6",
  },
  kyc: {
    label: "KYC reviews",
    color: "#f59e0b",
  },
  investmentOrders: {
    label: "Pending investment orders",
    color: "#22c55e",
  },
} as const;

function formatCompactCount(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatChange(current: number, previous: number) {
  if (current === 0 && previous === 0) {
    return { direction: "neutral" as TrendDirection, label: "Live" };
  }

  if (previous === 0) {
    return {
      direction:
        current >= 0 ? ("up" as TrendDirection) : ("down" as TrendDirection),
      label: current > 0 ? "New" : "Live",
    };
  }

  const delta = ((current - previous) / previous) * 100;

  if (delta === 0) {
    return { direction: "neutral" as TrendDirection, label: "Flat" };
  }

  return {
    direction:
      delta > 0 ? ("up" as TrendDirection) : ("down" as TrendDirection),
    label: `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`,
  };
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-[0.28em] text-sky-300/80">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function HeroStatCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="h-full rounded-[1.5rem] border border-white/10 bg-white/[0.04] shadow-[0_14px_44px_rgba(0,0,0,0.16)]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex h-full flex-col gap-4 sm:gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                {label}
              </p>
              <h3 className="text-lg font-semibold tracking-tight text-white sm:text-2xl">
                {value}
              </h3>
              <p className="text-xs leading-5 text-slate-400 sm:text-sm">
                {helper}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200 sm:h-11 sm:w-11">
              <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  helper,
  change,
  direction,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper: string;
  change: string;
  direction: TrendDirection;
  icon: ComponentType<{ className?: string }>;
}) {
  const tone =
    direction === "up"
      ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/20"
      : direction === "down"
        ? "text-rose-300 bg-rose-500/10 border-rose-400/20"
        : "text-slate-300 bg-white/[0.05] border-white/10";

  return (
    <Card className="h-full rounded-[1.5rem] border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-300 self-start">
            <Icon className="h-5 w-5 shrink-0" />
          </div>

          <div
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium self-start",
              tone,
            )}
          >
            {direction === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : direction === "down" ? (
              <ArrowDownRight className="h-3.5 w-3.5" />
            ) : (
              <Activity className="h-3.5 w-3.5" />
            )}
            {change}
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-slate-300 sm:text-base">
          {title}
        </p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {value}
        </p>
        <p className="mt-3 text-sm leading-6 text-slate-400">{helper}</p>
      </CardContent>
    </Card>
  );
}

function QueueDonutCard({ data }: { data: AdminAnalyticsData }) {
  const hasItems = data.reviewQueue.some((item) => item.value > 0);

  return (
    <Card className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
      <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
        <CardTitle className="text-base sm:text-lg">Current workload</CardTitle>
        <CardDescription className="text-sm leading-6 text-slate-400">
          Live operational queue split by the main admin review surfaces.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-5 sm:py-5">
        {hasItems ? (
          <>
            <ChartContainer
              config={queueChartConfig}
              className="h-[200px] w-full sm:h-[240px] lg:h-[260px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
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
                            {formatCompactCount(Number(value))}
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
                  innerRadius={40}
                  outerRadius={72}
                  paddingAngle={4}
                  strokeWidth={0}
                >
                  {data.reviewQueue.map((item) => (
                    <Cell key={item.key} fill={`var(--color-${item.key})`} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {data.reviewQueue.map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="min-w-0 text-sm leading-6 text-slate-300">
                    {item.label}
                  </p>
                  <Badge className="self-start border border-white/10 bg-white/[0.04] px-2.5 py-1 text-slate-100 hover:bg-white/[0.04] sm:self-auto">
                    {formatCompactCount(item.value)}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-[220px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center sm:h-[260px]">
            <ShieldCheck className="h-8 w-8 shrink-0 text-sky-200" />
            <p className="mt-4 text-base font-medium text-white">
              No active workload
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Pending review queues are clear right now, so this surface is
              waiting for incoming admin tasks.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SuperAdminAnalyticsClient({ data }: Props) {
  const monthly = data.monthly;
  const currentMonth = monthly[monthly.length - 1];
  const previousMonth = monthly[monthly.length - 2];

  const currentCapital =
    (currentMonth?.savingsDeposits ?? 0) +
    (currentMonth?.investmentFunding ?? 0);
  const previousCapital =
    (previousMonth?.savingsDeposits ?? 0) +
    (previousMonth?.investmentFunding ?? 0);

  const capitalTrend = formatChange(currentCapital, previousCapital);
  const earningsTrend = formatChange(
    currentMonth?.earnings ?? 0,
    previousMonth?.earnings ?? 0,
  );
  const userTrend = formatChange(
    currentMonth?.newUsers ?? 0,
    previousMonth?.newUsers ?? 0,
  );
  const reviewTrend = formatChange(
    currentMonth?.paymentReviews ?? 0,
    previousMonth?.paymentReviews ?? 0,
  );
  const fundingTrend = formatChange(
    currentMonth?.investmentFunding ?? 0,
    previousMonth?.investmentFunding ?? 0,
  );

  const metrics = [
    {
      title: "Total users",
      value: formatCompactCount(data.summary.totalUsers),
      helper: "Registered customer accounts across the platform.",
      change: userTrend.label,
      direction: userTrend.direction,
      icon: Users,
    },
    {
      title: "Active investors",
      value: formatCompactCount(data.summary.activeInvestors),
      helper: "Users with funded savings or investment activity.",
      change: fundingTrend.label,
      direction: fundingTrend.direction,
      icon: Wallet,
    },
    {
      title: "Active plans",
      value: formatCompactCount(data.summary.activePlans),
      helper: "Investment plans currently open for users.",
      change: "Live",
      direction: "neutral",
      icon: PiggyBank,
    },
    {
      title: "Funded orders",
      value: formatCompactCount(data.summary.fundedOrders),
      helper: "Orders already converted into live capital.",
      change: fundingTrend.label,
      direction: fundingTrend.direction,
      icon: CreditCard,
    },
    {
      title: "Capital tracked",
      value: formatUsd(data.summary.totalCapitalTracked),
      helper: "Savings deposits plus funded investment volume.",
      change: capitalTrend.label,
      direction: capitalTrend.direction,
      icon: DollarSign,
    },
    {
      title: "Total earnings",
      value: formatUsd(data.summary.totalEarnings),
      helper: "Accumulated investment earnings recorded in the ledger.",
      change: earningsTrend.label,
      direction: earningsTrend.direction,
      icon: TrendingUp,
    },
    {
      title: "Open review queue",
      value: formatCompactCount(data.summary.openReviewQueue),
      helper: "Withdrawals, KYC, payments, and funding reviews.",
      change: reviewTrend.label,
      direction: reviewTrend.direction,
      icon: Activity,
    },
    {
      title: "Pending KYC",
      value: formatCompactCount(data.summary.pendingKyc),
      helper: "Investor profiles currently waiting for review.",
      change: data.summary.pendingKyc > 0 ? "Watch" : "Live",
      direction: data.summary.pendingKyc > 0 ? "up" : "neutral",
      icon: ShieldCheck,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <Card className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_30%),linear-gradient(135deg,rgba(7,17,32,0.98),rgba(8,18,36,0.98))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                <Badge className="border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] text-sky-100 hover:bg-sky-400/10 sm:text-sm">
                  {data.siteName} analytics
                </Badge>

                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    Platform analytics
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                    A live view of capital flow, user growth, compliance health,
                    and admin workload directly from the database.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className="border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-200 hover:bg-white/[0.04]">
                    Reporting window: last 12 months
                  </Badge>
                  <Badge className="border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-200 hover:bg-white/[0.04]">
                    Open queue{" "}
                    {formatCompactCount(data.summary.openReviewQueue)}
                  </Badge>
                  <Badge className="border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-200 hover:bg-white/[0.04]">
                    Funded orders{" "}
                    {formatCompactCount(data.summary.fundedOrders)}
                  </Badge>
                </div>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-1 lg:grid-cols-2 lg:max-w-xl">
                <HeroStatCard
                  label="Capital tracked"
                  value={formatUsd(data.summary.totalCapitalTracked)}
                  helper="Savings deposits plus funded investment volume."
                  icon={LineChartIcon}
                />
                <HeroStatCard
                  label="Total earnings"
                  value={formatUsd(data.summary.totalEarnings)}
                  helper="Accumulated investment earnings recorded in the ledger."
                  icon={TrendingUp}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <SectionHeader
            eyebrow="Overview"
            title="Key performance metrics"
            description="Core platform-level analytics across capital inflows, user growth, compliance health, and payments."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((item) => (
              <MetricCard key={item.title} {...item} />
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="text-base sm:text-lg">
                Capital flow
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-400">
                Monthly movement across savings deposits, funded investment
                orders, withdrawals, and earnings.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 py-4 sm:px-4 sm:py-5">
              <ChartContainer
                config={capitalChartConfig}
                className="h-[250px] w-full sm:h-[320px] lg:h-[360px]"
              >
                <LineChart data={monthly}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={18}
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
                              {name === "savingsDeposits"
                                ? "Savings deposits"
                                : name === "investmentFunding"
                                  ? "Investment funding"
                                  : name === "withdrawalVolume"
                                    ? "Withdrawal volume"
                                    : "Earnings"}
                            </span>
                            <span className="font-medium text-foreground">
                              {formatUsd(Number(value))}
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

          <Card className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] text-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
            <CardHeader className="space-y-2 border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="text-base sm:text-lg">
                Operational activity
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-400">
                Monthly trend of new users and payment review volume.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 py-4 sm:px-4 sm:py-5">
              <ChartContainer
                config={activityChartConfig}
                className="h-[250px] w-full sm:h-[320px] lg:h-[360px]"
              >
                <BarChart data={monthly}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={18}
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
                                : "Payment reviews"}
                            </span>
                            <span className="font-medium text-foreground">
                              {formatCompactCount(Number(value))}
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
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <QueueDonutCard data={data} />

          <Card className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
            <CardHeader className="border-b border-white/8 px-4 py-4 sm:px-6 sm:py-5">
              <CardTitle className="text-base sm:text-lg">
                Snapshot summary
              </CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-400">
                A live summary of the most important operational counts pulled
                directly from the database.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-5">
              {[
                {
                  label: "Pending withdrawals",
                  value: data.summary.pendingWithdrawals,
                  icon: DollarSign,
                },
                {
                  label: "Pending KYC",
                  value: data.summary.pendingKyc,
                  icon: ShieldCheck,
                },
                {
                  label: "Pending investment payments",
                  value: data.summary.pendingInvestmentPayments,
                  icon: CreditCard,
                },
                {
                  label: "Pending investment orders",
                  value: data.summary.pendingInvestmentOrders,
                  icon: BadgeDollarSign,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 min-w-0"
                >
                  <div className="shrink-0 rounded-2xl bg-sky-500/10 p-3 text-sky-300">
                    <item.icon className="h-4 w-4 shrink-0" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-6 font-medium text-white">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                      {formatCompactCount(item.value)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
