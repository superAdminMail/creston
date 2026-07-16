import { Badge } from "@/components/ui/badge";
import {
  getSuperAdminKycReviews,
  type SuperAdminKycReviewListItem,
} from "@/actions/super-admin/kyc-reviews/getSuperAdminKycReviews";
import { SuperAdminCollection } from "../_components/SuperAdminCollection";
import { SuperAdminPageHeader } from "../_components/SuperAdminPageHeader";
import { SuperAdminStatCard } from "../_components/SuperAdminStatCard";
import { InvestorStatusBadge } from "../investors/_components/InvestorStatusBadge";
import { KycReviewActions } from "./_components/KycReviewActions";
import { cn } from "@/lib/utils";

function getReviewBadgeClasses(
  reviewState: SuperAdminKycReviewListItem["reviewState"],
) {
  if (reviewState === "VERIFIED_STALE") {
    return "border-sky-400/20 bg-sky-500/10 text-sky-900 dark:text-sky-200";
  }

  return "border-amber-400/20 bg-amber-500/10 text-amber-900 dark:text-amber-200";
}

function getSessionBadgeClasses(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "approved") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200";
  }

  if (
    normalized === "declined" ||
    normalized === "expired" ||
    normalized === "abandoned"
  ) {
    return "border-rose-400/20 bg-rose-500/10 text-rose-900 dark:text-rose-200";
  }

  return "border-amber-400/20 bg-amber-500/10 text-amber-900 dark:text-amber-200";
}

function SectionEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-border/60 bg-white/75 p-6 shadow-sm dark:bg-white/[0.04]">
      <p className="text-lg font-semibold text-slate-950 dark:text-white">
        {title}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

function KycReviewTable({
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  description: string;
  items: SuperAdminKycReviewListItem[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <section className="min-w-0 space-y-4">
      <div className="min-w-0 space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h2>
        <p className="max-w-3xl break-words text-sm leading-7 text-slate-600 dark:text-slate-400">
          {description}
        </p>
      </div>

      {items.length === 0 ? (
        <SectionEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <SuperAdminCollection
          items={items}
          getItemKey={(item) => item.investorProfileId}
          columns={[
            {
              key: "investor",
              header: "Investor",
              render: (item) => (
                <div className="min-w-0 space-y-1 break-words">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    {item.name}
                  </p>
                  <p className="break-words text-xs text-slate-500 dark:text-slate-400">
                    {item.email} <span aria-hidden="true">&bull;</span>{" "}
                    {item.username}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Updated {item.profileUpdatedLabel}
                  </p>
                </div>
              ),
            },
            {
              key: "kyc",
              header: "KYC",
              render: (item) => (
                <div className="space-y-2">
                  <InvestorStatusBadge status={item.kycStatus} />
                  <Badge
                    variant="outline"
                    className={cn(
                      "inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      getReviewBadgeClasses(item.reviewState),
                    )}
                  >
                    {item.reviewStateLabel}
                  </Badge>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verification record: {item.verificationStatusLabel}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verified at {item.verifiedAtLabel}
                  </p>
                </div>
              ),
            },
            {
              key: "session",
              header: "Latest session",
              render: (item) => (
                <div className="space-y-2">
                  {item.latestSession ? (
                    <>
                      <Badge
                        variant="outline"
                        className={cn(
                          "inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium",
                          getSessionBadgeClasses(item.latestSession.status),
                        )}
                      >
                        {item.latestSession.statusLabel}
                      </Badge>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Session {item.latestSession.providerSessionIdLabel}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Last synced {item.latestSession.ageLabel}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No session record available.
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: "reason",
              header: "Review note",
              render: (item) => (
                <p className="max-w-xl break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {item.reviewReason}
                </p>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              className: "px-5 py-4 text-right text-slate-500",
              cellClassName: "px-5 py-4 align-top",
              render: (item) => <KycReviewActions review={item} />,
            },
          ]}
        />
      )}
    </section>
  );
}

export default async function SuperAdminKycReviewsPage() {
  const data = await getSuperAdminKycReviews();

  return (
    <div className="min-w-0 space-y-8">
      <SuperAdminPageHeader
        backHref="/account/dashboard/super-admin/system-health"
        backLabel="Back to system health"
        title="KYC Reviews"
        description="Review non-verified profiles, reconcile verified stale sessions, and manually clear identity checks when compliance operations require a human decision."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminStatCard
          label="Reviewable profiles"
          value={data.reviewableProfilesCount}
          description="Profiles currently waiting on a KYC decision or reconciliation."
        />
        <SuperAdminStatCard
          label="Manual review"
          value={data.manualReviewCount}
          description="Profiles that still need a direct compliance decision."
        />
        <SuperAdminStatCard
          label="Stale sessions"
          value={data.staleSessionCount}
          description="Didit sessions that have gone stale and need attention."
        />
        <SuperAdminStatCard
          label="Verified stale"
          value={data.verifiedStaleCount}
          description="Already verified profiles with stale session records."
        />
      </section>

      <KycReviewTable
        title="Manual review queue"
        description="Profiles that are not verified yet and need a compliance decision before the identity record can be cleared."
        items={data.manualReviewItems}
        emptyTitle="No manual reviews waiting"
        emptyDescription="There are no KYC profiles currently waiting for manual review."
      />

      <KycReviewTable
        title="Verified stale sessions"
        description="Verified profiles whose latest Didit session is stale and should be reconciled for audit consistency."
        items={data.verifiedStaleItems}
        emptyTitle="No verified stale sessions"
        emptyDescription="There are no verified profiles with stale verification sessions right now."
      />
    </div>
  );
}
