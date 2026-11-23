import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Layers3,
  PiggyBank,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { KycStatus } from "@/generated/prisma";

import { formatUsd } from "@/lib/formatters/formatters";
import {
  formatMigrationTimelineTimestamp,
  getLegacyAccountBadgeMeta,
  getMigrationStatusMeta,
} from "@/lib/migration/migrationPresentation";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  DashboardSuccessNotices,
  type DashboardSuccessNotice,
} from "./DashboardSuccessNotices";

const SURFACE =
  "rounded-2xl border border-slate-200/80 bg-white text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-white";

const INVESTMENT_ROUTE = "/account/dashboard/user/investment-orders";
const SAVINGS_ROUTE = "/account/dashboard/user/savings";

type UserDashboardPageProps = {
  userName: string;
  stats: UserDashboardStats;
  investmentProfileComplete: boolean;
  kycStatus: KycStatus | null;
  legacyAccount?: {
    isLegacyUser: boolean;
    migrationStatus: "NEW_USER" | "MIGRATION_PENDING" | "MIGRATED";
    migratedAt: string | null;
  } | null;
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
  capitalUpdateOrder: {
    id: string;
    planName: string;
    reason: string | null;
    href: string;
  } | null;
  successNotices: DashboardSuccessNotice[];
};

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
  variant,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  variant: "blue" | "green";
}) {
  const styles = {
    blue: {
      card: "border-sky-200 bg-sky-50/70 hover:border-sky-300 hover:bg-sky-50 dark:border-sky-400/20 dark:bg-sky-400/5 dark:hover:bg-sky-400/10",
      icon: "text-sky-700 dark:text-sky-300",
      arrow: "text-sky-700 dark:text-sky-300",
    },
    green: {
      card: "border-emerald-200 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-400/20 dark:bg-emerald-400/5 dark:hover:bg-emerald-400/10",
      icon: "text-emerald-700 dark:text-emerald-300",
      arrow: "text-emerald-700 dark:text-emerald-300",
    },
  };

  const style = styles[variant];

  return (
    <Link
      href={href}
      className={`group flex min-w-0 flex-col justify-between rounded-xl border p-4 transition duration-200 ${style.card}`}
    >
      <div className="flex items-center justify-between">
        <Icon className={`h-5 w-5 ${style.icon}`} />
        <ArrowRight
          className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${style.arrow}`}
        />
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white sm:text-base">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-300">
          {description}
        </p>
      </div>
    </Link>
  );
}

function DashboardNotice({
  children,
  tone = "amber",
}: {
  children: React.ReactNode;
  tone?: "amber" | "blue";
}) {
  const styles = {
    amber:
      "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-400/20 dark:bg-amber-950/40 dark:text-amber-100",
    blue: "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-400/20 dark:bg-sky-950/40 dark:text-sky-100",
  };

  const iconStyles = {
    amber: "text-amber-600 dark:text-amber-300",
    blue: "text-sky-700 dark:text-sky-300",
  };

  return (
    <Alert className={`rounded-2xl border px-4 py-4 sm:px-5 ${styles[tone]}`}>
      <AlertTriangle className={`h-5 w-5 ${iconStyles[tone]}`} />
      <AlertTitle className="w-full">{children}</AlertTitle>
    </Alert>
  );
}

export default function UserDashboardPage({
  userName,
  stats,
  investmentProfileComplete,
  kycStatus,
  legacyAccount,
}: UserDashboardPageProps) {
  const legacyBadge = legacyAccount
    ? getLegacyAccountBadgeMeta(legacyAccount.isLegacyUser)
    : null;

  const migrationMeta = legacyAccount
    ? getMigrationStatusMeta(legacyAccount.migrationStatus)
    : null;

  const hasCompletedMigration = Boolean(legacyAccount?.migratedAt);
  const kycVerified = kycStatus === "VERIFIED";

  const portfolioTotal = stats.totalInvestment + stats.totalEarnedProfits;

  const investedShare =
    portfolioTotal > 0 ? (stats.totalInvestment / portfolioTotal) * 100 : 0;

  const donutBackground =
    portfolioTotal > 0
      ? `conic-gradient(#3c9ee0 0% ${investedShare}%, #a5d8ff ${investedShare}% 100%)`
      : "#e2e8f0";

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Welcome header */}
      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
            <span className="h-2 w-2 rounded-full bg-[#3c9ee0]" />
            Investment Dashboard
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
              Hi, {userName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              Welcome back. Here&apos;s a clear overview of your investment
              account, current position, and portfolio activity.
            </p>
          </div>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 dark:border-sky-400/20 dark:bg-slate-900 dark:text-slate-200">
          <ShieldCheck className="h-5 w-5 text-sky-700 dark:text-sky-300" />
          Secure portfolio overview
        </div>
      </section>

      {/* Legacy migration notice */}
      {legacyAccount?.isLegacyUser ? (
        <section className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-emerald-50 p-4 dark:border-sky-400/20 dark:from-sky-950/40 dark:to-emerald-950/20 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {legacyBadge ? (
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${legacyBadge.className}`}
                  >
                    {legacyBadge.label}
                  </span>
                ) : null}

                {migrationMeta ? (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${migrationMeta.className}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${migrationMeta.dotClassName}`}
                    />
                    {migrationMeta.label}
                  </span>
                ) : null}
              </div>

              <div>
                <h2 className="font-semibold text-slate-950 dark:text-white">
                  Legacy account migration
                </h2>
                <p className="mt-1 text-sm leading-5 text-slate-700 dark:text-slate-300">
                  Account information and migration status for your legacy
                  account.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-xl border border-white/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-slate-950/40">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Migration timeline
              </p>

              <p className="mt-1.5 text-sm font-semibold text-slate-950 dark:text-white">
                {hasCompletedMigration
                  ? "Account migration completed"
                  : "Migration pending"}
              </p>

              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                {hasCompletedMigration && legacyAccount.migratedAt
                  ? formatMigrationTimelineTimestamp(legacyAccount.migratedAt)
                  : "Migration is not yet completed."}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {/* Success notices */}
      <DashboardSuccessNotices notices={stats.successNotices} />

      {/* Profile and KYC notices */}
      {!investmentProfileComplete ? (
        <DashboardNotice tone="amber">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Your investment profile is not set up yet
              </p>
              <p className="mt-1 text-xs font-normal text-amber-900 dark:text-amber-200">
                Complete your profile to access your investment features.
              </p>
            </div>

            <Link
              href="/account/dashboard/user/investment-profile/edit"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-950 transition hover:bg-amber-100 dark:border-amber-400/30 dark:bg-slate-900 dark:text-amber-100 dark:hover:bg-amber-950"
            >
              Complete profile
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </DashboardNotice>
      ) : null}

      {!kycVerified ? (
        <DashboardNotice tone="blue">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                Complete KYC verification to unlock account activity
              </p>
              <p className="mt-1 text-xs font-normal text-sky-900 dark:text-sky-200">
                Verify your identity to access the full range of account
                features.
              </p>
            </div>

            <Link
              href="/account/dashboard/user/kyc"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-xs font-semibold text-sky-950 transition hover:bg-sky-100 dark:border-sky-400/30 dark:bg-slate-900 dark:text-sky-100 dark:hover:bg-sky-950"
            >
              Verify KYC
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </DashboardNotice>
      ) : null}

      {/* Order notices */}
      {stats.inactiveInvestmentOrder ? (
        <DashboardNotice tone="amber">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold">
              One of your investment orders is now inactive
              {stats.inactiveInvestmentOrder.planName
                ? `: ${stats.inactiveInvestmentOrder.planName}`
                : "."}
            </p>

            <Link
              href={stats.inactiveInvestmentOrder.href}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-950 transition hover:bg-amber-100 dark:border-amber-400/30 dark:bg-slate-900 dark:text-amber-100 dark:hover:bg-amber-950"
            >
              View order
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </DashboardNotice>
      ) : null}

      {stats.capitalUpdateOrder ? (
        <DashboardNotice tone="blue">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold">
              One of your orders requires a capital update
              {stats.capitalUpdateOrder.planName
                ? `: ${stats.capitalUpdateOrder.planName}`
                : "."}
              {stats.capitalUpdateOrder.reason
                ? ` ${stats.capitalUpdateOrder.reason}`
                : ""}
            </p>

            <Link
              href={stats.capitalUpdateOrder.href}
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-sky-300 bg-white px-3 py-2 text-xs font-semibold text-sky-950 transition hover:bg-sky-100 dark:border-sky-400/30 dark:bg-slate-900 dark:text-sky-100 dark:hover:bg-sky-950"
            >
              View order
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </DashboardNotice>
      ) : null}

      {/* Main balance and quick actions */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.35fr]">
        <div className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-sky-700 via-blue-600 to-[#3c9ee0] p-5 text-white shadow-sm sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full border-[35px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-28 right-10 h-56 w-80 -rotate-12 rounded-full border-t-[30px] border-white/10" />

          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/90">
                Account Balance
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {formatUsd(stats.accountBalance)}
              </h2>

              <p className="mt-3 max-w-sm text-xs leading-5 text-white/85 sm:text-sm">
                Available balance for your account withdrawals and financial
                activities.
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15 sm:h-14 sm:w-14">
              <Wallet className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
          </div>
        </div>

        <div className={`${SURFACE} flex flex-col justify-between p-5 sm:p-6`}>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Quick Actions
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Manage your investments and savings.
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <QuickAction
              href={INVESTMENT_ROUTE}
              title="Start Investing"
              description="Explore and create an investment"
              icon={TrendingUp}
              variant="blue"
            />

            <QuickAction
              href={SAVINGS_ROUTE}
              title="Open Savings"
              description="Explore and start a savings plan"
              icon={PiggyBank}
              variant="green"
            />
          </div>
        </div>
      </section>

      {/* Portfolio overview and investment snapshot */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className={`${SURFACE} p-5 sm:p-6`}>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Portfolio Overview
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              A breakdown of your invested capital and earned profits.
            </p>
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            <div
              className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full"
              style={{ background: donutBackground }}
              role="img"
              aria-label={`Portfolio breakdown: ${formatUsd(stats.totalInvestment)} invested capital and ${formatUsd(stats.totalEarnedProfits)} earned profits`}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center dark:bg-slate-900">
                <span className="text-base font-bold tracking-tight text-slate-950 dark:text-white">
                  {formatUsd(portfolioTotal)}
                </span>
                <span className="mt-1 text-[10px] text-slate-600 dark:text-slate-400">
                  Portfolio total
                </span>
              </div>
            </div>

            <div className="w-full max-w-xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#3c9ee0]" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Invested Capital
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-950 dark:text-white">
                  {formatUsd(stats.totalInvestment)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-sky-200" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Earned Profits
                  </span>
                </div>
                <span className="text-sm font-semibold text-slate-950 dark:text-white">
                  {formatUsd(stats.totalEarnedProfits)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 dark:border-white/10">
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Investment capital share</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {portfolioTotal > 0 ? `${investedShare.toFixed(1)}%` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${SURFACE} flex flex-col p-5 sm:p-6`}>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              Investment Snapshot
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              A quick look at your current investment position.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Current active capital
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                    {formatUsd(stats.currentInvestment)}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Current investment plan
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                    {stats.investmentPlan || "No active plan"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Investment orders
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
                    {stats.investmentsCount} recorded
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-200 pt-4 dark:border-white/10">
            <Link
              href={INVESTMENT_ROUTE}
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-800 transition hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200"
            >
              Explore investments
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
