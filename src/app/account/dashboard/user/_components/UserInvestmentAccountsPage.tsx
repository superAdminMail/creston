import Link from "next/link";
import type { ReactNode } from "react";

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CircleAlert,
  Landmark,
  LineChart,
  Plus,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { UserInvestmentAccountsPageData } from "@/actions/accounts/get-current-user-investment-accounts";
import { formatCurrency } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";

type UserInvestmentAccountsPageProps = {
  data: UserInvestmentAccountsPageData;
};

const SURFACE =
  "rounded-2xl border border-slate-200/80 bg-white text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-white";

function getStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300";
    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300";
    case "FROZEN":
      return "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-400/20 dark:bg-slate-400/10 dark:text-slate-300";
    case "CLOSED":
      return "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300";
  }
}

function OverviewMetric({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: string | number;
  accent?: "slate" | "blue" | "green";
}) {
  const colors = {
    slate: "text-slate-950 dark:text-white",
    blue: "text-sky-800 dark:text-sky-300",
    green: "text-emerald-700 dark:text-emerald-300",
  };

  return (
    <div className="min-w-0 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 truncate text-2xl font-bold tracking-tight sm:text-3xl",
          colors[accent],
        )}
      >
        {value}
      </p>
    </div>
  );
}

function AccountDetail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 break-words text-sm font-semibold text-slate-900 dark:text-slate-200">
        {value}
      </p>
    </div>
  );
}

