import { notFound } from "next/navigation";

import { getInvestmentAccountDetails } from "@/actions/investment-account/getInvestmentAccountDetails";
import { InvestmentAccountActivityCard } from "./_components/InvestmentAccountActivityCard";
import { InvestmentAccountDetailsHeader } from "./_components/InvestmentAccountDetailsHeader";
import { InvestmentAccountMetaCard } from "./_components/InvestmentAccountMetaCard";
import { InvestmentAccountSummaryCards } from "./_components/InvestmentAccountSummaryCards";
import { InvestmentPlanOverviewCard } from "./_components/InvestmentPlanOverviewCard";
import { InvestmentProductCard } from "./_components/InvestmentProductCard";

export default async function Page(
  props: PageProps<"/account/dashboard/user/investment-accounts/[investmentAccountId]">,
) {
  const { investmentAccountId } = await props.params;
  const account = await getInvestmentAccountDetails(investmentAccountId);

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
