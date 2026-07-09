import { ShieldCheck } from "lucide-react";

import SecuritySection from "@/components/settings/SecuritySection";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

export default async function Page() {
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.32em] text-sky-700 shadow-sm dark:text-sky-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Account settings
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl dark:text-white">
            Security & access
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
            Manage password access and account protection for {siteName} in
            one place.
          </p>
        </div>
      </section>

      <SecuritySection siteName={siteName} />
    </div>
  );
}
