"use client";

import Link from "next/link";
import { AlertCircle, Lock, PiggyBank, Plus, ShieldAlert } from "lucide-react";

import type { SavingsPageData } from "@/actions/savings/getSavingsPageData";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatCurrency,
  formatDateLabel,
  formatEnumLabel,
} from "@/lib/formatters/formatters";

type SavingsDashboardProps = {
  accounts: SavingsPageData["accounts"];
  kycStatus: SavingsPageData["kycStatus"];
  canCreateSavingsAccount: boolean;
};

export default function SavingsDashboard({
  accounts,
  kycStatus,
  canCreateSavingsAccount,
}: SavingsDashboardProps) {
  const hasAccounts = accounts.length > 0;
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-white">
            Personal savings accounts
          </h1>
          <p className="text-sm text-slate-400">
            Track balances, product rules, lock status, and account targets from
            one place.
          </p>
        </div>

        {canCreateSavingsAccount ? (
          <Button asChild className="rounded-2xl bg-blue-500 hover:bg-blue-600">
            <Link href="/account/dashboard/user/savings/new">
              <Plus className="h-4 w-4" />
              Add savings account
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="rounded-2xl">
            <Link href="/account/dashboard/user/kyc">
              <Plus className="h-4 w-4" />
              Complete KYC
            </Link>
          </Button>
        )}
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
          <CardContent className="space-y-2 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Accounts
            </p>
            <p className="text-2xl font-semibold text-white">{accounts.length}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
          <CardContent className="space-y-2 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Total balance
            </p>
            <p className="text-2xl font-semibold text-white">
              {formatCurrency(totalBalance)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.75rem] border border-white/10 bg-white/5">
          <CardContent className="space-y-2 p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Locked accounts
            </p>
            <p className="text-2xl font-semibold text-white">
              {accounts.filter((account) => account.isLocked).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {!hasAccounts ? (
        <Card className="rounded-[1.75rem] border border-white/10 bg-white/5 text-center">
          <CardContent className="space-y-4 p-10">
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
              <Button asChild className="rounded-2xl bg-blue-500 hover:bg-blue-600">
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
        <div className="grid gap-6 md:grid-cols-2">
          {accounts.map((account) => (
            <Card
              key={account.id}
              className="rounded-[1.75rem] border border-white/10 bg-white/5"
            >
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-white">
                      {account.name}
                    </h2>
                    <p className="text-sm text-slate-400">
                      {account.product.name} • {formatEnumLabel(account.status)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
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
                  <h3 className="mt-1 text-2xl font-semibold text-white">
                    {formatCurrency(account.balance, account.currency)}
                  </h3>
                </div>

                {account.description ? (
                  <p className="text-sm leading-7 text-slate-400">
                    {account.description}
                  </p>
                ) : null}

                <dl className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Target amount
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-white">
                      {account.targetAmount
                        ? formatCurrency(account.targetAmount, account.currency)
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
                      {account.product.allowsWithdrawals ? "Available" : "Restricted"}
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
                  {account.product.description ?? "No product description available."}
                </div>

                <Alert className="rounded-2xl border border-white/10 bg-white/[0.04] text-slate-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    Deposit and withdrawal submission for savings accounts is not
                    wired into this dashboard card yet.
                  </AlertTitle>
                </Alert>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
