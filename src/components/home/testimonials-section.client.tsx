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

function TestimonyCard({
  testimony,
}: {
  testimony: PublicTestimonyViewModel;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const quote = testimony.quote?.trim() ?? "";
  const words = React.useMemo(
    () => quote.split(/\s+/).filter(Boolean),
    [quote],
  );
  const shouldShowToggle = words.length > 16;
  const previewQuote = shouldShowToggle
    ? `${words.slice(0, 16).join(" ")}...`
    : quote;

  return (
    <div className="group/item relative h-full px-2">
      <div className="flex h-full min-h-[320px] flex-col rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,17,37,0.98))] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.28)] transition group-hover/item:-translate-y-1">
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
            <p className="text-sm font-semibold text-white">{testimony.name}</p>
            <p className="text-xs text-slate-400">{testimony.role}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-1 flex-col">
          <p className="text-sm leading-7 text-slate-300">
            {expanded ? quote : previewQuote}
          </p>

          {shouldShowToggle ? (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-4 inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-blue-200 transition hover:bg-white/[0.07] hover:text-white"
            >
              {expanded ? "See less" : "See more"}
            </button>
          ) : null}
        </div>

        <div className="mt-8 border-t border-white/8 pt-5">
          <p className="text-xs text-slate-500">{testimony.organization}</p>
        </div>
      </div>
    </div>
  );
}

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
                <TestimonyCard testimony={testimony} />
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
