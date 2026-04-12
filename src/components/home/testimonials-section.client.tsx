"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";
import type { PublicTestimonyViewModel } from "@/lib/service/getPublicTestimonials";

type TestimonialsSectionClientProps = {
  siteName: string;
  testimonials: PublicTestimonyViewModel[];
};

export function TestimonialsSectionClient({
  siteName,
  testimonials,
}: TestimonialsSectionClientProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <SectionShell id="testimonials" className="py-20 sm:py-24">
      <SectionHeading
        eyebrow="Testimonials"
        title="Hear from our clients and investors"
        description={`${siteName} is designed to provide a structured and transparent investment experience.`}
        align="center"
      />

      <div className="relative mt-12 group">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: testimonials.length > 1,
          }}
        >
          <CarouselContent>
            {testimonials.map((testimony) => (
              <CarouselItem
                key={testimony.id}
                className="md:basis-1/2 lg:basis-1/3"
              >
                  <div className="group/item relative h-full px-2">
                    <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.28)] transition group-hover/item:-translate-y-1">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-blue-500/10">
                        {testimony.avatarUrl ? (
                          <Image
                            src={testimony.avatarUrl}
                            alt={testimony.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Quote className="h-5 w-5 text-blue-200" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white">
                          {testimony.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {testimony.role}
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 text-sm leading-7 text-slate-300">
                      "{testimony.quote}"
                    </p>

                    <div className="mt-8 border-t border-white/8 pt-5">
                      <p className="text-xs text-slate-500">{testimony.organization}</p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100"
        >
          <ChevronLeft className="h-8 w-8 text-white/70 hover:text-white" />
        </button>

        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100"
        >
          <ChevronRight className="h-8 w-8 text-white/70 hover:text-white" />
        </button>
      </div>
    </SectionShell>
  );
}
