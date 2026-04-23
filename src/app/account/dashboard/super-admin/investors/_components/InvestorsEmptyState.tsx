import Link from "next/link";

export function InvestorsEmptyState() {
  return (
    <section className="card-premium rounded-[1.9rem] text-center">
      <div className="space-y-3 p-8">
        <h2 className="text-lg font-semibold text-white">No investors found</h2>
        <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-400">
          Investor profiles will appear here as users complete onboarding and
          create their first savings or investment activity.
        </p>
        <Link
          href="/account/dashboard/super-admin/users"
          className="btn-primary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
        >
          Review users
        </Link>
      </div>
    </section>
  );
}
