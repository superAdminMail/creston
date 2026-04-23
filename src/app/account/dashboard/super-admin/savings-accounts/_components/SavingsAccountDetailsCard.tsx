import Link from "next/link";

import type { SuperAdminSavingsAccountDetailsViewModel } from "@/actions/super-admin/savings-accounts/getSuperAdminSavingsAccountById";
import { formatCurrency } from "@/lib/formatters/formatters";

export function SavingsAccountDetailsCard({
  account,
}: {
  account: SuperAdminSavingsAccountDetailsViewModel;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {account.title}
          </h1>
          <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
            {account.isLocked ? "Locked" : "Unlocked"}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          {account.product.description}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Balance
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {formatCurrency(account.balance, account.currency)}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Target
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {account.targetAmountLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Updated
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {account.updatedAt}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Transactions
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {account.counts.transactions}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Funding intents
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {account.counts.fundingIntents}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Recent funding intents
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Latest funding attempts linked to this account.
              </p>
            </div>
          </div>

          {account.recentFundingIntents.length > 0 ? (
            <div className="mt-4 space-y-3">
              {account.recentFundingIntents.map((intent) => (
                <div
                  key={intent.id}
                  className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {intent.status}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {intent.fundingMethodType} • {intent.createdAt}
                    </p>
                  </div>
                  <p className="text-sm text-slate-300">
                    {formatCurrency(intent.creditedAmount, account.currency)} /{" "}
                    {formatCurrency(intent.targetAmount, account.currency)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No funding intents have been recorded yet.
            </p>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6 shadow-[0_20px_55px_rgba(2,6,23,0.26)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Account controls</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use the edit page to change account lifecycle state, lock behavior,
            and target configuration.
          </p>

          <Link
            href={`/account/dashboard/super-admin/savings-accounts/${account.id}/edit`}
            className="btn-primary mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Edit account
          </Link>
        </section>

        <section className="card-premium rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-white">Owner</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {account.owner.name}
          </p>
          <p className="mt-1 text-sm text-slate-300">{account.owner.email}</p>
        </section>
      </aside>
    </section>
  );
}
