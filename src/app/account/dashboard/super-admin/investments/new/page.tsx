import { createInvestment } from "@/actions/super-admin/investments/createInvestment";
import { getSuperAdminInvestments } from "@/actions/super-admin/investments/getSuperAdminInvestments";
import { InvestmentForm } from "../_components/InvestmentForm";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export default async function NewInvestmentPage() {
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";
  const data = await getSuperAdminInvestments();

  return (
    <InvestmentForm
      title="New investment product"
      description={`Add a new ${siteName} investment product with a clean catalog identity, activation state, and icon mapping.`}
      submitLabel="Create"
      cancelHref="/account/dashboard/super-admin/investments"
      defaultValues={{
        name: "",
        slug: "",
        description: "",
        symbol: "",
        type: data.filterOptions.types[0]?.value ?? "CRYPTO",
        status: data.filterOptions.statuses[0]?.value ?? "DRAFT",
        iconFileAssetId: "",
        sortOrder: "0",
        isActive: true,
      }}
      filterOptions={data.filterOptions}
      iconFileOptions={data.iconFileOptions}
      formAction={createInvestment}
    />
  );
}
