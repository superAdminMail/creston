"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import type { PublicInvestmentPlanViewModel } from "@/lib/service/publicInvestmentCatalog";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";
import { useState } from "react";

type InvestmentPlansSectionClientProps = {
  plans: PublicInvestmentPlanViewModel[];
  siteName: string;
};

export function InvestmentPlansSectionClient({
  plans,
  siteName,
}: InvestmentPlansSectionClientProps) {
  const [api, setApi] = useState<CarouselApi>();

  return (
    <SectionShell id="investment-plans" className="py-20 sm:py-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading
          eyebrow="Plans And Tier Catalog"
          title="Choose Your Investment Plan"
          description="We offer a wide range of investment plans to fit your needs and goals. From short-term to long-term, we have the perfect plan for you."
        />
        <Link
          href="/investment-plans"
          className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white transition hover:border-blue-300/30 hover:bg-blue-500/10"
        >
          View all plans
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="mt-12 rounded-[2rem] border border-white/10 bg-[#0b1120]/90 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <h3 className="text-xl font-semibold text-white">
            No investment plans are available right now
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            We are preparing the next set of {siteName} plans. Please check back
            shortly.
          </p>
        </div>
      ) : (
        <>
          <div className="group relative mt-12">
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: plans.length > 1,
              }}
            >
              <CarouselContent className="-ml-3">
                {plans.map((plan) => (
                  <CarouselItem
                    key={plan.id}
                    className="pl-3 md:basis-1/2 xl:basis-1/3"
                  >
                    <article className="h-full rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,17,37,0.98))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-blue-300/20">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-200">
                        <span className="rounded-full border border-blue-300/20 bg-blue-500/10 px-2.5 py-1 text-blue-100">
                          {plan.investment.typeLabel}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1">
                          {plan.investmentModelLabel}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1">
                          {plan.periodLabel}
                        </span>
                      </div>

                      <h3 className="mt-5 text-xl font-semibold text-white">
                        {plan.name}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {plan.description ||
                          `${plan.name} offers a structured ${plan.durationLabel.toLowerCase()} opportunity under ${plan.investment.name}.`}
                      </p>

                      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            Duration
                          </dt>
                          <dd className="mt-2 font-medium text-white">
                            {plan.durationLabel}
                          </dd>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            ROI range
                          </dt>
                          <dd className="mt-2 font-medium text-white">
                            {plan.roiRangeLabel ?? "Varies by tier"}
                          </dd>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            Starting from
                          </dt>
                          <dd className="mt-2 font-medium text-white">
                            {plan.startingAmountLabel ??
                              `Quoted in ${plan.currency}`}
                          </dd>
                        </div>
                        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                          <dt className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                            Tier coverage
                          </dt>
                          <dd className="mt-2 font-medium text-white">
                            {plan.tiersCountLabel}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-6 flex items-center justify-between gap-4">
                        <p className="text-sm text-slate-400">
                          {plan.investment.name}
                        </p>
                        <Link
                          href={`/investment-plans/${plan.slug}`}
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-100 transition hover:text-white"
                        >
                          View plan
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {plans.length > 1 ? (
              <>
                <button
                  onClick={() => api?.scrollPrev()}
                  className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0b1120]/90 text-white/80 shadow-[0_16px_40px_rgba(2,6,23,0.32)] transition hover:bg-[#111b31] hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Previous plan"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  onClick={() => api?.scrollNext()}
                  className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0b1120]/90 text-white/80 shadow-[0_16px_40px_rgba(2,6,23,0.32)] transition hover:bg-[#111b31] hover:text-white lg:opacity-0 lg:group-hover:opacity-100"
                  aria-label="Next plan"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Tier coverage is based on the number of tiers in the plan.
          </p>
        </>
      )}
    </SectionShell>
  );
}
