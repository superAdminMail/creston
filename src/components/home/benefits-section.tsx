import {
  BriefcaseBusiness,
  Clock3,
  Eye,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionShell } from "@/components/home/section-shell";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";

const benefitGroups = [
  {
    title: "For individuals",
    highlight: "Simple and flexible investing",
    items: [
      {
        icon: TrendingUp,
        title: "Flexible participation",
        description:
          "Choose from multiple investment and savings plans based on your preferred timeline and structure.",
      },
      {
        icon: Shield,
        title: "Clear account visibility",
        description:
          "Track your funds, selected plans, and estimated growth in one organized view.",
      },
      {
        icon: Clock3,
        title: "Structured experience",
        description:
          "Follow a simple process from funding to tracking without unnecessary complexity.",
      },
    ],
  },
  {
    title: "For organizations",
    highlight: "Structured financial participation",
    items: [
      {
        icon: BriefcaseBusiness,
        title: "Organized contribution structure",
        description:
          "Define and manage contributions for multiple plans and accounts, ensuring transparency and reliability.",
      },
      {
        icon: Users,
        title: "Unified visibility",
        description:
          "Maintain oversight of accounts and participation across multiple users.",
      },
      {
        icon: Eye,
        title: "Consistent tracking",
        description:
          "Monitor activity, contributions, and plan engagement with structured reporting.",
      },
    ],
  },
];
export async function BenefitsSection() {
  const site = await getSiteSeoConfig();

  return (
    <SectionShell id="benefits" className="py-20 sm:py-24">
      <SectionHeading
        eyebrow="Benefits"
        title="Designed for individuals and organizations"
        description={`${site.siteName} provides a structured and flexible way to save and invest, with clear visibility across all plans and accounts.`}
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {benefitGroups.map((group, index) => {
          const isOrg = index === 0;

          return (
            <section
              key={group.title}
              className={`relative overflow-hidden rounded-[2.2rem] border p-7 shadow-[0_24px_60px_rgba(0,0,0,0.25)] ${
                isOrg
                  ? "border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.96))]"
                  : "border-white/8 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(8,17,37,0.98))]"
              }`}
            >
              {/* subtle glow */}
              {isOrg && (
                <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 bg-blue-500/10 blur-3xl" />
              )}

              {/* HEADER */}
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200">
                  {group.title}
                </p>

                <h3 className="mt-3 text-xl font-semibold text-white">
                  {group.highlight}
                </h3>
              </div>

              {/* PRIMARY ITEM */}
              {group.items[0] &&
                (() => {
                  const Icon = group.items[0].icon;

                  return (
                    <div className="mt-7 rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 px-3 py-3 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                          <Icon className="h-5 w-5 text-blue-200" />
                        </div>

                        <div>
                          <h4 className="text-base font-semibold text-white">
                            {group.items[0].title}
                          </h4>
                          <p className="mt-2 text-sm leading-7 text-slate-300">
                            {group.items[0].description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              {/* SECONDARY ITEMS */}
              <div className="mt-6 grid gap-4">
                {group.items.slice(1).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.6rem] border border-white/8 bg-white/[0.04] p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 px-3 py-3 items-center justify-center rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(37,99,235,0.2),rgba(59,130,246,0.05))]">
                          <Icon className="h-4 w-4 text-blue-200" />
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold text-white">
                            {item.title}
                          </h4>
                          <p className="mt-1 text-sm text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </SectionShell>
  );
}
