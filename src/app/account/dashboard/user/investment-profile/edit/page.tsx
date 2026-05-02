import Link from "next/link";
import { ArrowLeft, PencilLine } from "lucide-react";

import { getCurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import { updateCurrentUserInvestorProfileAction } from "@/actions/profile/upsert-current-user-investor-profile";
import { InvestmentProfileForm } from "@/components/onboarding/investment-profile-form";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

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
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            Edit Investment Profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Review and update your {siteName} investment profile.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
          <PencilLine className="h-4 w-4 text-blue-300" />
          Profile update
        </div>
      </div>

      <section className="card-premium rounded-[2rem] p-6 sm:p-8">
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-white">
            Investment profile details
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Review and update your investment profile details.
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
            redirectHref="/account/dashboard/profile"
            siteName={siteName}
          />
        </div>
      </section>
    </div>
  );
}
