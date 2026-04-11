import Link from "next/link";
import { Building2, Mail, MapPin, Phone, PhoneIcon } from "lucide-react";

import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

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
        <img
          src={logoUrl}
          alt={`${siteName} logo`}
          className="h-9 w-9 rounded-2xl object-cover"
        />
      ) : (
        <span className="text-sm font-semibold text-white">
          {siteName.slice(0, 1).toUpperCase()}
        </span>
      )}
    </div>
  );
}

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
  const siteTagline = config?.siteTagline?.trim() || site.siteTagline;

  return (
    <footer className="relative mt-auto border-t border-white/8 bg-[linear-gradient(180deg,rgba(5,11,31,0.85),rgba(5,11,31,0.98))]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(96,165,250,0.28),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <SiteMark
                logoUrl={config?.siteLogoFileAsset?.url}
                siteName={site.siteName}
              />
              <div>
                <p className="text-lg font-semibold text-white">
                  {site.siteName}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  {siteTagline}
                </p>
              </div>
            </Link>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              {site.siteDescription}
            </p>

            <div className="mt-6 space-y-4 text-sm text-slate-400">
              <div className="space-y-4">
                <div>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-300" />
                    {supportEmail}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-300" />
                    {supportPhone}
                  </p>
                </div>

                <div>
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-blue-300" />
                    <span>
                      12 Financial District Avenue,
                      <br />
                      London, United Kingdom
                    </span>
                  </p>

                  <p className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-300" />
                    {site.siteName} LLC | Reg No: 14583927
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Link
                  href={`mailto:${supportEmail}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
                >
                  <Mail className="h-4 w-4 text-white" />
                </Link>

                <Link
                  href={`tel:${supportPhone.replace(/\s+/g, "")}`}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
                >
                  <PhoneIcon className="h-4 w-4 text-white" />
                </Link>
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
              &copy; {year} {site.siteName}. All rights reserved.
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
