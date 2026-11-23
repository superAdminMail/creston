import Link from "next/link";
import { ArrowLeft, PencilLine, ShieldCheck } from "lucide-react";

import { getCurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import { updateCurrentUserInvestorProfileAction } from "@/actions/profile/upsert-current-user-investor-profile";
import { InvestmentProfileForm } from "@/components/onboarding/investment-profile-form";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { DashboardSectionCard } from "../../../_components/DashboardSectionCard";

export default async function Page() {
  const [profile, site] = await Promise.all([
    getCurrentUserInvestmentProfileData(),
    getSiteConfigurationCached(),
  ]);

  const siteName = site?.siteName?.trim() || "Company";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="space-y-4">
        <Link
          href="/account/dashboard/user/investment-profile"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to profile overview
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-3xl dark:text-white">
                Update investment profile
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                <PencilLine className="size-3.5" />
                Profile update
              </span>
            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Keep your contact, personal and residential information accurate
              for secure servicing across your {siteName} account.
            </p>
          </div>
        </div>
      </header>

      <DashboardSectionCard className="overflow-hidden p-0">
        <div className="border-b border-border/60 bg-slate-50/70 px-5 py-5 sm:px-7 dark:bg-white/[0.025]">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
              <ShieldCheck className="size-5 text-sky-700 dark:text-sky-300" />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Investment profile information
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Review and update the information used for identity
                verification, account servicing and investment profile
                readiness.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <InvestmentProfileForm
            initialValues={profile.editDefaults}
            onSubmitAction={updateCurrentUserInvestorProfileAction}
            submitLabel="Save profile updates"
            pendingLabel="Saving profile..."
            successMessage="Profile updated successfully."
            compactFields
            tone="dashboard"
            redirectHref="/account/dashboard/user/investment-profile"
            siteName={siteName}
          />
        </div>
      </DashboardSectionCard>
    </div>
  );
}
