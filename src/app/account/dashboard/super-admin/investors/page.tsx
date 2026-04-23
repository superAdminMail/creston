import { getSuperAdminInvestors } from "@/actions/super-admin/investors/getSuperAdminInvestors";

import { InvestorsHeader } from "./_components/InvestorsHeader";
import { InvestorsTable } from "./_components/InvestorsTable";

export default async function SuperAdminInvestorsPage() {
  const data = await getSuperAdminInvestors();

  return (
    <div className="space-y-6">
      <InvestorsHeader />

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Total investors
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {data.totalInvestorsCount}
          </p>
        </div>
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Verified investors
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {data.verifiedInvestorsCount}
          </p>
        </div>
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            Pending review
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {data.pendingReviewCount}
          </p>
        </div>
        <div className="card-premium rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            With accounts
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">
            {data.investorsWithAccountsCount}
          </p>
        </div>
      </section>

      <InvestorsTable data={data} />
    </div>
  );
}
