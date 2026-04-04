import Link from "next/link";

import { getPublicInvestmentPlans } from "@/actions/investment-plan/getPublicInvestmentPlans";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Investment Plans",
    description:
      "Explore Havenstone investment plans built for long-term wealth growth, retirement preparation, and financial confidence.",
    keywords: ["investment plans", "retirement investing", "wealth planning"],
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/investment-plans",
  });
}

export default async function InvestmentPlansPage() {
  const plans = await getPublicInvestmentPlans();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur xl:px-10 xl:py-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
            Havenstone plans
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Investment plans built for disciplined long-term growth
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Review active Havenstone plans across structured savings, retirement
            preparation, and long-term capital growth strategies.
          </p>
        </div>
      </section>

      {plans.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 px-6 py-12 text-center shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
          <h2 className="text-2xl font-semibold text-white">
            No investment plans are available right now
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            We are preparing the next set of Havenstone investment plans. Please
            check back shortly.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                    <span className="rounded-full border border-white/10 px-2.5 py-1">
                      {plan.categoryLabel}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {plan.investment.name} • {plan.investment.typeLabel}
                  </p>
                </div>
                {plan.investment.iconUrl ? (
                  <div
                    aria-hidden="true"
                    className="h-12 w-12 rounded-2xl border border-white/10 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${plan.investment.iconUrl})`,
                    }}
                  />
                ) : null}
              </div>

              <p className="mt-5 flex-1 text-sm leading-7 text-slate-300">
                {plan.description ||
                  `${plan.name} offers a structured ${plan.periodLabel.toLowerCase()} approach for investors seeking disciplined capital growth on Havenstone.`}
              </p>

              <dl className="mt-6 grid gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Tier options
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {plan.tiersCountLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Available range
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {plan.tierRangeLabel ?? `Quoted in ${plan.currency}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Period
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {plan.periodLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Currency
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {plan.currency}
                  </dd>
                </div>
              </dl>

              <div className="mt-6">
                <Link
                  href={`/investment-plans/${plan.slug}`}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 text-sm font-medium text-blue-100 transition-colors duration-200 hover:border-blue-300/30 hover:bg-blue-500/15"
                >
                  View investment plan
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
