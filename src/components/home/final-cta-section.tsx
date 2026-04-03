import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SectionShell } from "@/components/home/section-shell";

export function FinalCtaSection() {
  return (
    <SectionShell id="final-cta" className="py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(8,17,37,0.98))] px-6 py-12 shadow-[0_28px_70px_rgba(0,0,0,0.28)] sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium tracking-[0.18em] text-blue-200 uppercase">
              Ready to get started?
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Get started with Havenstone
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-300 sm:text-lg">
              Havenstone delivers structured investment plans designed to feel
              secure, transparent, and dependable at every stage of growth. Get
              in touch to learn how we can help you and/or your organization
              offer financial support with confidence.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/get-started"
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="btn-secondary inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-medium"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
