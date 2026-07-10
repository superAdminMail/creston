import Image from "next/image";
import Link from "next/link";

import { deleteInvestment } from "@/actions/super-admin/investments/deleteInvestment";
import { updateInvestmentStatus } from "@/actions/super-admin/investments/updateInvestmentStatus";
import { toggleInvestmentActive } from "@/actions/super-admin/investments/toggleInvestmentActive";
import type { SuperAdminInvestmentDetails } from "@/actions/super-admin/investments/getSuperAdminInvestmentById";
import { DashboardSectionCard } from "../../../_components/DashboardSectionCard";
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
      <DashboardSectionCard>
        <div className="flex flex-wrap items-center gap-3">
          {investment.iconUrl ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-slate-200/80 bg-white/85">
              <Image
                src={investment.iconUrl}
                alt={`${investment.name} icon`}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>
          ) : null}
          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
            {investment.name}
          </h1>
          <InvestmentStatusBadge
            status={investment.status}
            label={investment.statusLabel}
          />
          <span className="inline-flex items-center rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-slate-700">
            {investment.isActive ? "Enabled" : "Disabled"}
          </span>
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          {investment.description}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Type
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {investment.typeLabel}
            </dd>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Sort order
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {investment.sortOrder}
            </dd>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Created
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {investment.createdAt}
            </dd>
          </div>
          <div className="rounded-2xl border border-border/60 bg-white/80 p-4 shadow-sm dark:bg-white/[0.04]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Updated
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {investment.updatedAt}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-2xl border border-border/60 bg-white/80 p-5 shadow-sm dark:bg-white/[0.04]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Related plans
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {investment.relatedPlans.length} plan
                {investment.relatedPlans.length === 1 ? "" : "s"} linked to this
                investment.
              </p>
            </div>
            <Link
              href={`/account/dashboard/super-admin/investment-plans?investmentId=${investment.id}`}
              className="text-sm font-medium text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
            >
              View plans
            </Link>
          </div>

          {investment.relatedPlans.length > 0 ? (
            <div className="mt-4 space-y-3">
              {investment.relatedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/85 px-4 py-3 shadow-sm dark:bg-white/[0.04]"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-950 dark:text-white">
                      {plan.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {plan.periodLabel} |{" "}
                      {plan.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Link
                    href={`/account/dashboard/super-admin/investment-plans/${plan.id}`}
                    className="text-sm text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
                  >
                    Open
                  </Link>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </DashboardSectionCard>

      <aside className="space-y-6">
        <DashboardSectionCard className="p-6">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Catalog controls
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Use the controls below to modify this investment&apos;s status, or
            update its details to keep your catalog up to date.
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
                className="h-11 w-full rounded-xl border-border/60 bg-white/90 text-slate-700 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
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
                      className="h-11 w-full rounded-xl border-border/60 bg-white/85 text-slate-700 hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:border-border/60 disabled:bg-white/70 disabled:text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white dark:disabled:bg-white/[0.03] dark:disabled:text-slate-500"
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
        </DashboardSectionCard>

        <DashboardSectionCard className="p-6">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Next action
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Edit the investment details or manage related plans to keep your
            offerings up to date.
          </p>
          <Link
            href={`/account/dashboard/super-admin/investments/${investment.id}/edit`}
            className="btn-primary mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Edit investment
          </Link>
        </DashboardSectionCard>
      </aside>
    </section>
  );
}
