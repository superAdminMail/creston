import Link from "next/link";
import { notFound } from "next/navigation";

import { getPublicInvestmentPlanBySlug } from "@/actions/investment-plan/getPublicInvestmentPlans";
import { formatCurrency } from "@/lib/formatters/formatters";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import {
  resolveGenericPageSeo,
  resolveInvestmentPlanSeo,
} from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata(
  props: PageProps<"/investment-plans/[slug]">,
) {
  const { slug } = await props.params;
  const [site, plan] = await Promise.all([
    getSiteSeoConfig(),
    getPublicInvestmentPlanBySlug(slug),
  ]);

  if (!plan) {
    const seo = resolveGenericPageSeo(site, {
      title: "Investment Plan",
      description: site.siteDescription,
    });

    return buildSeoMetadata({
      site,
      ...seo,
      canonicalPath: `/investment-plans/${slug}`,
      noIndex: true,
      noFollow: true,
    });
  }

  const seo = resolveInvestmentPlanSeo(site, {
    name: plan.name,
    description: plan.description,
    seoTitle: plan.seoTitle,
    seoDescription: plan.seoDescription,
    seoImageUrl: plan.seoImageUrl,
    currency: plan.currency,
    period: plan.period,
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: `/investment-plans/${plan.slug}`,
  });
}

export default async function InvestmentPlanDetailsPage(
  props: PageProps<"/investment-plans/[slug]">,
) {
  const { slug } = await props.params;
  const plan = await getPublicInvestmentPlanBySlug(slug);

  if (!plan) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur xl:px-10 xl:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Link
              href="/investment-plans"
              className="inline-flex text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Back to investment plans
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
              <span className="rounded-full border border-white/10 px-2.5 py-1">
                {plan.investment.typeLabel}
              </span>
              <span className="rounded-full border border-white/10 px-2.5 py-1">
                {plan.periodLabel}
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {plan.name}
            </h1>
            <p className="text-sm leading-7 text-slate-300 sm:text-base">
              {plan.description ||
                `${plan.name} is a structured Havenstone plan available for investors seeking a disciplined ${plan.periodLabel.toLowerCase()} strategy.`}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[#0b1120]/90 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] lg:w-[22rem]">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Tier coverage
            </p>
            <div className="mt-3 text-2xl font-semibold text-white">
              {plan.tierRangeLabel ?? `Quoted in ${plan.currency}`}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Structured under {plan.investment.name} with a{" "}
              {plan.periodLabel.toLowerCase()} investment horizon.
            </p>
            <Link
              href="/auth/get-started"
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Get started with Havenstone
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
          <h2 className="text-xl font-semibold text-white">Plan overview</h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Investment family
              </dt>
              <dd className="mt-2 text-sm font-medium text-white">
                {plan.investment.name}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Investment type
              </dt>
              <dd className="mt-2 text-sm font-medium text-white">
                {plan.investment.typeLabel}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Period
              </dt>
              <dd className="mt-2 text-sm font-medium text-white">
                {plan.periodLabel}
              </dd>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Tier options
              </dt>
              <dd className="mt-2 text-sm font-medium text-white">
                {plan.tiersCountLabel}
              </dd>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                Available range
              </dt>
              <dd className="mt-2 text-sm font-medium text-white">
                {plan.tierRangeLabel ?? `Quoted in ${plan.currency}`}
              </dd>
            </div>
          </dl>
        </article>

        <aside className="space-y-6">
          <article className="rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
            <h2 className="text-xl font-semibold text-white">Tier options</h2>
            <div className="mt-5 space-y-3">
              {plan.tiers.map((tier) => (
                <div
                  key={tier.id}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {tier.levelLabel}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {tier.roiPercent.toFixed(2)}% ROI target
                      </p>
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      {formatCurrency(tier.minAmount, plan.currency)} -{" "}
                      {formatCurrency(tier.maxAmount, plan.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
            <h2 className="text-xl font-semibold text-white">
              Product details
            </h2>
            <div className="mt-5 flex items-start gap-4">
              {plan.investment.iconUrl ? (
                <div
                  aria-hidden="true"
                  className="h-14 w-14 rounded-2xl border border-white/10 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${plan.investment.iconUrl})`,
                  }}
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-sm font-semibold text-blue-200">
                  {plan.investment.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-white">
                  {plan.investment.name}
                </h3>
                <p className="text-sm leading-7 text-slate-300">
                  {plan.investment.description ||
                    `${plan.investment.name} is available on Havenstone for investors focused on a structured, long-term approach to financial stability.`}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
            <h2 className="text-xl font-semibold text-white">Next step</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Open your Havenstone account to review eligibility, complete your
              investment profile, and continue with a secure order flow.
            </p>
            <div className="mt-5 flex flex-col gap-3">
              <Link
                href="/auth/get-started"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Open an account
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 px-5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.04]"
              >
                Speak with Havenstone
              </Link>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
