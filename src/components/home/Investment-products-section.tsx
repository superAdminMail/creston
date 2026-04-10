"use client";

import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import {
  ArrowRight,
  Bitcoin,
  Building2,
  ChartNoAxesCombined,
  Landmark,
  TrendingUp,
} from "lucide-react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";
import { useState, useRef, useEffect } from "react";

const investments = [
  {
    name: "Crypto Investments",
    icon: Bitcoin,
    description:
      "Structured digital asset exposure with defined investment periods.",
  },
  {
    name: "Real Estate",
    icon: Building2,
    description:
      "Asset-backed opportunities designed for stability and long-term value.",
  },
  {
    name: "ETFs",
    icon: ChartNoAxesCombined,
    description: "Diversified portfolios for steady and balanced growth.",
  },
  {
    name: "Bonds",
    icon: Landmark,
    description: "Lower-risk options focused on preserving capital.",
  },
  {
    name: "Stocks",
    icon: TrendingUp,
    description: "Equity-based opportunities for long-term value growth.",
  },
];

export function InvestmentProductsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const autoplay = useRef(
    Autoplay({
      delay: 3500,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    }),
  );

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <SectionShell id="investment-products" className="py-20 sm:py-24">
      <SectionHeading
        eyebrow="Investment Products Catalog"
        title="Explore our wide range of investment products"
        description="Discover a diverse array of investment and saving options to suit your needs, from commodities to stocks, ETFs to bonds, and crypto for long-term growth."
      />

      {/* CAROUSEL */}
      <div className="relative mt-12">
        <Carousel
          setApi={setApi}
          plugins={[autoplay.current]}
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-2">
            {investments.map((item) => {
              const Icon = item.icon;

              return (
                <CarouselItem
                  key={item.name}
                  className="pl-2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="group relative h-full">
                    {/* glow */}
                    <div className="absolute inset-0 rounded-[2rem] bg-blue-500/10 opacity-0 blur-xl transition group-hover:opacity-100" />

                    <div className="relative h-full rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition duration-300 group-hover:-translate-y-1 group-hover:border-white/12">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.22),rgba(59,130,246,0.06))]">
                        <Icon className="h-5 w-5 text-blue-200" />
                      </div>

                      <h3 className="mt-5 text-lg font-semibold text-white">
                        {item.name}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {item.description}
                      </p>

                      <Link
                        href="#investment-plans"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-200 transition group-hover:text-white"
                      >
                        View plans
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* DOTS */}
        <div className="mt-6 flex justify-center gap-2">
          {investments.map((_, i) => (
            <button
              key={i}
              onClick={() => api?.scrollTo(i)}
              className={`h-2 w-2 rounded-full transition ${
                i === current
                  ? "bg-blue-400 w-5"
                  : "bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
