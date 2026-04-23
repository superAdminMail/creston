import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { SuperAdminInvestorDetailsViewModel } from "@/actions/super-admin/investors/getSuperAdminInvestorById";
import { cn } from "@/lib/utils";

function getStatusClasses(
  status: SuperAdminInvestorDetailsViewModel["kycStatus"],
) {
  switch (status) {
    case "VERIFIED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
    case "PENDING_REVIEW":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";
    case "REJECTED":
      return "border-rose-400/20 bg-rose-400/10 text-rose-300";
    default:
      return "border-white/10 bg-white/[0.04] text-slate-200";
  }
}

export function InvestorDetailsHeader({
  investor,
}: {
  investor: SuperAdminInvestorDetailsViewModel;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <Link
          href="/account/dashboard/super-admin/investors"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to investors
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            {investor.title}
          </h1>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
              getStatusClasses(investor.kycStatus),
            )}
          >
            {investor.kycStatusLabel}
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          {investor.subtitle}. Review the profile, identity status, contact
          details, and linked account activity from one secure super-admin view.
        </p>
      </div>
    </div>
  );
}
