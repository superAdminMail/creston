import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { SectionShell } from "@/components/home/section-shell";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

export async function FinalCtaSection() {
  const site = await getSiteSeoConfig();

  return (
    <SectionShell id="final-cta" className="py-20 sm:py-24">
      <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(8,17,37,0.98))] px-6 py-12 shadow-[0_30px_80px_rgba(0,0,0,0.32)] sm:px-10 lg:px-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-200">
              Get started
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              Get started with {site.siteName}
            </h2>

            <p className="mt-6 text-base leading-8 text-slate-300 sm:text-lg">
              {site.siteName} provides structured investment plans, clear
              progress tracking, and a stable environment for long-term growth
              for both organizations and individual investors.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                <ShieldCheck className="h-4 w-4 text-blue-300" />
                Secure
              </span>

              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                Easy to use
              </span>

              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                24/7 support
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#2563eb,#3b82f6,#60a5fa)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.35)] transition hover:-translate-y-0.5"
            >
              Start investing
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/8 hover:text-white"
            >
              Talk to our team
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
