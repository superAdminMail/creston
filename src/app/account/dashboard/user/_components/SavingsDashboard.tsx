"use client";

import Link from "next/link";
import { Lock, PiggyBank, Plus, ShieldAlert } from "lucide-react";

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

function getSavingsDepositButtonLabel(
  latestFundingIntentStatus: SavingsPageData["accounts"][number]["latestFundingIntentStatus"],
) {
  return latestFundingIntentStatus === "PARTIALLY_PAID"
    ? "Complete Deposit"
    : "Deposit";
}

function canCancelSavingsAccount(account: SavingsPageData["accounts"][number]) {
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

export default function SavingsDashboard({
  accounts,
  kycStatus,
  canCreateSavingsAccount,
}: SavingsDashboardProps) {
  const hasAccounts = accounts.length > 0;
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div className="min-w-0 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Personal savings accounts
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-[15px]">
            Track balances, product rules, lock status, and account targets from
            one place.
          </p>
        </div>

        {hasAccounts && canCreateSavingsAccount ? (
          <Button asChild className="rounded-2xl bg-blue-500 hover:bg-blue-600">
            <Link href="/account/dashboard/user/savings/new">
              <Plus className="h-4 w-4" />
              Add savings account
            </Link>
          </Button>
        ) : !canCreateSavingsAccount ? (
          <Button
            asChild
            variant="outline"
            className="rounded-2xl text-slate-400 hover:bg-slate-800"
          >
            <Link href="/account/dashboard/user/kyc">
              <Plus className="h-4 w-4" />
              Complete KYC
            </Link>
          </Button>
        ) : null}
      </div>

      {!canCreateSavingsAccount ? (
        <Alert className="rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-100">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>
            Savings accounts are locked until KYC is verified. Current status:{" "}
            {formatEnumLabel(kycStatus, "Not available")}.
          </AlertTitle>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,17,37,0.99))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />
          <CardContent className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
                Accounts
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] font-medium text-slate-300">
                Active
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.35rem]">
              {accounts.length}
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,17,37,0.99))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />
          <CardContent className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
                Total balance
              </p>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                Portfolio
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.35rem]">
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.94),rgba(8,17,37,0.99))] text-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
          <CardContent className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
                Locked accounts
              </p>
              <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
                Protected
              </span>
            </div>
            <p className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2.35rem]">
              {accounts.filter((account) => account.isLocked).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {!hasAccounts ? (
        <Card className="rounded-[1.75rem] border border-white/10 bg-white/5 text-center shadow-lg shadow-black/10">
          <CardContent className="space-y-4 p-6 sm:p-8 lg:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
              <PiggyBank className="h-6 w-6 text-blue-200" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              No savings account yet
            </h2>
            <p className="text-sm text-slate-400">
              Open your first savings account to start tracking balances and
              product-level savings rules.
            </p>
            {canCreateSavingsAccount ? (
              <Button
                asChild
                className="rounded-2xl bg-blue-500 hover:bg-blue-600"
              >
                <Link href="/account/dashboard/user/savings/new">
                  Create savings account
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="rounded-2xl">
                <Link href="/account/dashboard/user/kyc">Complete KYC</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            accounts.length === 1
              ? "grid gap-5"
              : "grid gap-5 md:grid-cols-1 2xl:grid-cols-3"
          }
        >
          {accounts.map((account) => {
            const isTargetReached =
              account.targetAmount !== null &&
              account.balance >= account.targetAmount;

            return (
              <Card
                key={account.id}
                className={cn(
                  "h-full rounded-[1.75rem] border border-white/10 bg-white/5 shadow-lg shadow-black/10",
                  "min-w-0 overflow-hidden",
                  accounts.length === 1 && "w-full",
                )}
              >
                <CardContent className="flex h-full flex-col gap-4 p-4 sm:gap-5 sm:p-5">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h2 className="break-words text-lg font-semibold text-white sm:text-xl">
                        {account.name}
                      </h2>
                      <p className="break-words text-sm text-slate-400">
                        {account.product.name} -{" "}
                        {formatEnumLabel(account.status)}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap justify-start gap-2 sm:justify-end">
                      {account.product.interestEnabled ? (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">
                          Interest
                        </span>
                      ) : null}
                      {account.isLocked ? (
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300">
                          Locked
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Available balance</p>
                    <h3 className="mt-1 break-words text-2xl font-semibold text-white sm:text-[2rem]">
                      {formatCurrency(account.balance, account.currency)}
                    </h3>
                  </div>
                  {account.description ? (
                    <p className="line-clamp-3 text-sm leading-6 text-slate-400">
                      {account.description}
                    </p>
                  ) : null}
                  <dl className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Target amount
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">
                        {account.targetAmount
                          ? formatCurrency(
                              account.targetAmount,
                              account.currency,
                            )
                          : "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Opened
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">
                        {formatDateLabel(account.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Withdrawals
                      </dt>
                      <dd className="mt-2 text-sm font-medium text-white">
                        {account.product.allowsWithdrawals
                          ? "Available"
                          : "Restricted"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Lock status
                      </dt>
                      <dd className="mt-2 flex items-center gap-2 text-sm font-medium text-white">
                        <Lock className="h-4 w-4 text-slate-400" />
                        {account.isLocked && account.lockedUntil
                          ? `Until ${formatDateLabel(account.lockedUntil)}`
                          : "Flexible"}
                      </dd>
                    </div>
                  </dl>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-sm text-slate-300">
                    {account.product.description ??
                      "No product description available."}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <SavingsDepositButton
                      accountId={account.id}
                      label={getSavingsDepositButtonLabel(
                        account.latestFundingIntentStatus,
                      )}
                      disabled={isTargetReached || account.status === "CLOSED"}
                      disabledLabel={
                        account.status === "CLOSED"
                          ? "Closed"
                          : "Target reached"
                      }
                      className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600"
                    />
                    {canCancelSavingsAccount(account) ? (
                      <CancelSavingsAccountButton accountId={account.id} />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
