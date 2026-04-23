import Link from "next/link";

export function SavingsAccountsEmptyState() {
  return (
    <section className="card-premium rounded-[1.9rem] text-center">
      <div className="space-y-3 p-8">
        <h2 className="text-lg font-semibold text-white">
          No savings accounts found
        </h2>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
          Savings accounts will appear here as users open and fund savings
          products across the platform.
        </p>
        <Link
          href="/account/dashboard/super-admin/savings-products"
          className="btn-primary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
        >
          Review savings products
        </Link>
      </div>
    </section>
  );
}
