import { ComplianceStrip } from "@/components/layout/ComplianceStrip";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <div className="bg-site-shell flex min-h-screen flex-col text-foreground">
      <Navbar
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url ?? site.defaultOgImageUrl}
        siteTagline={site.siteTagline}
      />
      <main className="flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-full flex-1 flex-col overflow-x-hidden">
          {children}
        </div>
      </main>
      <ComplianceStrip />
      <Footer />
    </div>
  );
}
