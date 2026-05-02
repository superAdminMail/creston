import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { formatSitePhoneNumber } from "@/lib/formatters/sitePhone";
import { FooterClient } from "./footer.client";

export async function Footer() {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);
  const year = new Date().getFullYear();

  const footerLinkGroups = [
    {
      title: "Company",
      links: [
      { href: "#why-platform", label: `Why ${site.siteName}` },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ],
    },
    {
      title: "Platform",
      links: [
        { href: "#how-it-works", label: "How It Works" },
        { href: "#investment-products", label: "Investment Products" },
        { href: "#investment-plans", label: "Investment Plans" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/compliance", label: "Compliance" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "#faq", label: "FAQ" },
        { href: "/contact", label: "Help Center" },
      ],
    },
  ];

  const supportEmail = config?.supportEmail?.trim() || "support@example.com";
  const supportPhone =
    formatSitePhoneNumber(config?.supportPhone) || "+1 (000) 000-0000";
  const supportPhoneSecondary =
    formatSitePhoneNumber(config?.supportPhoneSecondary) || "";
  const siteAddress =
    config?.siteAddress?.trim() || "123 Main St, Anytown, USA";
  const siteCRN = config?.siteCRN?.trim() || "";
  const siteFRN = config?.siteFRN?.trim() || "";
  const siteTagline = config?.siteTagline?.trim() || site.siteTagline;

  return (
    <FooterClient
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url}
      siteDescription={site.siteDescription}
      siteTagline={siteTagline}
      supportEmail={supportEmail}
      supportPhone={supportPhone}
      supportPhoneSecondary={supportPhoneSecondary}
      siteAddress={siteAddress}
      siteCRN={siteCRN}
      siteFRN={siteFRN}
      footerLinkGroups={footerLinkGroups}
      year={year}
    />
  );
}
