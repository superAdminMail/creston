import React from "react";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Terms of Service",
    description:
      "Read Company's platform terms governing account access, investment workflows, and service use.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/terms",
  });
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

export default async function TermsPage() {
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "";
  const supportEmail = site?.supportEmail?.trim() || "support@example.com";
  const supportPhone = site?.supportPhone?.trim() || "+234 800 000 0000";
  const effectiveDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date());

  return (
    <main className="relative min-h-screen overflow-hidden bg-havenstone text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.08),transparent_35%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent" />
      </div>

      <section className="relative border-b border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:px-10">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            Terms of Use
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            Terms governing access to and use of {siteName}.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
            These Terms of Use explain the rules, responsibilities, and
            conditions that apply when you access or use {siteName}, including
            your account, transactions, communications, and platform features.
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
        <Section title="1. Acceptance of these terms">
          <p>
            By creating an account, accessing {siteName}, or using any part of
            the platform, you agree to be bound by these Terms of Use and any
            related policies that apply to your use of the services.
          </p>
          <p>
            If you do not agree with these terms, you should not access or use
            the platform.
          </p>
        </Section>

        <Section title="2. Eligibility and account registration">
          <p>
            You must provide accurate, complete, and current information when
            creating or maintaining an account on {siteName}.
          </p>
          <p>
            You are responsible for keeping your login credentials secure and
            for all activities carried out through your account, unless caused
            by our failure to maintain appropriate platform security.
          </p>
          <p>
            We may require identity verification or additional information
            before enabling access to certain features, transactions, or account
            capabilities.
          </p>
        </Section>

        <Section title="3. Verification, KYC, and compliance controls">
          <p>
            {siteName} supports customer verification and AML-aligned controls
            as part of its compliance-aware operating model. You may be asked to
            submit identification details, documents, or other information in
            order to access regulated or restricted parts of the platform.
          </p>
          <p>
            You agree to provide truthful, accurate, and non-misleading
            information during any verification or review process.
          </p>
          <p>
            We reserve the right to delay, restrict, suspend, or refuse access
            to specific platform features where verification is incomplete,
            inconsistent, under review, or where risk-related concerns arise.
          </p>
        </Section>

        <Section title="4. Platform services">
          <p>
            {siteName} provides digital platform functionality related to
            investment access, account management, payment-related flows, user
            support, and related financial technology features.
          </p>
          <p>
            Certain services, product offerings, or account actions may be
            changed, suspended, limited, or discontinued at any time where
            reasonably necessary for legal, operational, security, or product
            reasons.
          </p>
        </Section>

        <Section title="5. User responsibilities">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-2 pl-5 text-white/70">
            <li>
              use the platform for unlawful, fraudulent, or abusive activity;
            </li>
            <li>
              submit false, forged, manipulated, or misleading information;
            </li>
            <li>
              attempt unauthorized access to any account, system, or data;
            </li>
            <li>
              interfere with the security, integrity, or availability of the
              platform;
            </li>
            <li>
              use {siteName} in a way that violates applicable law or regulatory
              requirements.
            </li>
          </ul>
        </Section>

        <Section title="6. Payments, funding, and transaction handling">
          <p>
            {siteName} supports secure payment and transaction workflows for
            eligible account actions. All payment-related activity is subject to
            internal validation, security monitoring, and any applicable review
            steps.
          </p>
          <p>
            We may place a transaction on hold, request more information,
            require manual review, or decline a payment-related action where
            necessary for security, risk, reconciliation, or compliance reasons.
          </p>
          <p>
            You are responsible for ensuring that payment instructions and
            account details you submit are correct and authorized.
          </p>
        </Section>

        <Section title="7. Security and data protection">
          <p>
            We use security-focused operational and technical measures intended
            to protect account data, transaction information, and sensitive user
            records. This includes encrypted handling of sensitive data within
            relevant parts of our systems and appropriate internal access
            controls.
          </p>
          <p>
            While we take security seriously, no system can be guaranteed to be
            completely immune from every risk. You are also responsible for
            using secure passwords, protecting your device, and notifying us of
            any suspected unauthorized activity.
          </p>
        </Section>

        <Section title="8. Suspensions, restrictions, and account closure">
          <p>
            We may suspend, limit, review, or terminate access to your account
            or specific features where reasonably necessary, including where we
            suspect fraud, security threats, policy violations, abuse, failed
            verification, or legal non-compliance.
          </p>
          <p>
            Where appropriate, we may also retain necessary records after
            account closure for legal, audit, security, fraud-prevention, or
            compliance purposes.
          </p>
        </Section>

        <Section title="9. Intellectual property">
          <p>
            {siteName}, including its design, text, software components,
            branding, visuals, and platform content, is protected by applicable
            intellectual property laws. You may not copy, reproduce, distribute,
            modify, reverse engineer, or create derivative works from the
            platform except as permitted by law or with written authorization.
          </p>
        </Section>

        <Section title="10. Disclaimers">
          <p>
            {siteName} provides platform access and related services on an “as
            available” and “as applicable” basis. We do not guarantee that the
            platform will be uninterrupted, error-free, or suitable for every
            user purpose at all times.
          </p>
          <p>
            Nothing on the platform should be interpreted as a guarantee of
            outcome, return, or uninterrupted service performance.
          </p>
        </Section>

        <Section title="11. Limitation of liability">
          <p>
            To the maximum extent permitted by applicable law, {siteName} shall
            not be liable for indirect, incidental, special, consequential, or
            punitive losses, or for loss of profits, revenue, opportunity, or
            data arising from your use of or inability to use the platform.
          </p>
          <p>
            Nothing in these Terms excludes liability that cannot lawfully be
            excluded under applicable law.
          </p>
        </Section>

        <Section title="12. Changes to these terms">
          <p>
            We may update these Terms of Use from time to time to reflect legal,
            operational, security, or product changes. Where required, we will
            take reasonable steps to notify users of material updates.
          </p>
          <p>
            Continued use of {siteName} after updated terms become effective may
            constitute acceptance of the revised version.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            For questions about these Terms of Use, please contact us at{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-[#7bc2ef] underline underline-offset-4"
            >
              {supportEmail}
            </a>{" "}
            or {supportPhone}.
          </p>
        </Section>
      </div>
    </main>
  );
}
