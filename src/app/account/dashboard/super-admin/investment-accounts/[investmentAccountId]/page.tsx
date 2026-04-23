import { notFound } from "next/navigation";

import { getSuperAdminInvestmentAccountDetails } from "@/actions/super-admin/investment-accounts/getSuperAdminInvestmentAccountById";
import { InvestmentAccountActivityCard } from "@/app/account/dashboard/user/investment-accounts/[investmentAccountId]/_components/InvestmentAccountActivityCard";
import { InvestmentAccountMetaCard } from "@/app/account/dashboard/user/investment-accounts/[investmentAccountId]/_components/InvestmentAccountMetaCard";
import { InvestmentAccountSummaryCards } from "@/app/account/dashboard/user/investment-accounts/[investmentAccountId]/_components/InvestmentAccountSummaryCards";
import { InvestmentPlanOverviewCard } from "@/app/account/dashboard/user/investment-accounts/[investmentAccountId]/_components/InvestmentPlanOverviewCard";
import { InvestmentProductCard } from "@/app/account/dashboard/user/investment-accounts/[investmentAccountId]/_components/InvestmentProductCard";
import { InvestmentAccountDetailsHeader } from "./_components/InvestmentAccountDetailsHeader";

type PageProps = {
  params: Promise<{
    investmentAccountId: string;
  }>;
};

export default async function SuperAdminInvestmentAccountDetailsPage(
  props: PageProps,
) {
  const { investmentAccountId } = await props.params;
  const account = await getSuperAdminInvestmentAccountDetails(
    investmentAccountId,
  );

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <InvestmentAccountDetailsHeader account={account} />
      <InvestmentAccountSummaryCards account={account} />

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <InvestmentPlanOverviewCard account={account} />
          <InvestmentProductCard account={account} />
        </div>

        <div className="space-y-6">
          <InvestmentAccountMetaCard account={account} />
          <InvestmentAccountActivityCard account={account} />
        </div>
      </section>
    </div>
  );
}
