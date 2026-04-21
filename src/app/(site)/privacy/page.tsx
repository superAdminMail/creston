import React from "react";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Privacy Policy",
    description:
      "Read Company's Privacy Policy to understand how we collect, use, and protect your personal information. Learn about our commitment to data security, user privacy, and compliance with relevant regulations as we provide a secure and trustworthy wealth management platform.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/privacy",
  });
}

function getEffectiveDate() {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date());
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-white/70 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export default async function PrivacyPage() {
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "";
  const supportEmail = site?.supportEmail?.trim() || "support@example.com";
  const supportPhone = site?.supportPhone?.trim() || "+234 800 000 0000";
  const supportPhoneSecondary = site?.supportPhoneSecondary?.trim() || "";
  const effectiveDate = getEffectiveDate();

  return (
    <main className="relative min-h-screen overflow-hidden bg-havenstone text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.08),transparent_35%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent" />
      </div>

      <section className="relative border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:px-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            Privacy Policy
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            How {siteName} collects, uses, stores, and protects personal data.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
            This Privacy Policy explains what information we collect, why we
            collect it, how we use it, and the steps we take to protect it when
            you use {siteName}.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
            <p>
              <span className="font-semibold text-white">Effective date:</span>{" "}
              {effectiveDate}
            </p>
          </div>
        </div>
      </section>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-6 px-6 py-12 sm:px-8 lg:px-10">
        <Section title="1. Information we collect">
          <p>
            We may collect personal and account-related information such as:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-white/70">
            <li>name, email address, phone number, and profile details;</li>
            <li>account registration and authentication information;</li>
            <li>
              identity and verification information submitted for KYC-related
              checks;
            </li>
            <li>transaction, payment, and account activity records;</li>
            <li>
              communications, support requests, and feedback you send to us;
            </li>
            <li>
              technical, device, usage, and security event data generated
              through platform access.
            </li>
          </ul>
        </Section>

        <Section title="2. How we use your information">
          <p>We may use your information to:</p>
          <ul className="list-disc space-y-2 pl-5 text-white/70">
            <li>create and manage your {siteName} account;</li>
            <li>
              enable platform features, account actions, and transaction
              workflows;
            </li>
            <li>
              support user verification and AML-aligned compliance controls;
            </li>
            <li>
              protect the platform against fraud, abuse, misuse, and
              unauthorized activity;
            </li>
            <li>
              communicate with you about account events, updates, and support
              matters;
            </li>
            <li>
              improve the reliability, usability, and security of our services;
            </li>
            <li>
              comply with legal, regulatory, audit, and operational obligations.
            </li>
          </ul>
        </Section>

        <Section title="3. Verification and compliance-related processing">
          <p>
            Because {siteName} supports compliance-aware financial workflows, we
            may process identity information, verification submissions,
            onboarding records, and related review data to help assess account
            eligibility, detect risk, and support AML-aligned controls.
          </p>
          <p>
            This may include reviewing submitted information, maintaining review
            outcomes, storing necessary records, and applying restrictions where
            verification is incomplete or under review.
          </p>
        </Section>

        <Section title="4. Payments and transaction information">
          <p>
            We process and store transaction-related information necessary to
            support secure payment flows, account funding, internal review,
            reconciliation, fraud prevention, customer support, and financial
            recordkeeping.
          </p>
          <p>
            We do not reference providers in this policy text, but payment and
            transaction data may be handled through secure systems and
            controlled workflows necessary for the operation of the platform.
          </p>
        </Section>

        <Section title="5. Data security and encryption">
          <p>
            We use security-focused technical and organizational measures
            designed to protect personal data from unauthorized access, misuse,
            loss, alteration, or disclosure.
          </p>
          <p>
            This includes encrypted handling of sensitive data in relevant
            systems, access limitation based on operational need, monitoring of
            security-sensitive events, and protective controls around important
            account and transaction workflows.
          </p>
        </Section>

        <Section title="6. Data retention">
          <p>
            We retain personal information only for as long as reasonably
            necessary for the purposes described in this policy, including
            account administration, support, fraud prevention, legal
            recordkeeping, dispute management, audit needs, and compliance
            obligations.
          </p>
          <p>
            Some records may be retained after account closure where required or
            permitted for security, legal, operational, or regulatory reasons.
          </p>
        </Section>

        <Section title="7. Sharing of information">
          <p>
            We do not sell your personal information. We may share information
            where necessary to operate {siteName}, protect users and the
            platform, comply with legal obligations, support secure transaction
            flows, enforce our policies, or respond to lawful requests.
          </p>
          <p>
            Information may also be disclosed in connection with audits,
            investigations, fraud prevention, dispute handling, legal claims, or
            business restructuring where applicable.
          </p>
        </Section>

        <Section title="8. Your choices and rights">
          <p>
            Depending on applicable law, you may have rights relating to your
            personal information, including rights to access, correct, update,
            restrict, or request deletion of certain data.
          </p>
          <p>
            Some requests may be limited where continued retention is necessary
            for security, fraud prevention, compliance, legal obligations, or
            legitimate operational purposes.
          </p>
        </Section>

        <Section title="9. Cookies, analytics, and technical data">
          <p>
            We may use cookies, session technologies, and technical logs to keep
            the platform functioning properly, improve performance, protect user
            sessions, understand usage patterns, and maintain platform security.
          </p>
          <p>
            These technologies help us support a safer and more reliable user
            experience.
          </p>
        </Section>

        <Section title="10. Children’s privacy">
          <p>
            {siteName} is not intended for use by individuals who are not
            legally eligible to use the services under applicable law. We do not
            knowingly collect personal information from individuals where such
            collection is not legally permitted.
          </p>
        </Section>

        <Section title="11. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time to reflect legal
            requirements, product changes, security improvements, or operational
            updates. Material changes may be communicated through appropriate
            channels where required.
          </p>
        </Section>

        <Section title="12. Contact us">
          <p>
            If you have questions about this Privacy Policy or our privacy
            practices, contact us at{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-[#7bc2ef] underline underline-offset-4"
            >
              {supportEmail}
            </a>{" "}
            or {supportPhone}
            {supportPhoneSecondary ? ` / ${supportPhoneSecondary}` : ""}.
          </p>
        </Section>
      </div>
    </main>
  );
}
