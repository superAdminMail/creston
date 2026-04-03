import Link from "next/link";

import { deleteInvestmentPlan } from "@/actions/super-admin/investment-plans/deleteInvestmentPlan";
import { toggleInvestmentPlanActive } from "@/actions/super-admin/investment-plans/toggleInvestmentPlanActive";
import type { SuperAdminInvestmentPlanDetails } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlanById";
import { SuperAdminActionSubmitButton } from "../../_components/SuperAdminActionSubmitButton";
import { InvestmentPlanStatusBadge } from "./InvestmentPlanStatusBadge";

type InvestmentPlanDetailsCardProps = {
  plan: SuperAdminInvestmentPlanDetails;
};

export function InvestmentPlanDetailsCard({
  plan,
}: InvestmentPlanDetailsCardProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {plan.name}
          </h1>
          <InvestmentPlanStatusBadge isActive={plan.isActive} />
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          {plan.description}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Parent investment
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              <Link
                href={`/account/dashboard/super-admin/investments/${plan.investmentId}`}
                className="text-blue-200 transition hover:text-white"
              >
                {plan.investmentName}
              </Link>
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Category
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {plan.categoryLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Period
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {plan.periodLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Minimum amount
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {plan.minAmountLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Maximum amount
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {plan.maxAmountLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Currency
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {plan.currency}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Created
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {plan.createdAt}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Updated
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {plan.updatedAt}
            </dd>
          </div>
        </dl>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6 shadow-[0_20px_55px_rgba(2,6,23,0.26)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Plan controls</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Keep this plan aligned with the live catalog by controlling whether
            it can be attached to future investor orders.
          </p>

          <div className="mt-5 space-y-3">
            <form action={toggleInvestmentPlanActive.bind(null, plan.id)}>
              <SuperAdminActionSubmitButton
                idleLabel={plan.isActive ? "Deactivate plan" : "Activate plan"}
                pendingLabel={plan.isActive ? "Deactivating..." : "Activating..."}
                variant="outline"
                className="h-11 w-full rounded-xl border-white/10 bg-white/[0.03] text-slate-100 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              />
            </form>

            <form action={deleteInvestmentPlan.bind(null, plan.id)}>
              <SuperAdminActionSubmitButton
                idleLabel="Delete investment plan"
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
            Edit this plan when investment ranges, category mapping, or parent
            investment assignment changes.
          </p>
          <Link
            href={`/account/dashboard/super-admin/investment-plans/${plan.id}/edit`}
            className="btn-primary mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Edit investment plan
          </Link>
        </section>
      </aside>
    </section>
  );
}
