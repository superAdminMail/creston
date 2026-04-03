import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CircleAlert,
  Landmark,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import type { UserInvestmentAccountsPageData } from "@/actions/accounts/get-current-user-investment-accounts";
import { formatUsd } from "@/lib/formatters/formatters";
import { cn } from "@/lib/utils";

type UserInvestmentAccountsPageProps = {
  data: UserInvestmentAccountsPageData;
};

function getStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "PENDING":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "FROZEN":
      return "border-slate-300/20 bg-slate-400/10 text-slate-200";
    case "CLOSED":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/[0.04] text-slate-200";
  }
}

export function UserInvestmentAccountsPage({
  data,
}: UserInvestmentAccountsPageProps) {
  const readinessItems = [
    {
      title: data.readiness.profileReady
        ? "Investment profile ready"
        : "Investment profile still needs attention",
      body: data.readiness.profileReady
        ? "Your core identity and contact details are in place for account servicing."
        : "Complete your investment profile to keep account setup and servicing moving smoothly.",
      icon: data.readiness.profileReady ? BadgeCheck : CircleAlert,
      tone: data.readiness.profileReady
        ? "border-emerald-400/15 bg-emerald-400/8"
        : "border-amber-400/15 bg-amber-400/8",
      iconColor: data.readiness.profileReady
        ? "text-emerald-300"
        : "text-amber-300",
    },
    {
      title: data.readiness.kycReady
        ? "KYC verification ready"
        : "KYC verification pending",
      body: data.readiness.kycReady
        ? "Your identity verification is in good standing for secure account activity."
        : "Prepare and submit your verification documents to strengthen account readiness.",
      icon: ShieldCheck,
      tone: data.readiness.kycReady
        ? "border-blue-400/15 bg-blue-400/8"
        : "border-white/8 bg-white/[0.03]",
      iconColor: "text-blue-300",
    },
    {
      title:
        data.totalAccountsCount > 0
          ? `${data.totalAccountsCount} investment account${data.totalAccountsCount === 1 ? "" : "s"} on file`
          : "No investment accounts yet",
      body:
        data.totalAccountsCount > 0
          ? "Your account list is active and available for review from this secure workspace."
          : "Open your first investment account once your profile and verification steps are in place.",
      icon: BriefcaseBusiness,
      tone: "border-white/8 bg-white/[0.03]",
      iconColor: "text-blue-300",
    },
  ];

  const nextActions = [
    {
      href: "/account/dashboard/user/investment-profile",
      label: "Review investment profile",
    },
    {
      href: "/account/dashboard/user/performance",
      label: "View contribution history",
    },
    {
      href: "/account/dashboard/user/documents",
      label: "Prepare verification documents",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/account/dashboard/user"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            Investment Accounts
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Monitor the investment accounts linked to your Havenstone profile in
            one secure and structured account workspace.
          </p>
        </div>

        <Link
          href="/account/dashboard/user/investments"
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Open account
        </Link>
      </div>

      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs font-medium text-blue-200">
              <Landmark className="h-3.5 w-3.5" />
              Account overview
            </div>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
              Secure visibility into your investment accounts
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Review each account, track status across active and pending
              accounts, and stay prepared for future contribution and
              verification activity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[30rem]">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Total accounts
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.totalAccountsCount}
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-200/80">
                Active
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.activeAccountsCount}
              </p>
            </div>

            <div className="rounded-3xl border border-amber-400/15 bg-amber-400/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-200/80">
                Pending
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.pendingAccountsCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="card-premium rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
                Account list
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Each investment account reflects its current servicing status,
                linked plan, and opening details.
              </p>
            </div>
          </div>

          {data.accounts.length === 0 ? (
            <div className="mt-6 rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
                <Wallet className="h-6 w-6 text-blue-300" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">
                No investment accounts yet
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Once your account is ready, Havenstone will list your active and
                pending investment accounts here with their plan and servicing
                status.
              </p>
              <Link
                href="/account/dashboard/user/investments"
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
                  className="rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 transition-all duration-200 hover:border-white/12 hover:bg-white/[0.04]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">
                          {account.accountType}
                        </h3>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                            getStatusClasses(account.status),
                          )}
                        >
                          {account.statusLabel}
                        </span>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                            Balance
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {formatUsd(account.balance)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                            Plan
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {account.planName}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                            Opened date
                          </p>
                          <p className="mt-2 text-sm font-medium text-white">
                            {account.openedDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:pl-6">
                      <Link
                        href={`/account/dashboard/user/investment-accounts/${account.id}`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
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

        <div className="space-y-6">
          <section className="glass-strong rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold text-white">
              Account readiness
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Review the key profile and verification areas that support secure
              account readiness.
            </p>

            <div className="mt-5 space-y-3">
              {readinessItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={cn("rounded-2xl p-4", item.tone)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={cn("mt-0.5 h-4 w-4", item.iconColor)} />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-300">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card-premium rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold text-white">Next actions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Keep the foundations of your Havenstone account current as you
              open and manage investment accounts.
            </p>

            <div className="mt-5 space-y-3">
              {nextActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <span>{action.label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
