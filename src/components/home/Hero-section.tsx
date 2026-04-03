import Link from "next/link";
import { ArrowRight, Landmark, ShieldCheck, TrendingUp } from "lucide-react";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Built for trust",
    description:
      "Built for trust, protection, and long-term financial confidence.",
  },
  {
    icon: Landmark,
    title: "Focused on clarity",
    description:
      "A calm, transparent platform centered on sustainable financial progress.",
  },
  {
    icon: TrendingUp,
    title: "Periodic growth",
    description:
      "Clear progress tracking designed to help members feel confident about their financial growth journey.",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-180px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/12 blur-3xl" />
        <div className="absolute right-[-120px] top-24 h-[320px] w-[320px] rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[-120px] h-[300px] w-[300px] rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-16 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-[0.12em] text-blue-100 uppercase shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.75)]" />
            Financial Growth Platform
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
            Investment programs built for trust, clarity, and long-term
            confidence
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Havenstone delivers structured retirement and investment experiences
            designed to feel secure, transparent, and dependable at every stage
            of growth. With clear contribution visibility, a modern experience,
            and a focus on long-term financial confidence, Havenstone helps
            teams offer financial support with the level of trust and polish
            members expect from a modern financial platform.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/auth/get-started"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-[linear-gradient(135deg,#2563eb_0%,#3b82f6_55%,#60a5fa_100%)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(37,99,235,0.34)]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/8 hover:text-white"
            >
              See How It Works
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {trustPoints.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/8 bg-white/[0.04] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.22),rgba(59,130,246,0.08))]">
                    <Icon className="h-5 w-5 text-blue-300" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(96,165,250,0.06))] blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96)_0%,rgba(8,17,37,0.98)_100%)] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] sm:p-6">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Projected Investment Overview
                </p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  Based Investemnt orders over time
                </p>
              </div>

              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                Stable outlook
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-5">
              <p className="text-sm text-slate-400">Projected account value</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                    $18.4M
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    Based on long-term structured contributions
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-400/15 bg-blue-500/10 px-3 py-2 text-right">
                  <p className="text-xs uppercase tracking-[0.14em] text-blue-200/80">
                    Growth
                  </p>
                  <p className="mt-1 text-sm font-semibold text-blue-200">
                    +12.8%
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Portfolio progress</span>
                  <span>74%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-white/6">
                  <div className="h-2.5 w-[74%] rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_55%,#60a5fa_100%)] shadow-[0_0_18px_rgba(59,130,246,0.35)]" />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                <p className="text-sm text-slate-400">Employer contribution</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  $420,000
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Consistent support structured around long-term planning.
                </p>
              </div>

              <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-5">
                <p className="text-sm text-slate-400">Employee contribution</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">
                  $280,000
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Clear contribution visibility with a premium account
                  experience.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    Designed for trust and financial clarity
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Built for employers and workers who need a calm, structured,
                    and premium retirement platform experience.
                  </p>
                </div>

                <div className="hidden h-12 w-12 rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.18),rgba(59,130,246,0.08))] sm:block" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
