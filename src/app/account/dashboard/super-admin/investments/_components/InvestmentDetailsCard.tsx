import Image from "next/image";
import Link from "next/link";

import { deleteInvestment } from "@/actions/super-admin/investments/deleteInvestment";
import { updateInvestmentStatus } from "@/actions/super-admin/investments/updateInvestmentStatus";
import { toggleInvestmentActive } from "@/actions/super-admin/investments/toggleInvestmentActive";
import type { SuperAdminInvestmentDetails } from "@/actions/super-admin/investments/getSuperAdminInvestmentById";
import { SuperAdminActionSubmitButton } from "../../_components/SuperAdminActionSubmitButton";
import { InvestmentStatusBadge } from "./InvestmentStatusBadge";

type InvestmentDetailsCardProps = {
  investment: SuperAdminInvestmentDetails;
};

export function InvestmentDetailsCard({
  investment,
}: InvestmentDetailsCardProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          {investment.iconUrl ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
              <Image
                src={investment.iconUrl}
                alt={`${investment.name} icon`}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
          ) : null}
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {investment.name}
          </h1>
          <InvestmentStatusBadge
            status={investment.status}
            label={investment.statusLabel}
          />
          <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
            {investment.isActive ? "Enabled" : "Disabled"}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          {investment.description}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Type
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investment.typeLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Period
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investment.periodLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Sort order
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investment.sortOrder}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Created
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investment.createdAt}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Updated
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {investment.updatedAt}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Related plans
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {investment.relatedPlans.length} plan
                {investment.relatedPlans.length === 1 ? "" : "s"} linked to this
                investment.
              </p>
            </div>
            <Link
              href={`/account/dashboard/super-admin/investment-plans?investmentId=${investment.id}`}
              className="text-sm font-medium text-blue-200 transition hover:text-white"
            >
              View plans
            </Link>
          </div>

          {investment.relatedPlans.length > 0 ? (
            <div className="mt-4 space-y-3">
              {investment.relatedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {plan.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {plan.periodLabel} |{" "}
                      {plan.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Link
                    href={`/account/dashboard/super-admin/investment-plans/${plan.id}`}
                    className="text-sm text-blue-200 transition hover:text-white"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6 shadow-[0_20px_55px_rgba(2,6,23,0.26)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Catalog controls</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use the controls below to modify this investment&apos;s status, or update
            its details to keep your catalog up to date.
          </p>

          <div className="mt-5 space-y-3">
            <form action={toggleInvestmentActive.bind(null, investment.id)}>
              <SuperAdminActionSubmitButton
                idleLabel={
                  investment.isActive
                    ? "Deactivate investment"
                    : "Activate investment"
                }
                pendingLabel={
                  investment.isActive ? "Deactivating..." : "Activating..."
                }
                variant="outline"
                className="h-11 w-full rounded-xl border-white/10 bg-white/[0.03] text-slate-100 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              />
            </form>

            <div className="grid gap-3">
              {(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"] as const).map(
                (status) => (
                  <form
                    key={status}
                    action={updateInvestmentStatus.bind(
                      null,
                      investment.id,
                      status,
                    )}
                  >
                    <SuperAdminActionSubmitButton
                      idleLabel={`Mark as ${status.toLowerCase()}`}
                      pendingLabel="Updating..."
                      variant="outline"
                      className="h-11 w-full rounded-xl border-white/8 bg-transparent text-slate-300 hover:border-white/12 hover:bg-white/[0.04] hover:text-white disabled:border-white/8 disabled:bg-white/[0.02] disabled:text-slate-500"
                      disabled={investment.status === status}
                    />
                  </form>
                ),
              )}
            </div>

            <form action={deleteInvestment.bind(null, investment.id)}>
              <SuperAdminActionSubmitButton
                idleLabel="Delete investment"
                pendingLabel="Deleting..."
                variant="destructive"
                className="h-11 w-full rounded-xl"
              />
            </form>
          </div>
        </section>

        <section className="card-premium rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-white">Next action</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Edit the investment details or manage related plans to keep your
            offerings up to date.
          </p>
          <Link
            href={`/account/dashboard/super-admin/investments/${investment.id}/edit`}
            className="btn-primary mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Edit investment
          </Link>
        </section>
      </aside>
    </section>
  );
}
