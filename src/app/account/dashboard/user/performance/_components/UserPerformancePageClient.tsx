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

const surfaceCardClassName = cn(
  DASHBOARD_PAGE_SURFACE_CLASS,
  "rounded-2xl shadow-sm",
);

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

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1.5">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-800 dark:text-sky-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "blue",
}: {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "blue" | "green" | "amber" | "slate";
}) {
  const tones = {
    blue: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300",
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300",
    amber:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300",
    slate:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
  };

  return (
    <Card className={surfaceCardClassName}>
      <CardContent className="flex h-full items-start justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="break-words text-xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-2xl">
            {value}
          </p>
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            tones[tone],
          )}
        >
          <Icon className="size-5" />
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
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl border",
            isCredit
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
              : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300",
          )}
        >
          <Icon className="size-4" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
          <p
            className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400"
            title={reference}
          >
            {dateLabel} · {formatReferenceLabel(reference)}
          </p>
        </div>
      </div>

      <span
        className={cn(
          "shrink-0 text-sm font-semibold tabular-nums",
          isCredit
            ? "text-emerald-700 dark:text-emerald-300"
            : "text-rose-700 dark:text-rose-300",
        )}
      >
        {isCredit ? "+" : "-"}
        {formatUsd(amount)}
      </span>
    </div>
  );
}