function ReadinessItem({
  title,
  body,
  icon: Icon,
  ready,
}: {
  title: string;
  body: string;
  icon: LucideIcon;
  ready: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        ready
          ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-400/15 dark:bg-emerald-400/5"
          : "border-amber-200 bg-amber-50/70 dark:border-amber-400/15 dark:bg-amber-400/5",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            ready
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {title}
            </p>
            {ready ? (
              <BadgeCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <CircleAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-700 dark:text-slate-400">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function UserInvestmentAccountsPage({
  data,
}: UserInvestmentAccountsPageProps) {
  const readinessItems = [
    {
      title: data.readiness.profileReady
        ? "Investment profile ready"
        : "Investment profile needs attention",
      body: data.readiness.profileReady
        ? "Your core identity and contact details are in place for account servicing."
        : "Complete your investment profile to keep account setup and servicing moving smoothly.",
      icon: BriefcaseBusiness,
      ready: data.readiness.profileReady,
    },
    {
      title: data.readiness.kycReady
        ? "KYC verification ready"
        : "KYC verification pending",
      body: data.readiness.kycReady
        ? "Your identity verification is in good standing for secure account activity."
        : "Prepare and submit your verification documents to strengthen account readiness.",
      icon: ShieldCheck,
      ready: data.readiness.kycReady,
    },
  ];

  const nextActions = [
    {
      href: "/account/dashboard/user/investment-profile",
      label: "Review investment profile",
    },
    {
      href: "/account/dashboard/user/performance",
      label: "Track investment performance",
    },
    {
      href: "/account/dashboard/user/investment-orders",
      label: "Review investment orders",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Link
            href="/account/dashboard/user"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <Landmark className="h-3.5 w-3.5" />
              Portfolio management
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
              Investment Accounts
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              View and manage your investment accounts, linked products,
              balances, and account status.
            </p>
          </div>
        </div>

        <Link
          href="/account/dashboard/user/investment-accounts/new"
          className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold sm:w-fit"
        >
          <Plus className="h-4 w-4" />
          Open account
        </Link>
      </section>

      {/* Account overview */}
      <section className={`${SURFACE} p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
              <Landmark className="h-5 w-5" />
            </div>

            <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              Account Overview
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              A summary of your investment accounts and their current balances
              and servicing status.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[460px]">
            <OverviewMetric
              label="Total accounts"
              value={data.totalAccountsCount}
            />
            <OverviewMetric
              label="Active accounts"
              value={data.activeAccountsCount}
              accent="green"
            />
            <OverviewMetric
              label="Total balance"
              value={formatCurrency(data.totalBalance)}
              accent="blue"
            />
            <OverviewMetric
              label="Fixed accounts"
              value={data.fixedAccountsCount}
            />
            <OverviewMetric
              label="Market accounts"
              value={data.marketAccountsCount}
            />
          </div>
        </div>
      </section>

      {/* Account list and sidebar */}
      <section className="grid gap-5 xl:grid-cols-[1.5fr_0.85fr]">
        {/* Investment accounts */}
        <div className={`${SURFACE} min-w-0 p-5 sm:p-6`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                Your Accounts
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Your investment accounts and their current details.
              </p>
            </div>

            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              {data.totalAccountsCount}{" "}
              {data.totalAccountsCount === 1 ? "account" : "accounts"}
            </span>
          </div>

          {data.accounts.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-10 text-center dark:border-white/15 dark:bg-white/[0.02]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                <Wallet className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
                No investment accounts yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                Once your account is ready, your investment accounts will appear
                here with their linked products, balances, and current status.
              </p>

              <Link
                href="/account/dashboard/user/investment-accounts/new"
                className="btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
              >
                <Plus className="h-4 w-4" />
                Open account
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {data.accounts.map((account) => (
                <article
                  key={account.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-sky-200 dark:border-white/10 dark:bg-slate-950/40 dark:hover:border-sky-400/20 sm:p-5"
                >
                  <div className="flex flex-col gap-4">
                    {/* Account title and status */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-950 dark:text-white sm:text-lg">
                          {account.investmentName}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {account.planName}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                          {account.investmentModelLabel}
                        </span>

                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                            getStatusClasses(account.status),
                          )}
                        >
                          {account.statusLabel}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {account.planDescription}
                    </p>

                    {/* Account details */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-xl bg-slate-50/80 p-4 dark:bg-white/[0.03] sm:grid-cols-3">
                      <AccountDetail
                        label="Balance"
                        value={formatCurrency(
                          account.balance,
                          account.currency,
                        )}
                      />

                      <AccountDetail
                        label="Product type"
                        value={account.investmentTypeLabel}
                      />

                      <AccountDetail
                        label="Plan period"
                        value={account.planPeriodLabel}
                      />

                      <AccountDetail
                        label="Orders linked"
                        value={account.orderCount}
                      />

                      <AccountDetail
                        label="Last updated"
                        value={account.updatedDate}
                      />

                      <AccountDetail
                        label="Account opened"
                        value={account.openedDate}
                      />
                    </div>

                    {/* Account timeline and details link */}
                    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 text-sky-700 dark:text-sky-300" />
                          Created {account.createdDate}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Wallet className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300" />
                          Opened {account.openedDate}
                        </span>
                      </div>

                      <Link
                        href={`/account/dashboard/user/investment-accounts/${account.id}`}
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-sky-800 transition hover:text-sky-600 dark:text-sky-300 dark:hover:text-sky-200"
                      >
                        View account details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <section className={`${SURFACE} p-5 sm:p-6`}>
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
                Account Readiness
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Review the profile and verification requirements that support
                your account activity.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {readinessItems.map((item) => (
                <ReadinessItem
                  key={item.title}
                  title={item.title}
                  body={item.body}
                  icon={item.icon}
                  ready={item.ready}
                />
              ))}

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
                    <BriefcaseBusiness className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {data.totalAccountsCount > 0
                        ? `${data.totalAccountsCount} investment account${data.totalAccountsCount === 1 ? "" : "s"} on file`
                        : "No investment accounts yet"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {data.totalAccountsCount > 0
                        ? "Your account list reflects the current investment model, linked product, and lifecycle status for each account."
                        : "Open your first investment account once your profile and verification steps are in place."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={`${SURFACE} p-5 sm:p-6`}>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Next Actions
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Useful shortcuts for managing your investment activity.
            </p>

            <div className="mt-5 space-y-2">
              {nextActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50/70 hover:text-sky-900 dark:border-white/10 dark:text-slate-300 dark:hover:border-sky-400/20 dark:hover:bg-sky-400/5 dark:hover:text-sky-200"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-sky-700 dark:group-hover:text-sky-300" />
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
