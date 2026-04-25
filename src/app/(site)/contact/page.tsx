import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { formatSitePhoneNumber } from "@/lib/formatters/sitePhone";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

import { ContactForm } from "./_components/ContactForm";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Contact Us",
    description:
      "Get in touch with our team for support, account help, and general inquiries.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/contact",
  });
}

export default async function ContactPage() {
  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  const supportEmail = config?.supportEmail?.trim() || "support@example.com";
  const supportPhone =
    formatSitePhoneNumber(config?.supportPhone) || "+1 (000) 000-0000";
  const supportPhoneSecondary =
    formatSitePhoneNumber(config?.supportPhoneSecondary) || "";
  const officeLine = config?.siteAddress?.trim() || "123 Main St, Anytown, USA";
  const siteCRN = config?.siteCRN?.trim() || "";
  const availability = "24/7";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050B1F] px-4 py-16 md:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-20%] h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_40%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.4em] text-blue-300/80">
            Contact
          </p>
          <h1 className="text-3xl font-semibold text-white md:text-4xl">
            Get in touch with {site.siteName}
          </h1>
          <p className="mx-auto max-w-xl text-sm text-slate-400">
            Our team is here to assist you with your account, investments, and
            platform support.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">
              Contact Information
            </h2>

            <div className="mt-6 space-y-6 text-sm text-slate-300">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Email
                </p>
                <p className="mt-1 text-white">{supportEmail}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Phone
                </p>
                {supportPhone ? (
                  <p className="mt-1 text-slate-300 text-sm">{supportPhone}</p>
                ) : null}
                {supportPhoneSecondary ? (
                  <p className="mt-1 text-sm text-slate-300">
                    {supportPhoneSecondary}
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Office
                </p>
                <p className="mt-1 text-white">{officeLine}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Company No.
                </p>
                <p className="mt-1 text-white">{siteCRN}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Availability
                </p>
                <p className="mt-1 text-white">{availability}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white">
              Send us a message
            </h2>

            <ContactForm
              defaultEmail={config?.supportEmail ?? ""}
              defaultName={site.siteName}
            />
          </div>
        </div>

        <p className="text-center text-xs uppercase tracking-[0.3em] text-slate-500">
          Wealth • Stability • Security
        </p>
      </div>
    </div>
  );
}
