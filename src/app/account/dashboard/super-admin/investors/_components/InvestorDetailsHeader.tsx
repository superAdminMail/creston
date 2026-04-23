import type { SuperAdminInvestorDetailsViewModel } from "@/actions/super-admin/investors/getSuperAdminInvestorById";
import { cn } from "@/lib/utils";
import { SuperAdminPageHeader } from "../../_components/SuperAdminPageHeader";

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
    <SuperAdminPageHeader
      backHref="/account/dashboard/super-admin/investors"
      backLabel="Back to investors"
      title={investor.title}
      description={`${investor.subtitle}. Review the profile, identity status, contact details, and linked account activity from one secure super-admin view.`}
      actions={
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
            getStatusClasses(investor.kycStatus),
          )}
        >
          {investor.kycStatusLabel}
        </span>
      }
    />
  );
}
