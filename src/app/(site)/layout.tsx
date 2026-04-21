import { ComplianceStrip } from "@/components/layout/ComplianceStrip";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import SiteLayoutClient from "./layout-client";

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
      <SiteLayoutClient
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url ?? site.defaultOgImageUrl}
        siteTagline={site.siteTagline ?? ""}
        siteDescription={site.siteDescription ?? ""}
        supportEmail={config?.supportEmail ?? ""}
        supportPhone={config?.supportPhone ?? ""}
        supportPhoneSecondary={config?.supportPhoneSecondary ?? ""}
        siteAddress={site.siteAddress ?? ""}
        siteCRN={site.siteCRN ?? ""}
        siteFRN={site.siteFRN ?? ""}
        footerLinkGroups={[
          {
            title: "Platform",
            links: [
              { href: "/about", label: "About Us" },
              { href: "/investment-products", label: "Investment Products" },
              { href: "/investment-plans", label: "Investment Plans" },
            ],
          },
          {
            title: "Support",
            links: [
              { href: "/contact", label: "Contact" },
              { href: "/faq", label: "FAQ" },
              { href: "/privacy", label: "Privacy Policy" },
            ],
          },
        ]}
        year={new Date().getFullYear()}
      >
        {children}
      </SiteLayoutClient>
      <ComplianceStrip />
    </div>
  );
}
