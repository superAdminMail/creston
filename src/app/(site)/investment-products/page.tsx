import Link from "next/link";

import { getPublicInvestmentProducts } from "@/lib/service/publicInvestmentCatalog";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import type { InvestmentModel } from "@/generated/prisma";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Investment Products",
    description: `Explore ${site.siteName} investment products across fixed and market-led strategies, structured for long-term growth and financial confidence.`,
    keywords: ["investment products", "wealth platform", "portfolio options"],
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/investment-products",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

async function resolveModel(
  searchParams?: Promise<{
    model?: string | string[];
  }>,
) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const raw = Array.isArray(resolvedSearchParams?.model)
    ? resolvedSearchParams?.model[0]
    : resolvedSearchParams?.model;

  const normalized = raw?.trim().toUpperCase();

  if (normalized === "FIXED" || normalized === "MARKET") {
    return normalized as InvestmentModel;
  }

  return null;
}

export default async function InvestmentProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    model?: string | string[];
  }>;
}) {
  const site = await getSiteSeoConfig();
  const model = await resolveModel(searchParams);
  const products = await getPublicInvestmentProducts(model ?? undefined);

  const title =
    model === "FIXED"
      ? "Fixed investment products"
      : model === "MARKET"
        ? "Market investment products"
        : "Active investment products";

  const description =
    model === "FIXED"
      ? `Explore ${site.siteName} fixed investment products with defined structure, steady planning, and long-term discipline.`
      : model === "MARKET"
        ? `Explore ${site.siteName} market investment products with responsive valuation and growth tied to market movement.`
        : `Explore the active ${site.siteName} investment product catalog, compare plan coverage, and move into the right strategy for your timeline and target entry amount.`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur xl:px-10 xl:py-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
            {site.siteName} products
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {description}
          </p>
        </div>
      </section>

      {products.length === 0 ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-[#0b1120]/90 px-6 py-12 text-center shadow-[0_22px_60px_rgba(0,0,0,0.2)]">
          <h2 className="text-2xl font-semibold text-white">
            No investment products are available right now
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            We are preparing the next set of {site.siteName} offerings. Please
            check back shortly.
          </p>
        </section>
      ) : (
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              id={product.slug}
              className="flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_34%),#0b1120] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div>
                    {product.iconUrl ? (
                      <div
                        aria-hidden="true"
                        className="h-14 w-14 rounded-2xl border border-white/10 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${product.iconUrl})`,
                        }}
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10 text-sm font-semibold text-blue-200">
                        {getInitials(product.name)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-300">
                      <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-blue-100">
                        {product.typeLabel}
                      </span>
                      {product.modelLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-white/10 px-2.5 py-1"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {product.name}
                    </h2>
                  </div>
                </div>

                <span className="rounded-full hidden border border-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                  {product.planCountLabel}
                </span>
              </div>

              <p className="mt-5 flex-1 text-sm leading-7 text-slate-300">
                {product.overview}
              </p>

              <dl className="mt-6 grid gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Starting from
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {product.startingAmountLabel ?? "Quoted per active plan"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Typical timeline
                  </dt>
                  <dd className="mt-2 text-sm font-medium text-white">
                    {product.durationLabel ?? "Varies"}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/investment-plans"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  View active plans
                </Link>
                {product.featuredPlan ? (
                  <Link
                    href={`/investment-plans/${product.featuredPlan.slug}`}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 px-5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.04]"
                  >
                    Open featured plan
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
