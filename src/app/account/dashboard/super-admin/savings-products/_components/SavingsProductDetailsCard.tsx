import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { toggleSavingsProductActive } from "@/actions/super-admin/savings-products/toggleSavingsProductActive";
import type { SuperAdminSavingsProductDetails } from "@/actions/super-admin/savings-products/getSuperAdminSavingsProductById";
import { DashboardSectionCard } from "../../../_components/DashboardSectionCard";
import { SuperAdminActionSubmitButton } from "../../_components/SuperAdminActionSubmitButton";
import { SavingsProductStatusBadge } from "./SavingsProductStatusBadge";

type SavingsProductDetailsCardProps = {
  product: SuperAdminSavingsProductDetails;
};

export function SavingsProductDetailsCard({
  product,
}: SavingsProductDetailsCardProps) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <DashboardSectionCard>
        <Link
          href="/account/dashboard/super-admin/savings-products"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to savings product list
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl dark:text-white">
            {product.name}
          </h1>
          <SavingsProductStatusBadge isActive={product.isActive} />
        </div>

        <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {product.description}
        </p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Interest
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {product.interestRateLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Frequency
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {product.frequencyLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Lock settings
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {product.lockRangeLabel ?? "Not lockable"}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Balance range
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {product.balanceRangeLabel}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Accounts
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {product.accountCount}
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]">
            <dt className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Created
            </dt>
            <dd className="mt-2 text-sm font-medium text-slate-950 dark:text-white">
              {product.createdAt}
            </dd>
          </div>
        </dl>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Availability
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {product.allowsDeposits
                ? "Deposits are enabled."
                : "Deposits are disabled."}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {product.allowsWithdrawals
                ? "Withdrawals are enabled."
                : "Withdrawals are disabled."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03]">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Status
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {product.isActive
                ? "This product is live for new savings accounts."
                : "This product is inactive and hidden from new signups."}
            </p>
          </div>
        </div>
      </DashboardSectionCard>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-white/8 dark:bg-[#08101d]/96 dark:shadow-[0_20px_55px_rgba(2,6,23,0.26)] dark:backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Product controls
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Use the controls below to activate, deactivate, or update this
            savings product.
          </p>

          <div className="mt-5 space-y-3">
            <form action={toggleSavingsProductActive.bind(null, product.id)}>
              <SuperAdminActionSubmitButton
                idleLabel={product.isActive ? "Deactivate product" : "Activate product"}
                pendingLabel={product.isActive ? "Deactivating..." : "Activating..."}
                variant="outline"
                className="h-11 w-full rounded-xl border-slate-200/80 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:border-white/15 dark:hover:bg-white/[0.06] dark:hover:text-white"
              />
            </form>
          </div>
        </section>

        <DashboardSectionCard className="p-6">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Next action
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Edit the product when interest rules, locking rules, or balance
            limits change.
          </p>
          <Link
            href={`/account/dashboard/super-admin/savings-products/${product.id}/edit`}
            className="btn-primary mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold"
          >
            Edit savings product
          </Link>
        </DashboardSectionCard>
      </aside>
    </section>
  );
}
