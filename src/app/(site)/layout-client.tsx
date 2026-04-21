"use client";

import { NavbarClient } from "@/components/layout/navbar.client";
import { FooterClient } from "@/components/layout/footer.client";

type FooterGroup = {
  title: string;
  links: Array<{ href: string; label: string }>;
};

export type SiteLayoutClientProps = {
  siteName: string;
  siteLogoUrl: string | null;
  siteTagline: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone: string;
  supportPhoneSecondary: string;
  siteAddress: string;
  siteCRN: string;
  siteFRN: string;
  footerLinkGroups: FooterGroup[];
  year: number;
  children: React.ReactNode;
};

export default function SiteLayoutClient({
  siteName,
  siteLogoUrl,
  siteTagline,
  siteDescription,
  supportEmail,
  supportPhone,
  supportPhoneSecondary,
  siteAddress,
  siteCRN,
  siteFRN,
  footerLinkGroups,
  year,
  children,
}: SiteLayoutClientProps) {
  return (
    <>
      <NavbarClient
        siteName={siteName}
        siteLogoUrl={siteLogoUrl}
        siteTagline={siteTagline}
      />

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>

      <FooterClient
        siteName={siteName}
        siteLogoUrl={siteLogoUrl}
        siteDescription={siteDescription}
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
    </>
  );
}
