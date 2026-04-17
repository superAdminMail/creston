export const dynamic = "force-dynamic";

import {
  getInvestmentOrderCreationOptions,
  type InvestmentOrderCreationOptionsData,
} from "@/actions/investment-order/getInvestmentOrderCreationOptions";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { CreateInvestmentOrderEmptyState } from "./_components/CreateInvestmentOrderEmptyState";
import { CreateInvestmentOrderHeader } from "./_components/CreateInvestmentOrderHeader";
import { CreateInvestmentOrderWizard } from "./_components/CreateInvestmentOrderWizard";

type NewInvestmentOrderPageProps = {
  searchParams?: Promise<{
    created?: string;
  }>;
};

function shouldRenderEmptyState(data: InvestmentOrderCreationOptionsData) {
  return (
    !data.hasInvestorProfile ||
    !data.canCreateInvestmentOrder ||
    data.totalActivePlans === 0
  );
}

export default async function NewInvestmentOrderPage({
  searchParams,
}: NewInvestmentOrderPageProps) {
  const data = await getInvestmentOrderCreationOptions();
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName ?? "";
  const params = searchParams ? await searchParams : undefined;
  const createdOrderId = params?.created ?? null;

  return (
    <div className="space-y-6">
      <CreateInvestmentOrderHeader siteName={siteName} />

      {shouldRenderEmptyState(data) ? (
        <CreateInvestmentOrderEmptyState
          hasInvestorProfile={data.hasInvestorProfile}
          canCreateInvestmentOrder={data.canCreateInvestmentOrder}
          kycStatus={data.kycStatus}
          siteName={siteName}
        />
      ) : (
        <CreateInvestmentOrderWizard
          options={data}
          createdOrderId={createdOrderId}
          siteName={siteName}
        />
      )}
    </div>
  );
}
