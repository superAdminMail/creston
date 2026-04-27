import Link from "next/link";
import { ArrowLeft, Calculator, LineChart, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { formatCurrency } from "@/lib/formatters/formatters";
import { getAssetCheckerData } from "@/lib/services/asset-checker/getAssetCheckerData";
import { AssetChecker } from "@/components/investment/asset-checker";
import { redirect } from "next/navigation";

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="text-2xl font-semibold text-white">{value}</h3>
          <p className="text-xs leading-6 text-slate-500">{hint}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Icon className="h-5 w-5 text-[#8fd0ff]" />
        </div>
      </div>
    </div>
  );
}

export default async function AssetCheckerPage() {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const data = await getAssetCheckerData();

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/account/dashboard/user"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs font-medium text-blue-200">
              <Calculator className="h-3.5 w-3.5" />
              Asset tools
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Asset checker
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
                Compare live market quotes for active platform investments and
                preview fixed bond returns without exposing internal units or
                unsupported assets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:w-[34rem] xl:grid-cols-4">
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Market assets
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.stats.marketAssetsCount}
              </p>
            </div>

            <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-emerald-200/80">
                Fixed plans
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.stats.fixedPlansCount}
              </p>
            </div>

            <div className="rounded-3xl border border-sky-400/15 bg-sky-400/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-sky-200/80">
                Live quotes
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.stats.liveQuotesCount}
              </p>
            </div>

            <div className="rounded-3xl border border-amber-400/15 bg-amber-400/8 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-amber-200/80">
                Fixed tiers
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white">
                {data.stats.fixedTiersCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Platform assets only"
          value={String(data.stats.marketAssetsCount)}
          hint="Market checker options are sourced from active investment records with live symbols."
          icon={LineChart}
        />
        <StatCard
          title="Fixed return plans"
          value={String(data.stats.fixedPlansCount)}
          hint="Fixed calculator options are sourced from active plans and their tiers."
          icon={ShieldCheck}
        />
        <StatCard
          title="Currency context"
          value={formatCurrency(1000, "USD")}
          hint="All market previews stay in USD while fixed previews use the plan currency."
          icon={Calculator}
        />
      </section>

      <AssetChecker data={data} />
    </main>
  );
}
