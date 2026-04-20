import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "About Company",
    description:
      "Learn more about the company and its mission, vision, and values. Discover how we prioritize the safety and trust of our users while providing innovative financial solutions.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/about",
  });
}

const values = [
  {
    title: "Trust by design",
    description:
      "We build with security, clarity, and accountability at the center of every user experience and internal workflow.",
  },
  {
    title: "Compliance-aware operations",
    description:
      "Our platform supports identity verification, AML-aligned onboarding controls, and responsible operational safeguards.",
  },
  {
    title: "Secure by default",
    description:
      "We apply strong data handling practices, encrypted system design, and secure payment workflows across key product flows.",
  },
  {
    title: "Long-term confidence",
    description:
      "We focus on a reliable investment and personal savings experience that feels clear, modern, and built for disciplined financial growth.",
  },
];

const highlights = [
  "Modern investment onboarding with compliance-aware account flows",
  "KYC and AML-aligned user verification support",
  "Encrypted handling of sensitive account and profile information",
  "Secure transaction and payment workflow architecture",
  "Operational review controls for sensitive actions and account activity",
  "Premium digital experience designed for clarity and confidence",
];

export default async function AboutPage() {
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-havenstone text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.08),transparent_35%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent" />
      </div>

      <section className="relative border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
              About {siteName}
            </span>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              A modern investment platform built around trust, security, and
              disciplined growth.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              {siteName} is designed to make digital investing feel more secure,
              more transparent, and more dependable. We combine a refined user
              experience with strong operational controls to support a platform
              that users can trust with confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-6xl gap-6 px-6 py-14 sm:px-8 lg:grid-cols-4 lg:px-10">
        {values.map((value) => (
          <div
            key={value.title}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <h2 className="text-lg font-semibold">{value.title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {value.description}
            </p>
          </div>
        ))}
      </section>

      <section className="relative mx-auto grid max-w-6xl gap-8 px-6 py-6 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Who we are</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-white/70 sm:text-[15px]">
            <p>
              {siteName} is a fintech-focused investment platform created to
              help users access a more structured and confident investment
              journey. Our product direction is rooted in simplicity, robust
              infrastructure, and a serious approach to operational integrity.
            </p>
            <p>
              We believe financial platforms should not only look premium, but
              also demonstrate maturity in how they handle user identity,
              sensitive data, transactions, account activity, and platform
              oversight.
            </p>
            <p>
              That is why {siteName} is built with support for KYC processes,
              AML-aware controls, secure payment handling, and careful treatment
              of important account data using encryption-aligned system design
              principles.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#3c9ee0]/20 bg-[#3c9ee0]/10 p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            What users can expect
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-white/80">
            {highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#3c9ee0]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight">
            Our operating philosophy
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                Clarity
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                We aim to present investment journeys, account activity, and
                user actions in a way that is intuitive and transparent.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                Security
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Sensitive workflows are designed with layered protection,
                encrypted data handling practices, and restricted operational
                access where appropriate.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                Responsibility
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/70">
                We take a disciplined approach to account verification, platform
                safeguards, and review processes for higher-risk user and
                payment activity.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
