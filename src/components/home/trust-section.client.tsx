"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Quote, Star } from "lucide-react";
import type { PublicTestimonyViewModel } from "@/lib/service/getPublicTestimonials";

type TrustSectionClientProps = {
  siteName: string;
  testimonial: PublicTestimonyViewModel;
};

// const latestTrustpilotReview = {
//   rating: 5,
//   title: "Trustpilot reviews coming soon",
//   review:
//     "We're preparing to showcase feedback from our Trustpilot review page. Check back soon for the latest client reviews.",
//   name: "Havenstone",
//   date: "Trustpilot integration pending",
// };

const latestTrustpilotReview = {
  rating: 4,
  title: "A smooth and reassuring experience",
  review:
    "I've had a great experience with Creston Capital. The platform is user-friendly, provides a seamless transaction process, and a positive customer experience.",
  name: "Desiree Moore",
  date: "Recently posted",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "CC";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function TrustSectionClient({
  siteName,
  testimonial,
}: TrustSectionClientProps) {
  const clientName = testimonial.name.trim() || "Client";
  const initials = getInitials(clientName);

  const clientRole = [testimonial.role, testimonial.organization]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" · ");

  return (
    <section
      id="trust"
      aria-labelledby="trust-section-heading"
      className="relative isolate overflow-hidden bg-[#050B1F] py-20 text-white sm:py-24 lg:py-28"
    >
      {/* Background accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 -z-10 h-80 w-80 rounded-full bg-blue-600/[0.08] blur-[100px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-96 w-96 rounded-full bg-blue-500/[0.07] blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Section heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            Client experiences
          </span>

          <h2
            id="trust-section-heading"
            className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Trust built on <span className="text-blue-400">experience.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Discover the experiences clients share about {siteName} and how they
            pursue their financial goals.
          </p>
        </div>

        {/* Trust cards */}
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-7">
          {/* Featured public testimonial */}
          <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0B142B]/90 p-6 shadow-2xl shadow-black/10 transition-colors duration-300 hover:border-blue-400/25 sm:p-8 lg:col-span-3 lg:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-7 top-7 text-blue-400/[0.10] sm:right-9 sm:top-9"
            >
              <Quote className="h-20 w-20" strokeWidth={1.2} />
            </div>

            <div className="relative flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Featured Experience
              </span>
            </div>

            <div className="relative mt-9 flex flex-1 flex-col sm:mt-10">
              <Quote
                aria-hidden="true"
                className="mb-5 h-8 w-8 text-blue-400"
                strokeWidth={1.5}
              />

              <blockquote className="max-w-2xl text-xl font-medium leading-9 tracking-tight text-slate-100 sm:text-2xl sm:leading-10">
                “{testimonial.quote}”
              </blockquote>

              <div className="mt-9 flex items-center gap-4 border-t border-white/[0.08] pt-6">
                {testimonial.avatarUrl ? (
                  <Image
                    src={testimonial.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    sizes="48px"
                    className="h-12 w-12 shrink-0 rounded-full border border-blue-400/20 object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10 text-sm font-semibold text-blue-300"
                  >
                    {initials}
                  </div>
                )}

                <div className="min-w-0">
                  <p className="font-semibold text-white">{clientName}</p>

                  {clientRole && (
                    <p className="mt-1 text-sm text-slate-400">{clientRole}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/[0.08] pt-6">
              <Link
                href="/testimonials"
                className="group/link inline-flex min-h-11 items-center gap-3 rounded-lg text-sm font-semibold text-blue-300 transition-colors hover:text-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0B142B]"
              >
                Explore all testimonials
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1"
                />
              </Link>
            </div>
          </article>

          {/* Trustpilot placeholder */}
          <article className="flex flex-col rounded-3xl border border-white/[0.09] bg-[#0B142B]/90 p-6 transition-colors duration-300 hover:border-emerald-400/20 sm:p-8 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Latest review
              </span>

              <ArrowUpRight
                aria-hidden="true"
                className="h-5 w-5 text-slate-500"
              />
            </div>

            <div className="mt-7 flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-md bg-[#00B67A]"
              >
                <Star
                  className="h-5 w-5 fill-white text-white"
                  strokeWidth={1.5}
                />
              </div>

              <span className="text-xl font-semibold tracking-tight text-white">
                Trustpilot
              </span>
            </div>

            <div
              className="mt-6 flex items-center gap-1.5"
              aria-label={`${latestTrustpilotReview.rating} out of 5 stars`}
            >
              {Array.from(
                { length: latestTrustpilotReview.rating },
                (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#00B67A]"
                  >
                    <Star
                      className="h-4 w-4 fill-white text-white"
                      strokeWidth={1.5}
                    />
                  </span>
                ),
              )}
            </div>

            <div className="mt-6 flex-1">
              <h3 className="text-lg font-semibold leading-7 text-white">
                {latestTrustpilotReview.title}
              </h3>

              <blockquote className="mt-3 text-sm leading-7 text-slate-400">
                “{latestTrustpilotReview.review}”
              </blockquote>
            </div>

            <div className="mt-8 border-t border-white/[0.08] pt-5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200">
                    {latestTrustpilotReview.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {latestTrustpilotReview.date}
                  </p>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-300">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-emerald-400"
                  />
                  {latestTrustpilotReview.rating}.0 / 5
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
