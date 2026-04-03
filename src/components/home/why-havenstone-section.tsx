import { Landmark, ShieldCheck, Sparkles, WalletCards } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Built around trust",
    description:
      "Havenstone is designed to feel secure and dependable, with clear information and a modern experience that prioritizes confidence at every stage of growth.",
  },
  {
    icon: Landmark,
    title: "Structured for clarity",
    description:
      "Investment programs are designed to be straightforward and transparent, with clear contribution visibility and no hidden fees or complex jargon.",
  },
  {
    icon: WalletCards,
    title: "Financial growth, simplified",
    description:
      "Havenstone delivers structured retirement and investment experiences that make it easy for potential investors to achieve their financial goals without feeling overwhelmed or uncertain.",
  },
  {
    icon: Sparkles,
    title: "A modern experience",
    description:
      "Havenstone offers a modern, user-friendly experience that combines the best of technology and financial expertise to help potential investors feel confident and empowered in their financial growth journey.",
  },
];

export function WhyHavenstoneSection() {
  return (
    <SectionShell id="why-havenstone" className="py-20 sm:py-24">
      <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <SectionHeading
          eyebrow="Why Havenstone"
          title="A better way to offer financial support"
          description="Havenstone is a financial growth platform built to help potential investors achieve their financial goals with investment programs that feel secure, transparent, and dependable at every stage of growth."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className="card-premium rounded-[1.75rem] p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.22),rgba(59,130,246,0.06))]">
                  <Icon className="h-5 w-5 text-blue-200" />
                </div>

                <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-white">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
