"use client";

import { usePathname } from "next/navigation";

import { AppNoticeBanner } from "@/components/layout/AppNoticeBanner";
import { ComplianceStrip } from "@/components/layout/ComplianceStrip";
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
  maintenanceModeEnabled: boolean;
  maintenanceBypassed: boolean;
  disclaimerBannerEnabled: boolean;
  disclaimerBannerDismissalKey: string;
  initialDisclaimerBannerDismissed: boolean;
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
  maintenanceModeEnabled,
  maintenanceBypassed,
  disclaimerBannerEnabled,
  disclaimerBannerDismissalKey,
  initialDisclaimerBannerDismissed,
  footerLinkGroups,
  year,
  children,
}: SiteLayoutClientProps) {
  const pathname = usePathname();
  const showChrome =
    maintenanceBypassed || !(maintenanceModeEnabled && pathname === "/");

  return (
    <>
      <AppNoticeBanner
        key={disclaimerBannerDismissalKey}
        enabled={disclaimerBannerEnabled}
        dismissalKey={disclaimerBannerDismissalKey}
        initialDismissed={initialDisclaimerBannerDismissed}
      />

      {showChrome ? (
        <NavbarClient
          siteName={siteName}
          siteLogoUrl={siteLogoUrl}
          siteTagline={siteTagline}
        />
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col">{children}</main>

      {showChrome ? (
        <>
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
          <ComplianceStrip />
        </>
      ) : null}
    </>
  );
}
