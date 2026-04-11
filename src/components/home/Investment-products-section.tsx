import { InvestmentProductsSectionClient } from "@/components/home/InvestmentProductsSectionClient";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getPublicInvestmentProducts } from "@/lib/service/publicInvestmentCatalog";

export async function InvestmentProductsSection() {
  const [products, site] = await Promise.all([
    getPublicInvestmentProducts(),
    getSiteSeoConfig(),
  ]);

  return (
    <InvestmentProductsSectionClient
      products={products}
      siteName={site.siteName}
    />
  );
}
