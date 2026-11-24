"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Lock,
  PiggyBank,
  Plus,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import type { SavingsPageData } from "@/actions/savings/getSavingsPageData";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";
import CancelSavingsAccountButton from "./CancelSavingsAccountButton";
import SavingsDepositButton from "./SavingsDepositButton";

type SavingsDashboardProps = {
  accounts: SavingsPageData["accounts"];
  kycStatus: SavingsPageData["kycStatus"];
  canCreateSavingsAccount: boolean;
};

type SavingsAccount = SavingsPageData["accounts"][number];

function getSavingsDepositButtonLabel(
  latestFundingIntentStatus: SavingsPageData["accounts"][number]["latestFundingIntentStatus"],
  latestFundingPaymentStatus: SavingsPageData["accounts"][number]["latestFundingPaymentStatus"],
) {
  if (
    latestFundingIntentStatus === "SUBMITTED" ||
    latestFundingPaymentStatus === "PENDING_REVIEW"
  ) {
    return "Deposit under review";
  }

  if (latestFundingIntentStatus === "PARTIALLY_PAID") {
    return "Complete deposit";
  }

  return "Deposit";
}

function canCancelSavingsAccount(account: SavingsAccount) {
  if (account.status !== "ACTIVE") {
    return false;
  }

  if (account.isLocked || account.balance > 0) {
    return false;
  }

  return !["PENDING", "SUBMITTED", "PARTIALLY_PAID", "PAID"].includes(
    account.latestFundingIntentStatus ?? "",
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  description: string;
  icon: typeof Wallet;
  tone?: "blue" | "emerald" | "amber" | "slate";
}) {
  const tones = {
    blue: "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber:
      "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-3">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </p>
          <p className="break-words text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {value}
          </p>
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            tones[tone],
          )}
        >
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function AccountStatusBadge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "green" | "amber" | "slate";
}) {
  const tones = {
    green:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
    amber:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
    slate:
      "border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function SavingsAccountCard({
  account,
  variant,
}: {
  account: SavingsAccount;
  variant: "active" | "closed";
}) {
  const isActive = variant === "active";
  const isTargetReached =
    account.targetAmount !== null && account.balance >= account.targetAmount;
  const canCancel = canCancelSavingsAccount(account);

  return (
    <Card
      className={cn(
        "h-full min-w-0 overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md",
        isActive
          ? "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900"
          : "border-slate-200/80 bg-slate-50/70 dark:border-white/10 dark:bg-slate-900/60",
      )}
    >
      <CardContent className="flex h-full flex-col gap-5 p-5 sm:p-6">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="break-words text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
              {account.name}
            </h3>
            <p className="break-words text-sm text-slate-600 dark:text-slate-400">
              {account.product.name}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <AccountStatusBadge tone={isActive ? "green" : "slate"}>
              {formatEnumLabel(account.status)}
            </AccountStatusBadge>

            {isActive && account.product.interestEnabled ? (
              <AccountStatusBadge tone="green">Interest</AccountStatusBadge>
            ) : null}

            {isActive && account.isLocked ? (
              <AccountStatusBadge tone="amber">Locked</AccountStatusBadge>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Available balance
          </p>
          <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            {formatCurrency(account.balance, account.currency)}
          </p>
          {account.targetAmount !== null ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Savings target
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {formatCurrency(account.targetAmount, account.currency)}
              </span>
            </div>
          ) : null}
        </div>

        {account.description ? (
          <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {account.description}
          </p>
        ) : null}

        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="min-w-0">
            <dt className="text-xs text-slate-500 dark:text-slate-400">
              Opened
            </dt>
            <dd className="mt-1.5 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              <CalendarDays className="size-4 shrink-0 text-slate-400" />
              <span>{formatDateLabel(account.createdAt)}</span>
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-slate-500 dark:text-slate-400">
              Withdrawals
            </dt>
            <dd className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
              {account.product.allowsWithdrawals ? "Available" : "Restricted"}
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-slate-500 dark:text-slate-400">
              Lock status
            </dt>
            <dd className="mt-1.5 flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
              <Lock className="size-4 shrink-0 text-slate-400" />
              <span>
                {account.isLocked && account.lockedUntil
                  ? `Until ${formatDateLabel(account.lockedUntil)}`
                  : "Flexible"}
              </span>
            </dd>
          </div>

          <div className="min-w-0">
            <dt className="text-xs text-slate-500 dark:text-slate-400">
              Target progress
            </dt>
            <dd className="mt-1.5 text-sm font-medium text-slate-800 dark:text-slate-200">
              {account.targetAmount !== null
                ? isTargetReached
                  ? "Target reached"
                  : "In progress"
                : "Not set"}
            </dd>
          </div>
        </dl>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Savings product
          </p>
          <p className="mt-1.5 text-sm leading-6 text-slate-700 dark:text-slate-300">
            {account.product.description ?? "No product description available."}
          </p>
        </div>

        <div className="mt-auto border-t border-slate-200 pt-4 dark:border-white/10">
          {isActive ? (
            <div className={cn("grid gap-3", canCancel && "sm:grid-cols-2")}>
              <SavingsDepositButton
                accountId={account.id}
                label={getSavingsDepositButtonLabel(
                  account.latestFundingIntentStatus,
                  account.latestFundingPaymentStatus,
                )}
                disabled={
                  isTargetReached ||
                  account.status === "CLOSED" ||
                  account.latestFundingIntentStatus === "SUBMITTED" ||
                  account.latestFundingPaymentStatus === "PENDING_REVIEW"
                }
                disabledLabel={
                  account.latestFundingIntentStatus === "SUBMITTED" ||
                  account.latestFundingPaymentStatus === "PENDING_REVIEW"
                    ? "Deposit under review"
                    : account.status === "CLOSED"
                      ? "Closed"
                      : "Target reached"
                }
                className="w-full rounded-xl bg-sky-700 text-white hover:bg-sky-800 disabled:cursor-not-allowed"
              />
              {canCancel ? (
                <CancelSavingsAccountButton accountId={account.id} />
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-400">
              This savings account is inactive and no longer accepts deposits.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SavingsDashboard({
  accounts,
  kycStatus,
  canCreateSavingsAccount,
}: SavingsDashboardProps) {
  const activeAccounts = accounts.filter(
    (account) => account.status === "ACTIVE",
  );
  const closedAccounts = accounts.filter(
    (account) => account.status !== "ACTIVE",
  );
  const hasAccounts = accounts.length > 0;
  const hasActiveAccounts = activeAccounts.length > 0;

  const activeTotalBalance = activeAccounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  const activeLockedCount = activeAccounts.filter(
    (account) => account.isLocked,
  ).length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <section className="flex flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6 lg:flex-row lg:items-center">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-sky-800 dark:text-sky-300">
            <PiggyBank className="size-4" />
            Savings overview
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Personal savings accounts
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Manage your savings accounts, monitor balances, and review the rules
            attached to each savings product.
          </p>
        </div>

        {hasAccounts && canCreateSavingsAccount ? (
          <Button
            asChild
            className="w-full rounded-xl bg-sky-700 text-white hover:bg-sky-800 sm:w-auto"
          >
            <Link href="/account/dashboard/user/savings/new">
              <Plus className="size-4" />
              Add savings account
            </Link>
          </Button>
        ) : !canCreateSavingsAccount ? (
          <Button
            asChild
            variant="outline"
            className="w-full rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5 sm:w-auto"
          >
            <Link href="/account/dashboard/user/kyc">
              <ShieldAlert className="size-4" />
              Complete KYC
            </Link>
          </Button>
        ) : null}
      </section>

      {!canCreateSavingsAccount ? (
        <Alert className="rounded-2xl border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          <ShieldAlert className="size-5 shrink-0" />
          <AlertTitle>
            Savings accounts are locked until KYC is verified. Current status:{" "}
            {formatEnumLabel(kycStatus, "Not available")}.
          </AlertTitle>
        </Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Active accounts"
          value={activeAccounts.length}
          description="Savings accounts currently active"
          icon={Wallet}
          tone="blue"
        />
        <MetricCard
          label="Total balance"
          value={formatCurrency(activeTotalBalance)}
          description="Combined balance across active accounts"
          icon={CircleDollarSign}
          tone="emerald"
        />
        <MetricCard
          label="Locked accounts"
          value={activeLockedCount}
          description="Active accounts with withdrawal restrictions"
          icon={Lock}
          tone="amber"
        />
        <MetricCard
          label="Closed accounts"
          value={closedAccounts.length}
          description="Accounts that are no longer active"
          icon={CheckCircle2}
          tone="slate"
        />
      </section>

      {!hasActiveAccounts ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
          <CardContent className="flex flex-col items-center px-5 py-12 text-center sm:px-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300">
              <PiggyBank className="size-7" />
            </div>
            <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
              No active savings account yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Open your first savings account to start tracking your balance and
              managing your savings.
            </p>
            {canCreateSavingsAccount ? (
              <Button
                asChild
                className="mt-5 rounded-xl bg-sky-700 text-white hover:bg-sky-800"
              >
                <Link href="/account/dashboard/user/savings/new">
                  <Plus className="size-4" />
                  Create savings account
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                className="mt-5 rounded-xl border-slate-300 dark:border-white/15"
              >
                <Link href="/account/dashboard/user/kyc">
                  Complete KYC
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">
                Active savings accounts
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Review balances, account conditions, and available actions.
              </p>
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {activeAccounts.length}{" "}
              {activeAccounts.length === 1 ? "account" : "accounts"}
            </span>
          </div>

          <div
            className={cn(
              "grid gap-5",
              activeAccounts.length > 1 && "md:grid-cols-2 2xl:grid-cols-3",
            )}
          >
            {activeAccounts.map((account) => (
              <SavingsAccountCard
                key={account.id}
                account={account}
                variant="active"
              />
            ))}
          </div>
        </section>
      )}

      {closedAccounts.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 dark:border-white/10 dark:bg-slate-900/60 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">
                Closed accounts
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Cancelled, closed, or otherwise inactive savings accounts.
              </p>
            </div>
            <AccountStatusBadge tone="slate">
              {closedAccounts.length}{" "}
              {closedAccounts.length === 1
                ? "inactive account"
                : "inactive accounts"}
            </AccountStatusBadge>
          </div>

          <div
            className={cn(
              "grid gap-5",
              closedAccounts.length > 1 && "md:grid-cols-2 2xl:grid-cols-3",
            )}
          >
            {closedAccounts.map((account) => (
              <SavingsAccountCard
                key={account.id}
                account={account}
                variant="closed"
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
