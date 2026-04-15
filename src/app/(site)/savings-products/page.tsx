import Link from "next/link";

import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import { getPublicSavingsProducts } from "@/lib/service/publicModelCatalog";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Savings Products",
    description:
      `Explore ${site.siteName} savings products designed for balance growth, liquidity, and disciplined financial planning.`,
    keywords: ["savings products", "cash management", "balance growth"],
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/savings-products",
  });
}

export default async function SavingsProductsPage() {
  const site = await getSiteSeoConfig();
  const products = await getPublicSavingsProducts();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur xl:px-10 xl:py-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            {site.siteName} savings
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Savings products designed for disciplined balance growth
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Review active {site.siteName} savings products, compare interest and
            liquidity features, and move into the option that matches your cash
            flow needs.
          </p>
        </div>
      </section>

      {products.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 px-6 py-12 text-center shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
          <h2 className="text-2xl font-semibold text-white">
            No savings products are available right now
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            We are preparing the next set of {site.siteName} savings options.
            Please check back shortly.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              id={product.id}
              className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-300">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-emerald-100">
                      Savings Product
                    </span>
                    {product.interestRateLabel ? (
                      <span className="rounded-full border border-white/10 px-2.5 py-1">
                        {product.interestRateLabel} interest
                      </span>
                    ) : null}
                    {product.payoutFrequencyLabel ? (
                      <span className="rounded-full border border-white/10 px-2.5 py-1">
                        {product.payoutFrequencyLabel}
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {product.name}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {product.lockLabel} • {product.currency}
                  </p>
                </div>
              </div>

              <p className="mt-5 flex-1 text-sm leading-7 text-slate-300">
                {product.description ||
                  `${product.name} offers a structured approach to savings and capital preservation on ${site.siteName}.`}
              </p>

              <dl className="mt-6 grid gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Balance range
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {product.balanceRangeLabel ?? `Quoted in ${product.currency}`}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Interest
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {product.interestRateLabel ?? "Variable"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Access
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {product.lockLabel}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Features
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {product.featureLabels.join(" • ")}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex gap-3">
                <Link
                  href={`/account/dashboard/user/savings/new`}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 text-sm font-medium text-emerald-100 transition-colors duration-200 hover:border-emerald-300/30 hover:bg-emerald-500/15"
                >
                  Open savings account
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
