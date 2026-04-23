import { getSuperAdminInvestors } from "@/actions/super-admin/investors/getSuperAdminInvestors";

import { SuperAdminStatCard } from "../_components/SuperAdminStatCard";
import { InvestorsHeader } from "./_components/InvestorsHeader";
import { InvestorsTable } from "./_components/InvestorsTable";

export default async function SuperAdminInvestorsPage() {
  const data = await getSuperAdminInvestors();

  return (
    <div className="space-y-6 sm:space-y-8">
      <InvestorsHeader />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminStatCard
          label="Total investors"
          value={data.totalInvestorsCount}
          description="All investor profiles in the system."
        />
        <SuperAdminStatCard
          label="Verified investors"
          value={data.verifiedInvestorsCount}
          description="Profiles with verified identity state."
        />
        <SuperAdminStatCard
          label="Pending review"
          value={data.pendingReviewCount}
          description="Profiles awaiting manual review."
        />
        <SuperAdminStatCard
          label="With accounts"
          value={data.investorsWithAccountsCount}
          description="Investors linked to at least one account."
        />
      </section>

      <InvestorsTable data={data} />
    </div>
  );
}
