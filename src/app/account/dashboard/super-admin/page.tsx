import Link from "next/link";
import { Layers, TrendingUp, ArrowRight } from "lucide-react";

import { getSuperAdminInvestments } from "@/actions/super-admin/investments/getSuperAdminInvestments";
import { getSuperAdminInvestmentPlans } from "@/actions/super-admin/investment-plans/getSuperAdminInvestmentPlans";

export default async function SuperAdminDashboardPage() {
  const [investmentsData, plansData] = await Promise.all([
    getSuperAdminInvestments(),
    getSuperAdminInvestmentPlans(),
  ]);

  const cards = [
    {
      title: "Investments",
      body: "Manage the top-level Havenstone investment catalog, activation states, sort order, and icon assets.",
      count: investmentsData.investments.length,
      href: "/account/dashboard/super-admin/investments",
      cta: "Open investments",
      icon: TrendingUp,
    },
    {
      title: "Investment Plans",
      body: "Control plan ranges, parent investment mapping, currencies, and live plan availability for investor orders.",
      count: plansData.plans.length,
      href: "/account/dashboard/super-admin/investment-plans",
      cta: "Open investment plans",
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Super Admin Control
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          Oversee Havenstone&apos;s investment catalog with secure controls for
          product visibility, plan structure, and operational lifecycle changes.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="card-premium rounded-[1.75rem] p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <Icon className="h-5 w-5 text-blue-300" />
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                  {card.count} item{card.count === 1 ? "" : "s"}
                </div>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {card.body}
              </p>

              <Link
                href={card.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-blue-200 transition hover:text-white"
              >
                {card.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
