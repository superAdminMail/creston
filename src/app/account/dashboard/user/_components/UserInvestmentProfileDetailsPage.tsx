import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CircleAlert,
  ArrowRight,
  FileText,
  MapPin,
  PencilLine,
  Phone,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import type { CurrentUserInvestmentProfileData } from "@/actions/profile/get-current-user-investment-profile";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_PAGE_PANEL_CLASS,
  DASHBOARD_PAGE_SURFACE_CLASS,
} from "../../_components/dashboardSurfaces";
import { DashboardSectionCard } from "../../_components/DashboardSectionCard";

type UserInvestmentProfileDetailsPageProps = {
  profile: CurrentUserInvestmentProfileData;
  siteName: string;
};

function DetailCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white/75 px-4 py-4 shadow-sm dark:bg-white/[0.04]">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-sky-700 dark:text-sky-300" />
        <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>

      <p className="mt-3 text-sm font-medium leading-6 text-slate-950 dark:text-white">
        {value || "Not added yet"}
      </p>
    </div>
  );
}

export function UserInvestmentProfileDetailsPage({
  profile,
  siteName,
}: UserInvestmentProfileDetailsPageProps) {
  const readinessItems = [
    {
      title: profile.profileComplete
        ? "Investment profile complete"
        : "Investment details still need attention",
      body: profile.profileComplete
        ? "Your investment profile is complete and ready for account servicing."
        : "Finish the missing investment fields to keep your account ready for secure servicing.",
      icon: profile.profileComplete ? BadgeCheck : CircleAlert,
      tone: profile.profileComplete
        ? "border-emerald-400/15 bg-emerald-400/8"
        : "border-amber-400/15 bg-amber-400/8",
      iconColor: profile.profileComplete
        ? "text-emerald-300"
        : "text-amber-300",
    },
    {
      title:
        profile.kycStatusLabel === "Verified"
          ? "KYC verification completed"
          : `KYC ${profile.kycStatusLabel.toLowerCase()}`,
      body:
        profile.kycStatusLabel === "Verified"
          ? "Your identity verification is complete for this investment profile."
          : "Verification documents still need to be prepared or reviewed before full account readiness.",
      icon: ShieldCheck,
      tone:
        profile.kycStatusLabel === "Verified"
          ? "border-blue-400/15 bg-blue-400/8"
          : "border-white/8 bg-white/[0.03]",
      iconColor: "text-blue-300",
    },
    {
      title: `${profile.completedFieldCount} of ${profile.totalFieldCount} profile fields completed`,
      body: profile.profileComplete
        ? "Your investment profile is fully completed and ready for the next financial steps."
        : `Continue updating your investment profile to improve completion and readiness across your ${siteName} account.`,
      icon: FileText,
      tone: "border-white/8 bg-white/[0.03]",
      iconColor: "text-blue-300",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/account/dashboard/user"
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
            Investment Profile
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
            Review and update your investment profile details for secure
            servicing and account readiness.
          </p>
        </div>

        <Link
          href="/account/dashboard/user/investment-profile/edit"
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <PencilLine className="h-4 w-4" />
          Update
        </Link>
      </div>

      <section className={`${DASHBOARD_PAGE_PANEL_CLASS} overflow-hidden p-6 sm:p-8`}>
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-2xl dark:text-white">
                Investment details
              </h2>

              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                  profile.profileComplete
                    ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300"
                    : "border border-amber-400/20 bg-amber-400/10 text-amber-700 dark:text-amber-300",
                )}
              >
                {profile.profileStatusLabel}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Set-up your investment profile to be ready for secure servicing.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/75 px-3 py-2 text-xs text-slate-700 shadow-sm dark:bg-white/[0.04] dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                Secure investment profile
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/75 px-3 py-2 text-xs text-slate-700 shadow-sm dark:bg-white/[0.04] dark:text-slate-300">
                <FileText className="h-4 w-4 text-sky-700 dark:text-sky-300" />
                KYC status: {profile.kycStatusLabel}
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm rounded-[1.75rem] border border-border/60 bg-white/75 p-5 shadow-sm dark:bg-white/[0.04]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-sky-700/90 dark:text-sky-300/80">
                  Completion
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                  {profile.completionPercent}%
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.14em] text-sky-700/90 dark:text-sky-300/80">
                  Status
                </p>
                <p className="mt-1 text-sm font-medium text-slate-950 dark:text-white">
                  {profile.profileComplete ? "Ready" : "Incomplete"}
                </p>
              </div>
            </div>

            <div className="mt-5 h-2.5 rounded-full bg-slate-200/80 dark:bg-white/6">
              <div
                className="h-2.5 rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_55%,#60a5fa_100%)] shadow-[0_0_18px_rgba(59,130,246,0.35)]"
                style={{
                  width: `${Math.max(0, Math.min(profile.completionPercent, 100))}%`,
                }}
              />
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {profile.profileComplete
                ? "Your investment profile is fully completed and ready for secure financial servicing."
                : "Complete the remaining investment fields to prepare your account for verification and investment readiness."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardSectionCard className="p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
                Investment details
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Your investment profile details
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <DetailCard
              label="Phone number"
              value={profile.details.phoneNumber}
              icon={Phone}
            />
            <DetailCard
              label="Date of birth"
              value={profile.details.dateOfBirth}
              icon={CalendarDays}
            />
            <DetailCard
              label="Country"
              value={profile.details.country}
              icon={MapPin}
            />
            <DetailCard
              label="State"
              value={profile.details.state}
              icon={MapPin}
            />
            <DetailCard
              label="City"
              value={profile.details.city}
              icon={MapPin}
            />
            <DetailCard
              label="Address"
              value={profile.details.addressLine1}
              icon={MapPin}
            />
          </div>
        </DashboardSectionCard>

        <div className="space-y-6">
          <section className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-6`}>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Next actions
            </h2>

            <div className="mt-5 space-y-3">
              <Link
                href="/account/dashboard/user/investment-profile/edit"
                className="flex items-center justify-between rounded-xl border border-border/60 bg-white/75 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-sky-400/30 hover:bg-sky-50/80 hover:text-slate-950 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                Update investment profile
                <ArrowRight className="h-4 w-4 text-sky-700 dark:text-sky-300" />
              </Link>

              <Link
                href="/account/dashboard/profile"
                className="flex items-center justify-between rounded-xl border border-border/60 bg-white/75 px-4 py-4 text-sm font-medium text-slate-700 transition hover:border-sky-400/30 hover:bg-sky-50/80 hover:text-slate-950 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                Review your personal profile
                <ArrowRight className="h-4 w-4 text-sky-700 dark:text-sky-300" />
              </Link>
            </div>
          </section>

          <section className={`${DASHBOARD_PAGE_SURFACE_CLASS} p-6`}>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Profile readiness
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Review and update your {siteName} investment profile.
            </p>

            <div className="mt-5 space-y-3">
              {readinessItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={cn("rounded-xl border p-4", item.tone)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="px-2 py-2">
                        <Icon
                          className={cn("mt-0.5 h-4 w-4", item.iconColor)}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-950 dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
