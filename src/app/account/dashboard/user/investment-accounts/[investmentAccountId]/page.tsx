import { notFound } from "next/navigation";

import { getInvestmentAccountDetails } from "@/actions/investment-account/getInvestmentAccountDetails";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

import { InvestmentAccountActivityCard } from "./_components/InvestmentAccountActivityCard";
import { InvestmentAccountDetailsHeader } from "./_components/InvestmentAccountDetailsHeader";
import { InvestmentAccountMetaCard } from "./_components/InvestmentAccountMetaCard";
import { InvestmentAccountSummaryCards } from "./_components/InvestmentAccountSummaryCards";
import { InvestmentPlanOverviewCard } from "./_components/InvestmentPlanOverviewCard";
import { InvestmentProductCard } from "./_components/InvestmentProductCard";

type PageProps = {
  params: Promise<{
    investmentAccountId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { investmentAccountId } = await params;

  const [account, site] = await Promise.all([
    getInvestmentAccountDetails(investmentAccountId),
    getSiteConfigurationCached(),
  ]);

  if (!account) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8">
      <InvestmentAccountDetailsHeader
        account={account}
        siteName={site?.siteName ?? ""}
      />

      <InvestmentAccountSummaryCards account={account} />

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 space-y-6">
          <InvestmentPlanOverviewCard account={account} />

          <InvestmentProductCard account={account} />
        </div>

        <aside className="min-w-0 space-y-6">
          <InvestmentAccountMetaCard account={account} />

          <InvestmentAccountActivityCard account={account} />
        </aside>
      </section>
    </div>
  );
}
