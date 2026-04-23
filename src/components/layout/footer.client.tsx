"use client";

import Image from "next/image";
import Link from "next/link";
import { Building2, Mail, MapPin, Phone, PhoneIcon } from "lucide-react";
import { formatSitePhoneNumber } from "@/lib/formatters/sitePhone";
import { getTelHrefPhoneNumber } from "@/lib/formatters/sitePhone";

type FooterGroup = {
  title: string;
  links: Array<{ href: string; label: string }>;
};

export type FooterClientProps = {
  siteName: string;
  siteLogoUrl?: string | null;
  siteDescription: string;
  siteTagline: string;
  supportEmail: string | null;
  supportPhone: string | null;
  supportPhoneSecondary: string | null;
  siteAddress: string | null;
  siteCRN: string | null;
  siteFRN: string | null;
  footerLinkGroups: FooterGroup[];
  year: number;
};

function SiteMark({
  logoUrl,
  siteName,
}: {
  logoUrl?: string | null;
  siteName: string;
}) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-[1.35rem] border border-white/12 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.06))] shadow-[0_14px_40px_rgba(37,99,235,0.18)]">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`${siteName} logo`}
          width={36}
          height={36}
          className="rounded-2xl object-cover"
        />
      ) : (
        <span className="text-sm font-semibold text-white">
          {siteName.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

export function FooterClient({
  siteName,
  siteLogoUrl,
  siteDescription,
  siteTagline,
  supportEmail,
  supportPhone,
  supportPhoneSecondary,
  siteAddress,
  siteCRN,
  siteFRN,
  footerLinkGroups,
  year,
}: FooterClientProps) {
  const safeSupportEmail = supportEmail ?? "";
  const safeSupportPhone = supportPhone ?? "";
  const safeSupportPhoneSecondary = supportPhoneSecondary ?? "";
  const safeSiteAddress = siteAddress ?? "";
  const safeSiteCRN = siteCRN ?? "";
  const safeSiteFRN = siteFRN ?? "";
  const phoneEntries = [
    safeSupportPhone
      ? { label: "US", value: formatSitePhoneNumber(safeSupportPhone) }
      : null,
    safeSupportPhoneSecondary
      ? {
          label: "local",
          value: formatSitePhoneNumber(safeSupportPhoneSecondary),
        }
      : null,
  ].filter((entry): entry is { label: string; value: string } =>
    Boolean(entry?.value),
  );

  return (
    <footer className="relative mt-auto border-t border-white/8 bg-[linear-gradient(180deg,rgba(5,11,31,0.85),rgba(5,11,31,0.98))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.28),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <SiteMark logoUrl={siteLogoUrl} siteName={siteName} />
              <div>
                <p className="text-lg font-semibold text-white">{siteName}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  {siteTagline}
                </p>
              </div>
            </Link>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              {siteDescription}
            </p>

            <div className="mt-6 space-y-4 text-sm text-slate-400">
              <div className="space-y-4">
                <div>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-300" />
                    {safeSupportEmail}
                  </p>
                  {phoneEntries.length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {phoneEntries.map((entry) => (
                        <p key={entry.label} className="flex items-start gap-2">
                          <Phone className="mt-0.5 h-4 w-4 text-blue-300" />
                          <span className="flex flex-wrap gap-2">
                            <span className="uppercase tracking-[0.12em] text-slate-500">
                              {entry.label}
                            </span>
                            <span>{entry.value}</span>
                          </span>
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0">
                      <MapPin className="mt-0.5 h-4 w-4 text-blue-300 shrink-0" />
                    </span>
                    <span>{safeSiteAddress}</span>
                  </div>

                  <div className="flex items-start gap-2 leading-6">
                    <span className="shrink-0">
                      <Building2 className="h-4 w-4 text-blue-300 shrink-0" />
                    </span>
                    <span>
                      {siteName} is authorised and regulated by the FCA (FRN:{" "}
                      {safeSiteFRN}). Registered in England & Wales (Company No.{" "}
                      {safeSiteCRN})
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Link
                  href={safeSupportEmail ? `mailto:${safeSupportEmail}` : "#"}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
                >
                  <Mail className="h-4 w-4 text-white" />
                </Link>

                {phoneEntries.length > 0 ? (
                  <Link
                    href={getTelHrefPhoneNumber(phoneEntries[0].value)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
                  >
                    <PhoneIcon className="h-4 w-4 text-white" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {footerLinkGroups.map((group) => (
            <nav key={group.title}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-200">
                {group.title}
              </h2>

              <ul className="mt-5 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
          <p className="text-xs leading-6 text-slate-400">
            <span className="font-semibold text-slate-200">Disclaimer:</span>{" "}
            Returns and performance are based on historical data, actual results
            may differ. Please read our{" "}
            <Link href="/terms" className="underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>{" "}
            for more information.
          </p>
        </div>

        <div className="mt-10 pt-6">
          <div className="divider-premium" />

          <div className="flex flex-col gap-3 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>
              &copy; {year} {siteName}. All rights reserved.
            </p>

            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
