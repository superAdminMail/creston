"use client";

import * as React from "react";
import {
  FileCheck2,
  Landmark,
  LineChart,
  UserRoundCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";

const steps = [
  {
    icon: Landmark,
    step: "01",
    title: "Select a plan",
    description:
      "Choose an investment plan based on your preferred duration, structure, and estimated return range.",
  },
  {
    icon: UserRoundCheck,
    step: "02",
    title: "Create your account",
    description:
      "Set up your Havenstone account to manage your investments and track all activity in one place.",
  },
  {
    icon: FileCheck2,
    step: "03",
    title: "Fund your investment",
    description:
      "Add funds to your selected plan and begin participation based on the defined structure.",
  },
  {
    icon: LineChart,
    step: "04",
    title: "Track estimated growth",
    description:
      "Monitor contributions, plan status, and estimated returns over time with clear visibility.",
  },
];

export function HowItWorksSection() {
  const [api, setApi] = React.useState<any>();

  return (
    <SectionShell id="how-it-works" className="py-20 sm:py-24">
      <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,17,37,0.98))] px-6 py-10 shadow-[0_28px_70px_rgba(0,0,0,0.28)] sm:px-10">
        <SectionHeading
          eyebrow="How It Works"
          title="Onboarding simplified."
          description="Follow a simple process from funding to tracking without unnecessary complexity."
        />

        {/* DESKTOP TIMELINE */}
        <div className="relative mt-14 hidden lg:block">
          <div className="absolute left-0 top-8 h-[2px] w-full bg-white/10" />

          <div className="grid grid-cols-4 gap-6">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="relative">
                  <div className="absolute left-0 top-7 z-10 h-4 w-4 rounded-full bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)]" />

                  <div className="ml-6 rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-xs tracking-[0.2em] text-blue-200 uppercase">
                        Step {step.step}
                      </span>

                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.05))]">
                        <Icon className="h-5 w-5 text-blue-200" />
                      </div>
                    </div>

                    <h3 className="mt-6 text-lg font-semibold text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm text-slate-400 leading-7">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE CAROUSEL (CONSISTENT WITH PLANS + TESTIMONIALS) */}
        <div className="relative mt-10 lg:hidden group">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: false,
            }}
          >
            <CarouselContent>
              {steps.map((step) => {
                const Icon = step.icon;

                return (
                  <CarouselItem key={step.title} className="basis-[85%]">
                    <div className="px-1">
                      <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-6 shadow-sm transition">
                        <div className="flex items-center justify-between">
                          <span className="text-xs tracking-[0.2em] text-blue-200 uppercase">
                            Step {step.step}
                          </span>

                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.05))]">
                            <Icon className="h-5 w-5 text-blue-200" />
                          </div>
                        </div>

                        <h3 className="mt-6 text-lg font-semibold text-white">
                          {step.title}
                        </h3>

                        <p className="mt-3 text-sm text-slate-400 leading-7">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          {/* CHEVRONS */}
          <button
            onClick={() => api?.scrollPrev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronLeft className="h-7 w-7 text-white/70 hover:text-white" />
          </button>

          <button
            onClick={() => api?.scrollNext()}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition"
          >
            <ChevronRight className="h-7 w-7 text-white/70 hover:text-white" />
          </button>
        </div>
      </div>
    </SectionShell>
  );
}
