import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { deleteInvestmentPlan } from "@/actions/super-admin/investment-plans/deleteInvestmentPlan";
import { SuperAdminActionSubmitButton } from "../../_components/SuperAdminActionSubmitButton";
import { toggleSavingsProductActive } from "@/actions/super-admin/savings-products/toggleSavingsProductActive";
import type { SuperAdminSavingsProductDetails } from "@/actions/super-admin/savings-products/getSuperAdminSavingsProductById";
import { SavingsProductStatusBadge } from "./SavingsProductStatusBadge";

type SavingsProductDetailsCardProps = {
  product: SuperAdminSavingsProductDetails;
};

export function SavingsProductDetailsCard({
  product,
}: SavingsProductDetailsCardProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="card-premium rounded-[2rem] p-6 sm:p-8">
        <Link
          href="/account/dashboard/super-admin/savings-products"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to savings product list
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {product.name}
          </h1>
          <SavingsProductStatusBadge isActive={product.isActive} />
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-300">
          {product.description}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Interest
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {product.interestRateLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Frequency
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {product.frequencyLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Lock settings
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {product.lockRangeLabel ?? "Not lockable"}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Balance range
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {product.balanceRangeLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Accounts
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {product.accountCount}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Created
            </dt>
            <dd className="mt-2 text-sm font-medium text-white">
              {product.createdAt}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Availability
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {product.allowsDeposits
                ? "Deposits are enabled."
                : "Deposits are disabled."}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {product.allowsWithdrawals
                ? "Withdrawals are enabled."
                : "Withdrawals are disabled."}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              Status
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {product.isActive
                ? "This product is live for new savings accounts."
                : "This product is inactive and hidden from new signups."}
            </p>
          </div>
        </div>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-white/8 bg-[#08101d]/96 p-6 shadow-[0_20px_55px_rgba(2,6,23,0.26)] backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white">Product controls</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Use the controls below to activate, deactivate, or update this
            savings product.
          </p>

          <div className="mt-5 space-y-3">
            <form action={toggleSavingsProductActive.bind(null, product.id)}>
              <SuperAdminActionSubmitButton
                idleLabel={product.isActive ? "Deactivate product" : "Activate product"}
                pendingLabel={product.isActive ? "Deactivating..." : "Activating..."}
                variant="outline"
                className="h-11 w-full rounded-xl border-white/10 bg-white/[0.03] text-slate-100 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              />
            </form>
          </div>
        </section>

        <section className="card-premium rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold text-white">Next action</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Edit the product when interest rules, locking rules, or balance
            limits change.
          </p>
          <Link
            href={`/account/dashboard/super-admin/savings-products/${product.id}/edit`}
            className="btn-primary mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Edit savings product
          </Link>
        </section>
      </aside>
    </section>
  );
}
