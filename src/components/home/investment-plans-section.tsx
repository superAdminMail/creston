"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";

const plans = [
  {
    name: "Core Growth Plan",
    duration: "90 days",
    roi: "8% - 12%",
    min: "$500",
    highlight: "Balanced entry for structured growth",
  },
  {
    name: "Advanced Plan",
    duration: "180 days",
    roi: "12% - 18%",
    min: "$2,000",
    highlight: "Extended participation with higher exposure",
  },
  {
    name: "Elite Plan",
    duration: "365 days",
    roi: "18% - 25%",
    min: "$10,000",
    highlight: "Long-term plan with higher estimated growth",
  },
];

export function InvestmentPlansSection() {
  const [api, setApi] = React.useState<any>();

  return (
    <SectionShell id="investment-plans" className="py-20 sm:py-24">
      <SectionHeading
        eyebrow="Plans and Tier Catalog"
        title="Choose a plan that fits your timeline"
        description="Select a plan based on your preferred duration, structure, and estimated return range."
      />

      <div className="relative mt-12 group">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent>
            {plans.map((plan) => (
              <CarouselItem
                key={plan.name}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <div className="px-2">
                  <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-6 shadow-lg transition hover:-translate-y-1">
                    <h3 className="text-lg font-semibold text-white">
                      {plan.name}
                    </h3>

                    <p className="mt-2 text-sm text-slate-400">
                      {plan.highlight}
                    </p>

                    <div className="mt-5 grid grid-cols-3 text-sm">
                      <div>
                        <p className="text-slate-500">Duration</p>
                        <p className="text-white">{plan.duration}</p>
                      </div>

                      <div>
                        <p className="text-slate-500">ROI</p>
                        <p className="text-white">{plan.roi}</p>
                      </div>

                      <div>
                        <p className="text-slate-500">Minimum</p>
                        <p className="text-white">{plan.min}</p>
                      </div>
                    </div>

                    <Link
                      href="/auth/get-started"
                      className="mt-6 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white"
                    >
                      Choose plan
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* CHEVRONS */}
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"
        >
          <ChevronLeft className="h-8 w-8 text-white/70 hover:text-white" />
        </button>

        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"
        >
          <ChevronRight className="h-8 w-8 text-white/70 hover:text-white" />
        </button>
      </div>

      {/* DISCLAIMER */}
      <p className="mt-6 text-xs text-slate-500 text-center">
        ROI estimates are subject to market conditions and can vary. Actual
        returns may differ.
      </p>
    </SectionShell>
  );
}
