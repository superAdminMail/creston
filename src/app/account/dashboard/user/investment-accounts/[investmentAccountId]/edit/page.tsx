import { notFound } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness, Layers3 } from "lucide-react";
import Link from "next/link";

import { getInvestmentAccountDetails } from "@/actions/investment-account/getInvestmentAccountDetails";
import { UpdateInvestmentAccountForm } from "../../../_components/UpdateInvestmentAccountForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const account = await getInvestmentAccountDetails(id);

  if (!account) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-8">
      <Link
        href={`/account/dashboard/user/investment-accounts/${account.id}`}
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-sky-800 dark:text-slate-400 dark:hover:text-sky-400"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors group-hover:border-sky-200 group-hover:bg-sky-50 dark:border-white/10 dark:bg-white/[0.03] dark:group-hover:border-sky-400/30 dark:group-hover:bg-sky-400/10">
          <ArrowLeft className="h-4 w-4" />
        </span>
        Back to account details
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-400">
          <BriefcaseBusiness className="h-4 w-4" />
          Account management
        </div>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Manage investment account
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Review the account information and manage its lifecycle status.
          Changes are subject to the current account management rules.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-400">
              <Layers3 className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Investment account
              </p>

              <h2 className="mt-1 break-words text-lg font-semibold text-slate-950 dark:text-white">
                {account.title}
              </h2>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {account.investment.name} · {account.investment.typeLabel}
              </p>
            </div>
          </div>

          <span className="w-fit shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
            {account.statusLabel}
          </span>
        </div>

        <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 dark:border-white/10 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Investment model
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
              {account.plan.investmentModelLabel}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/[0.03]">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plan period
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
              {account.plan.periodLabel}
            </p>
          </div>
        </div>
      </section>

      <UpdateInvestmentAccountForm
        accountId={account.id}
        currentStatus={account.status}
      />
    </div>
  );
}
