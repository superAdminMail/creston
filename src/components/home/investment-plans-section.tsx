import { InvestmentPlansSectionClient } from "@/components/home/InvestmentPlansSectionClient";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getPublicInvestmentPlans } from "@/lib/service/publicInvestmentCatalog";

export async function InvestmentPlansSection() {
  const [plans, site] = await Promise.all([
    getPublicInvestmentPlans(),
    getSiteSeoConfig(),
  ]);

  return (
    <InvestmentPlansSectionClient plans={plans} siteName={site.siteName} />
  );
}
