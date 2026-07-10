import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export function SavingsProductsHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href="/account/dashboard/super-admin"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-sky-700 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
          Savings Products
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
          Create, review, and manage the savings product catalog that powers
          user savings accounts.
        </p>
      </div>

      <Link
        href="/account/dashboard/super-admin/savings-products/new"
        className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
      >
        <Plus className="h-4 w-4" />
        New product
      </Link>
    </div>
  );
}
