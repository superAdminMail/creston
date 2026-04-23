import Link from "next/link";

import { SuperAdminSectionCard } from "../../_components/SuperAdminSectionCard";

export function InvestorsEmptyState() {
  return (
    <SuperAdminSectionCard
      title="No investors found"
      description="Investor profiles will appear here as users complete onboarding and create their first savings or investment activity."
      className="text-center"
      headerClassName="space-y-3 px-5 pt-6 sm:px-8 sm:pt-8"
      contentClassName="px-5 pb-6 sm:px-8 sm:pb-8"
      titleClassName="text-xl font-semibold text-slate-950 dark:text-white"
      descriptionClassName="mx-auto max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400"
    >
      <div className="flex justify-center">
        <Link
          href="/account/dashboard/super-admin/users"
          className="btn-primary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
        >
          Review users
        </Link>
      </div>
    </SuperAdminSectionCard>
  );
}
