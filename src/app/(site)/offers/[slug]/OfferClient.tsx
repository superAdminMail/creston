"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  getOfferDetails,
  getOfferDescription,
  getOfferHeroStats,
  getOfferPresentation,
} from "../_lib/getOfferPresentation";
import { getStatusText } from "../_lib/getStatusText";
import type { Offer } from "../_lib/types";

type OfferClientProps = {
  offer: Offer;
  siteName: string;
};

export default function OfferClient({ offer, siteName }: OfferClientProps) {
  const presentation = getOfferPresentation(offer);
  const statusText = getStatusText(offer);

  const heroStats = getOfferHeroStats(offer);
  const highlights = offer.highlights;
  const terms = offer.terms;
  const steps = offer.steps;
  const details = getOfferDetails(offer);
  const description = getOfferDescription(offer);

  const Icon = offer.rewardEnabled ? Sparkles : TrendingUp;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_65%_20%,hsl(var(--primary)/0.14),transparent_45%)]" />

        <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-24 lg:pt-10">
          <Link
            href="/offers"
            className="group inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
            Back to opportunities
          </Link>

          <div className="mt-12 grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  <Icon className="size-3.5 text-primary" />
                  {presentation.eyebrow}
                </span>

                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="size-1.5 rounded-full bg-current" />
                  {statusText}
                </span>
              </div>

              <h1 className="mt-7 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {offer.title}
              </h1>

              <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                {offer.subject || description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/get-started"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
                >
                  {presentation.cta}
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  href="#details"
                  className="inline-flex items-center justify-center rounded-xl border bg-background px-6 py-3.5 text-sm font-medium shadow-sm transition hover:bg-muted"
                >
                  View offer details
                </Link>
              </div>

              <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-primary" />
                <span>Review all applicable terms before proceeding.</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-[2rem] border bg-card shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,hsl(var(--primary)/0.16),transparent_40%)]" />

                <div className="relative p-7 sm:p-9">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {siteName}
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {presentation.category} overview
                      </p>
                    </div>

                    <div className="flex size-10 items-center justify-center rounded-xl border bg-background/70">
                      <Icon className="size-4 text-primary" />
                    </div>
                  </div>

                  <div className="mt-12">
                    <p className="text-sm text-muted-foreground">
                      {presentation.heroLabel}
                    </p>

                    <p className="mt-2 text-4xl font-semibold tracking-tight">
                      {presentation.heroTitle}
                    </p>

                    <div className="mt-3 h-px bg-border" />

                    <div className="mt-7 space-y-5">
                      {heroStats.map((stat) => (
                        <div
                          key={stat.label}
                          className="flex items-center justify-between gap-4"
                        >
                          <span className="text-sm text-muted-foreground">
                            {stat.label}
                          </span>

                          <span className="text-right text-sm font-medium">
                            {stat.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 rounded-2xl border bg-background/60 p-5 backdrop-blur">
                    <div className="flex gap-3">
                      <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />

                      <div>
                        <p className="text-sm font-medium">Information first</p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Review the opportunity, understand the applicable
                          terms, and decide whether it is right for you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {highlights.length > 0 && (
        <section className="border-b bg-muted/20">
          <div className="mx-auto grid max-w-7xl gap-px px-6 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
            {highlights.map((highlight, index) => (
              <div
                key={`${highlight.title}-${index}`}
                className="flex items-start gap-3 border-b py-6 last:border-b-0 md:border-b-0 md:px-5 md:first:pl-0 md:last:pr-0"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
                  <Check className="size-4 text-primary" />
                </div>

                <div>
                  <p className="text-sm font-medium">{highlight.title}</p>

                  {highlight.description && (
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {highlight.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section
        id="details"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16 sm:px-8 lg:px-10 lg:py-24"
      >
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <div>
            <p className="text-sm font-medium text-primary">
              Opportunity details
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to know.
            </h2>

            <p className="mt-5 leading-7 text-muted-foreground">
              We believe important financial decisions should be made with clear
              information. Review the key details of this opportunity before
              deciding whether to proceed.
            </p>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border bg-muted/30 p-5">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-medium">Transparency matters</p>

                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Terms, availability, and eligibility requirements may apply.
                  Always review the applicable documentation before proceeding.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border bg-card">
            <div className="divide-y">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center justify-between gap-6 px-6 py-5 sm:px-8"
                >
                  <span className="text-sm text-muted-foreground">
                    {detail.label}
                  </span>

                  <span className="text-right text-sm font-medium">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t bg-muted/30 px-6 py-6 sm:px-8">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 text-primary" />

                <div>
                  <p className="text-sm font-medium">Offer availability</p>

                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    This opportunity is currently available. Availability,
                    eligibility, and applicable terms may change without notice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/20">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">About this offer</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Designed around clarity.
            </h2>

            <div className="mt-7 whitespace-pre-line text-base leading-7 text-muted-foreground">
              {description}
            </div>
          </div>
        </div>
      </section>

      {terms.length > 0 && (
        <section className="border-y bg-muted/20">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-primary">
                Terms & conditions
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Important information.
              </h2>

              <p className="mt-4 leading-7 text-muted-foreground">
                Please review the applicable terms before proceeding with this
                opportunity.
              </p>
            </div>

            <div className="mt-10 max-w-4xl divide-y overflow-hidden rounded-3xl border bg-card">
              {terms.map((term, index) => (
                <div key={`${term.title}-${index}`} className="p-6 sm:p-8">
                  <h3 className="text-base font-semibold">{term.title}</h3>

                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                    {term.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {steps.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">How it works</p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              From opportunity to action.
            </h2>

            <p className="mt-4 leading-7 text-muted-foreground">
              Getting started with {siteName} is designed to be straightforward.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-3xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-sm font-semibold text-primary">
                  {step.number}
                </span>

                <h3 className="mt-8 text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="relative overflow-hidden rounded-[2rem] border bg-card px-7 py-12 shadow-sm sm:px-12 lg:px-16 lg:py-16">
            <div className="absolute -right-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <Clock3 className="size-4" />
                  {statusText}
                </div>

                <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Ready to explore this opportunity?
                </h2>

                <p className="mt-4 leading-7 text-muted-foreground">
                  Create your {siteName} account to continue and explore the
                  available options.
                </p>
              </div>

              <Link
                href="/auth/get-started"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                {presentation.cta}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