function PortfolioHero({ data }: Props) {
  const isPositive = data.summary.changePercent >= 0;

  return (
    <Card
      className={cn(
        surfaceCardClassName,
        "relative overflow-hidden border-sky-200/80 bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.16),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(10,31,68,0.88),rgba(7,18,38,0.98))]",
      )}
    >
      <CardContent className="relative p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Landmark className="size-4 text-sky-700 dark:text-sky-300" />
              Portfolio value
            </div>

            <h2 className="break-words text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              {formatUsd(data.summary.totalPortfolioValue)}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  isPositive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300",
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="size-3.5" />
                ) : (
                  <ArrowDownRight className="size-3.5" />
                )}
                {formatPercent(data.summary.changePercent)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Portfolio change
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Invested capital
              </p>
              <p className="mt-2 break-words text-lg font-semibold text-slate-950 dark:text-white">
                {formatUsd(data.summary.totalInvestedCapital)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Active orders
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                {data.summary.activeOrdersCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Matured orders
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">
                {data.summary.maturedOrdersCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-white/10">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total realized profit
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-700 dark:text-emerald-300">
              {formatUsd(data.summary.totalProfit)}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-300" />
            <span>{data.summary.profitableAssetsCount} profitable assets</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssetCard({
  asset,
}: {
  asset: UserPerformanceData["assets"][number];
}) {
  return (
    <Card
      className={cn(surfaceCardClassName, "transition-shadow hover:shadow-md")}
    >
      <CardContent className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="break-words text-base font-semibold text-slate-950 dark:text-white">
              {asset.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {asset.planName} · {asset.typeLabel}
            </p>
          </div>

          <span
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
              asset.model === "FIXED"
                ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200"
                : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
            )}
          >
            {asset.model}
          </span>
        </div>

        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current value
          </p>
          <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {formatUsd(asset.value)}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Principal {formatUsd(asset.principal)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Realized gain
            </p>
            <p className="mt-1.5 text-sm font-semibold text-slate-950 dark:text-white">
              {formatUsd(asset.profit)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <p className="text-xs text-slate-500 dark:text-slate-400">Return</p>
            <p
              className={cn(
                "mt-1.5 text-sm font-semibold",
                asset.profitPercent >= 0
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-rose-700 dark:text-rose-300",
              )}
            >
              {formatPercent(asset.profitPercent)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <span>{asset.periodLabel}</span>
          <span>·</span>
          <span>{asset.isMatured ? "Matured" : "Active"}</span>
          {asset.symbol ? (
            <>
              <span>·</span>
              <span>{asset.symbol}</span>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function RewardOverview({
  data,
  type,
}: {
  data: UserPerformanceData;
  type: "referral" | "promotion";
}) {
  const isReferral = type === "referral";

  const items = isReferral
    ? [
        {
          title: "Referral code",
          value: data.referral.referralCode ?? "Not generated",
          hint: "Share this code to track new signups",
          icon: Gift,
          tone: "blue" as const,
        },
        {
          title: "Referrals made",
          value: String(data.referral.referredUsersCount),
          hint: "Users linked to your referral code",
          icon: Users,
          tone: "slate" as const,
        },
        {
          title: "Rewards earned",
          value: formatUsd(data.referral.totalRewards),
          hint: "Credited referral bonuses",
          icon: TrendingUp,
          tone: "green" as const,
        },
        {
          title: "Pending rewards",
          value: String(data.referral.pendingRewardsCount),
          hint: "Rewards awaiting an eligible destination",
          icon: Activity,
          tone: "amber" as const,
        },
      ]
    : [
        {
          title: "Reserved bonus",
          value: formatUsd(data.welcomeBonus.pendingAmount),
          hint: "Pending platform promotion reward",
          icon: Gift,
          tone: "blue" as const,
        },
        {
          title: "Credited bonus",
          value: formatUsd(data.welcomeBonus.creditedAmount),
          hint: "Promotion rewards already unlocked",
          icon: TrendingUp,
          tone: "green" as const,
        },
        {
          title: "Pending rewards",
          value: String(data.welcomeBonus.pendingRewardsCount),
          hint: "Rewards waiting on your first eligible action",
          icon: Activity,
          tone: "amber" as const,
        },
        {
          title: "Credited rewards",
          value: String(data.welcomeBonus.creditedRewardsCount),
          hint: "Welcome bonuses credited to your account",
          icon: Landmark,
          tone: "slate" as const,
        },
      ];

  return (
    <Card className={surfaceCardClassName}>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeading
            eyebrow="Account rewards"
            title={isReferral ? "Referral overview" : "Promotional bonus"}
            description={
              isReferral
                ? "Your referral code, successful referrals, and rewards credited to your account."
                : "Your reserved platform bonus, credited rewards, and the next action required."
            }
          />
          {!isReferral ? (
            <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
              {data.welcomeBonus.nextActionLabel}
            </span>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              hint={item.hint}
              icon={item.icon}
              tone={item.tone}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyAssetsState() {
  return (
    <Card className={cn(surfaceCardClassName, "border-dashed")}>
      <CardContent className="flex flex-col items-center px-5 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300">
          <TrendingUp className="size-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">
          No confirmed investments yet
        </h3>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Once your investment orders are confirmed, this page will show live
          valuation, realized gains, and performance activity from the database.
        </p>
      </CardContent>
    </Card>
  );
}

function RecentActivity({ data }: Props) {
  return (
    <Card className={surfaceCardClassName}>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <SectionHeading
          title="Recent activity"
          description="The latest investment orders, profit postings, and withdrawal events tied to your portfolio."
        />

        <div className="space-y-3">
          {data.activities.length ? (
            data.activities.map((item) => (
              <ActivityRow key={item.id} {...item} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
              No performance activity has been recorded yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsCharts({ data }: Props) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <Card className={surfaceCardClassName}>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <SectionHeading
            title="Capital vs realized profit"
            description="Six-month view of confirmed investment capital and realized profit recorded in the ledger."
          />

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
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
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
        <CardContent className="space-y-5 p-5 sm:p-6">
          <SectionHeading
            title="Asset allocation"
            description="Current value by asset using confirmed orders and the latest available valuation data."
          />

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
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
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
  );
}

export function UserPerformancePageClient({ data }: Props) {
  const hasAssets = data.assets.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <Tabs defaultValue="performance" className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
              <span className="size-2 rounded-full bg-sky-500" />
              Portfolio intelligence
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Investment performance
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Monitor portfolio value, realized gains, investment activity,
                and account rewards in one place.
              </p>
            </div>
          </div>

          <TabsList className="inline-flex h-auto w-full items-center justify-start gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900 sm:w-auto">
            <TabsTrigger
              value="performance"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-950 data-[state=active]:bg-white data-[state=active]:text-sky-900 data-[state=active]:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-sky-300"
            >
              Performance
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-slate-950 data-[state=active]:bg-white data-[state=active]:text-sky-900 data-[state=active]:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-sky-300"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="performance" className="mt-0 space-y-6">
          <PortfolioHero data={data} />

          <section className="space-y-4">
            <SectionHeading
              eyebrow="Portfolio holdings"
              title="Your investments"
              description="A breakdown of confirmed investment orders and their current performance."
            />

            {hasAssets ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.assets.map((asset) => (
                  <AssetCard key={asset.orderId} asset={asset} />
                ))}
              </div>
            ) : (
              <EmptyAssetsState />
            )}
          </section>

          <RecentActivity data={data} />

          <section className="space-y-4">
            <SectionHeading
              eyebrow="Additional benefits"
              title="Rewards and bonuses"
              description="Review referral earnings and promotional rewards associated with your account."
            />
            <div className="grid gap-6">
              <RewardOverview data={data} type="referral" />
              <RewardOverview data={data} type="promotion" />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Invested capital"
              value={formatUsd(data.summary.totalInvestedCapital)}
              hint="Confirmed order volume across your portfolio"
              icon={Landmark}
              tone="blue"
            />
            <StatCard
              title="Realized gains"
              value={formatUsd(data.summary.totalProfit)}
              hint="Ledger-backed profits and accrued fixed returns"
              icon={TrendingUp}
              tone="green"
            />
            <StatCard
              title="Tracked assets"
              value={String(data.assets.length)}
              hint="Orders included in valuation and analytics"
              icon={PieChart}
              tone="slate"
            />
          </section>

          <AnalyticsCharts data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
