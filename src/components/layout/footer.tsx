import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
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
        { href: "#why-havenstone", label: `Why ${site.siteName}` },
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
  const supportPhone = config?.supportPhone?.trim() || "+1 (000) 000-0000";
  const siteAddress =
    config?.siteAddress?.trim() || "123 Main St, Anytown, USA";
  const siteLLC = config?.siteLLC?.trim() || `${site.siteName} LLC`;
  const siteTagline = config?.siteTagline?.trim() || site.siteTagline;

  return (
    <FooterClient
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url}
      siteDescription={site.siteDescription}
      siteTagline={siteTagline}
      supportEmail={supportEmail}
      supportPhone={supportPhone}
      siteAddress={siteAddress}
      siteLLC={siteLLC}
      footerLinkGroups={footerLinkGroups}
      year={year}
    />
  );
}
