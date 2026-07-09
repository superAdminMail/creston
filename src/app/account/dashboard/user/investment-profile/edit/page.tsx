import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";

import { getCurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import { updateCurrentUserInvestorProfileAction } from "@/actions/profile/upsert-current-user-investor-profile";
import { InvestmentProfileForm } from "@/components/onboarding/investment-profile-form";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { DashboardSectionCard } from "../../../_components/DashboardSectionCard";

export default async function Page() {
  const profile = await getCurrentUserInvestmentProfileData();
  const site = await getSiteConfigurationCached();
  const siteName = site?.siteName?.trim() || "Company";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/account/dashboard/user/investment-profile"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile overview
          </Link>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
            Update investment profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
            Keep your contact, address, and eligibility details current for
            secure servicing across your {siteName} account.
          </p>
        </div>

        <div className="inline-flex md:hidden items-center gap-2 rounded-full border border-sky-200/70 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/12 dark:text-sky-100">
          <PencilLine className="h-4 w-4 text-sky-700 dark:text-sky-100" />
          Profile update
        </div>
      </div>

      <DashboardSectionCard>
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
            Investment profile details
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Update the details used for verification, account servicing, and
            investment profile readiness.
          </p>
        </div>

        <div className="mt-8">
          <InvestmentProfileForm
            initialValues={profile.editDefaults}
            onSubmitAction={updateCurrentUserInvestorProfileAction}
            submitLabel="Save profile updates"
            pendingLabel="Saving profile..."
            successMessage="Profile updated successfully."
            compactFields
            tone="dashboard"
            redirectHref="/account/dashboard/profile"
            siteName={siteName}
          />
        </div>
      </DashboardSectionCard>
    </div>
  );
}
