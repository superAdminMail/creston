import Link from "next/link";

import type { SuperAdminInvestorDetailsViewModel } from "@/actions/super-admin/investors/getSuperAdminInvestorById";

export function InvestorDetailsCard({
  investor,
}: {
  investor: SuperAdminInvestorDetailsViewModel;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {investor.title}
          </h1>
          <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
            {investor.isVerified ? "Verified" : "Not verified"}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          {investor.owner.email}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Phone
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investor.profile.phoneNumber}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              KYC status
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investor.kycStatusLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Updated
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investor.timeline[1]?.value ?? "Not available"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Investment accounts
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investor.counts.investmentAccounts}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Savings accounts
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investor.counts.savingsAccounts}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold text-white">Contact details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Country
              </p>
              <p className="mt-2 text-sm text-white">{investor.profile.country}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                State
              </p>
              <p className="mt-2 text-sm text-white">{investor.profile.state}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                City
              </p>
              <p className="mt-2 text-sm text-white">{investor.profile.city}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Address
              </p>
              <p className="mt-2 text-sm text-white">
                {investor.profile.addressLine1}
                {investor.profile.addressLine2 !== "Not set"
                  ? `, ${investor.profile.addressLine2}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6 shadow-[0_20px_55px_rgba(2,6,23,0.26)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Profile controls</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use the edit page to update identity fields and review state.
          </p>

          <Link
            href={`/account/dashboard/super-admin/investors/${investor.id}/edit`}
            className="btn-primary mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Edit investor
          </Link>
        </section>

        <section className="card-premium rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-white">Quick links</h2>
          <div className="mt-4 space-y-3">
          <Link
            href="/account/dashboard/super-admin/investment-accounts"
            className="block rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-slate-200 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
          >
            View investment accounts
          </Link>
          <Link
            href="/account/dashboard/super-admin/savings-accounts"
            className="block rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3 text-sm text-slate-200 transition hover:border-white/12 hover:bg-white/[0.04] hover:text-white"
          >
            View savings accounts
          </Link>
          </div>
        </section>
      </aside>
    </section>
  );
}
