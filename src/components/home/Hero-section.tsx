import Link from "next/link";
import { ArrowRight, Landmark, ShieldCheck, TrendingUp } from "lucide-react";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getHeroSnapshot } from "@/lib/service/getHeroSnapshot";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Built for trust",
    description: "Secure, structured, and designed for reliability.",
  },
  {
    icon: Landmark,
    title: "Clear structure",
    description: "Plans, accounts, and savings are clear and transparent.",
  },
  {
    icon: TrendingUp,
    title: "Measured growth",
    description: "Track progress with consistent reporting.",
  },
];

export async function HeroSection() {
  const [site, snapshot] = await Promise.all([
    getSiteSeoConfig(),
    getHeroSnapshot(),
  ]);

  return (
    <section className="relative overflow-hidden">
      {/* BACKGROUND IMAGE */}
      <div className="absolute inset-0">
        <img
          src="https://3mnjvkl4rh.ufs.sh/f/obiqfDxUd1AJCNMr13ua5ZNoSK9Ykp8QCvdbjWPlnJwGA0Xf"
          alt="Background"
          className="h-full w-full object-cover scale-105 brightness-[0.7] contrast-[1.1]"
        />

        {/* PRIMARY DARK OVERLAY (lighter now) */}
        <div className="absolute inset-0 bg-[rgba(5,11,31,0.55)]" />

        {/* GRADIENT FADE (left → right readability) */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(5,11,31,0.9)_20%,rgba(5,11,31,0.65)_55%,rgba(5,11,31,0.3)_100%)]" />

        {/* BLUE ACCENT GLOW */}
        <div className="absolute inset-0">
          <div className="absolute left-1/3 top-[-120px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-[-120px] right-[-80px] h-[360px] w-[360px] rounded-full bg-blue-400/20 blur-3xl" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-18 sm:px-6 md:py-22 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:px-8 lg:py-22">
        {/* LEFT */}
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase text-blue-100">
            <span className="h-2 w-2 rounded-full bg-[#3c9ee0]" /> Investment &
            Savings Platform
          </div>

          <h1 className="text-3xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
            The future of investing, simplified.
          </h1>

          <p className="text-base text-slate-300 sm:text-lg">
            {site.siteDescription}
          </p>

          {/* CTA */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3.5 text-sm font-semibold text-white"
            >
              Start investing <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#investment-plans"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm text-white"
            >
              Explore plans
            </Link>
          </div>

          {/* TRUST */}
          <div className="grid gap-4 sm:grid-cols-3">
            {trustPoints.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <Icon className="h-5 w-5 text-blue-300" />
                  <p className="mt-3 text-sm font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL  */}
        <div className="relative mt-10 lg:mt-0">
          <div className="absolute inset-0 rounded-[2rem] bg-blue-500/10 blur-2xl" />

          <div className="relative rounded-[2rem] border border-white/10 bg-[rgba(15,23,42,0.9)] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
              <div>
                <p className="text-xs text-slate-400">Snapshot</p>
                <p className="text-sm text-white/80">
                  {snapshot.statusLabel} overview
                </p>
              </div>
              <span className="text-xs text-blue-300">
                {snapshot.statusLabel}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-sm text-slate-400">Total Capital Inflow</p>
              <p className="text-3xl font-semibold text-white/80">
                {snapshot.totalValueLabel}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3 text-xs text-white/80">
                Top: {snapshot.topLabel}
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-xs text-white/80">
                Plan: {snapshot.planLabel}
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-xs text-white/80">
                Duration: {snapshot.durationLabel}
              </div>
              <div className="rounded-xl bg-white/5 p-3 text-xs text-white/80">
                {snapshot.userCountLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
