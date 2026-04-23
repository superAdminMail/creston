import { getSuperAdminInvestmentById } from "@/actions/super-admin/investments/getSuperAdminInvestmentById";
import { getSuperAdminInvestments } from "@/actions/super-admin/investments/getSuperAdminInvestments";
import { updateInvestment } from "@/actions/super-admin/investments/updateInvestment";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { InvestmentForm } from "../../_components/InvestmentForm";

export default async function EditInvestmentPage(
  props: PageProps<"/account/dashboard/super-admin/investments/[investmentId]/edit">,
) {
  const { investmentId } = await props.params;
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";
  const [investment, investmentData] = await Promise.all([
    getSuperAdminInvestmentById(investmentId),
    getSuperAdminInvestments(),
  ]);

  return (
    <InvestmentForm
      title="Edit investment"
      description={`Update this ${siteName} investment product while preserving its catalog state, activation behavior, and linked plan flow.`}
      submitLabel="Save changes"
      cancelHref={`/account/dashboard/super-admin/investments/${investment.id}`}
      defaultValues={investment.formDefaults}
      filterOptions={investmentData.filterOptions}
      iconFileOptions={investment.iconFileOptions}
      formAction={updateInvestment.bind(null, investment.id)}
    />
  );
}
