import { Landmark, ShieldCheck, Sparkles, WalletCards } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Built around trust",
    description:
      "Secure investment structures with clear account ownership and long-term reliability at every level.",
  },
  {
    icon: Landmark,
    title: "Clear structure",
    description:
      "Plans, accounts, and savings are clear and transparent, ensuring members can make informed decisions with confidence.",
  },
  {
    icon: WalletCards,
    title: "Financial growth, simplified",
    description:
      "Track progress with consistent reporting, and enjoy the peace of mind that comes with a structured financial plan.",
  },
  {
    icon: Sparkles,
    title: "A modern experience",
    description:
      "Clean, premium interfaces designed to reflect the seriousness of long-term financial planning.",
  },
];

export async function WhySection() {
  const site = await getSiteSeoConfig();

  return (
    <SectionShell id="why-havenstone" className="py-20 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        {/* LEFT */}
        <SectionHeading
          eyebrow={`Why ${site.siteName}`}
          title="Designed for a new era of investing"
          description={`${site.siteName} is a modern financial platform that empowers individuals and organizations to make informed investments with confidence and ease. Our platform provides a secure and reliable way to save and grow your wealth, whether you're a seasoned investor or a first-time investor.`}
        />

        {/* RIGHT - LAYERED */}
        <div className="grid gap-5">
          {/* PRIMARY CARD */}
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.96))] p-7 shadow-[0_28px_70px_rgba(0,0,0,0.3)]">
            <div className="flex justify-between gap-4">
              <div className="flex h-11 w-11 px-3 py-3 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <ShieldCheck className="h-5 w-5 text-blue-200 shrink-0" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  Trust and security
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Secure investment structures with clear account ownership and
                  long-term reliability at every level. KYC and AML compliant.
                  Multi-factor authentication.
                </p>
              </div>
            </div>
          </div>

          {/* SECONDARY GRID */}
          <div className="grid gap-5 sm:grid-cols-2">
            {pillars.slice(1, 3).map((pillar) => {
              const Icon = pillar.icon;

              return (
                <article
                  key={pillar.title}
                  className="card-premium rounded-[1.7rem] p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.22),rgba(59,130,246,0.06))]">
                    <Icon className="h-5 w-5 text-blue-200" />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-white">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {pillar.description}
                  </p>
                </article>
              );
            })}
          </div>

          {/* TERTIARY */}
          <div className="rounded-[1.7rem] border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 px-3 py-3 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.22),rgba(59,130,246,0.06))]">
                <Sparkles className="h-5 w-5 text-blue-200 shrink-0" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-white">
                  Designed for a modern financial experience
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  Clean, premium interfaces designed to reflect the seriousness
                  of long-term financial planning.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
