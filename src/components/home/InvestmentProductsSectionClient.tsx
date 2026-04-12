"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { PublicInvestmentProductViewModel } from "@/lib/service/publicInvestmentCatalog";
import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";

import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/css";
import "swiper/css/pagination";

type InvestmentProductsSectionClientProps = {
  products: PublicInvestmentProductViewModel[];
  siteName: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function InvestmentProductsSectionClient({
  products,
  siteName,
}: InvestmentProductsSectionClientProps) {
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  const [current, setCurrent] = useState(0);

  return (
    <SectionShell id="investment-products" className="py-20 sm:py-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Investment Products Catalog"
          title="Explore our active investment products"
          description={`Browse the ${siteName} product catalog across fixed and market-led strategies, then move into the plans and tiers built under each investment family.`}
        />
        <Link
          href="/investment-products"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white transition hover:border-blue-300/30 hover:bg-blue-500/10"
        >
          View all products
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="mt-12 rounded-[2rem] border border-white/10 bg-[#0b1120]/90 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <h3 className="text-xl font-semibold text-white">
            No investment products are available right now
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            We are refreshing the catalog. Please check back shortly for active
            investment opportunities.
          </p>
        </div>
      ) : (
        <div className="relative mt-12">
          <Swiper
            onSwiper={setSwiper}
            onSlideChange={(instance) => setCurrent(instance.activeIndex)}
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={12}
            loop={products.length > 1}
            speed={650}
            autoplay={
              products.length > 1
                ? {
                    delay: 4200,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            breakpoints={{
              768: {
                slidesPerView: 2,
                spaceBetween: 12,
              },
              1280: {
                slidesPerView: 3,
                spaceBetween: 12,
              },
            }}
            className="w-full"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="h-auto">
                <article className="group relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,17,37,0.98))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-blue-300/20">
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent" />

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        {product.iconUrl ? (
                          <div
                            aria-hidden="true"
                            className="h-14 w-14 rounded-2xl border border-white/10 bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${product.iconUrl})`,
                            }}
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-300/20 bg-blue-500/10 text-sm font-semibold text-blue-100">
                            {getInitials(product.name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                            {product.typeLabel}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold text-white">
                            {product.name}
                          </h3>
                        </div>
                      </div>

                      <span className="rounded-full hidden border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-200">
                        {product.planCountLabel}
                      </span>
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-300">
                      {product.overview}
                    </p>

                    <dl className="mt-6 grid gap-3 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-3">
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Models
                        </dt>
                        <dd className="mt-2 text-sm font-medium text-white">
                          {product.modelLabels.join(", ")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Starting from
                        </dt>
                        <dd className="mt-2 text-sm font-medium text-white">
                          {product.startingAmountLabel ?? "Quoted per plan"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          Timeline
                        </dt>
                        <dd className="mt-2 text-sm font-medium text-white">
                          {product.durationLabel ?? "Varies"}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <div className="text-sm text-slate-400">
                        {product.featuredPlan ? (
                          <>Featured plan: {product.featuredPlan.name}</>
                        ) : (
                          <>Explore current plan availability</>
                        )}
                      </div>

                      <Link
                        href={`/investment-products#${product.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition group-hover:text-white"
                      >
                        Explore
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </article>
              </SwiperSlide>
            ))}
          </Swiper>

          {products.length > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-3">
              {products.map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => swiper?.slideToLoop(index)}
                  className={`h-2.5 rounded-full transition ${
                    index === current
                      ? "w-8 bg-blue-400"
                      : "w-2.5 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`View ${product.name}`}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex justify-end">
            <Link
              href="#investment-plans"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 transition hover:text-white"
            >
              Continue to plans
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </SectionShell>
  );
}
