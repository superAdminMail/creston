"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";

const testimonials = [
  {
    quote:
      "Havenstone provides a clear and structured way to manage investments without unnecessary complexity.",
    name: "Amina Okafor",
    role: "Head of People Operations",
    organization: "Northfield Advisory Group",
  },
  {
    quote:
      "The platform makes it easier to track contributions and understand long-term positioning.",
    name: "Daniel Eze",
    role: "Finance Director",
    organization: "Granite Ridge Holdings",
  },
  {
    quote:
      "Everything feels organized and transparent, which is critical for financial decision-making.",
    name: "Chioma Bassey",
    role: "Program Lead",
    organization: "Meridian Workforce Trust",
  },
];

export function TestimonialsSection() {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <SectionShell id="testimonials" className="py-20 sm:py-24">
      <SectionHeading
        eyebrow="Testimonials"
        title="Hear from our clients and investors"
        description="Havenstone is designed to provide a structured and transparent investment experience."
        align="center"
      />

      <div className="relative mt-12 group">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent>
            {testimonials.map((t) => (
              <CarouselItem key={t.name} className="md:basis-1/2 lg:basis-1/3">
                <div className="group/item relative h-full px-2">
                  <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.28)] transition group-hover/item:-translate-y-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-blue-500/10">
                      <Quote className="h-5 w-5 text-blue-200" />
                    </div>

                    <p className="mt-6 text-sm text-slate-300 leading-7">
                      “{t.quote}”
                    </p>

                    <div className="mt-8 border-t border-white/8 pt-5">
                      <p className="text-sm font-semibold text-white">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-400">{t.role}</p>
                      <p className="text-xs text-slate-500">{t.organization}</p>
                    </div>
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
    </SectionShell>
  );
}
