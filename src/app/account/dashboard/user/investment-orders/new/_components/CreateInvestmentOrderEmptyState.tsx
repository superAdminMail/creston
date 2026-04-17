import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  FileText,
  Landmark,
  ShieldAlert,
} from "lucide-react";

import { formatEnumLabel } from "@/lib/formatters/formatters";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type CreateInvestmentOrderEmptyStateProps = {
  hasInvestorProfile: boolean;
  canCreateInvestmentOrder: boolean;
  kycStatus: string | null;
  siteName: string;
};

export function CreateInvestmentOrderEmptyState({
  hasInvestorProfile,
  canCreateInvestmentOrder,
  kycStatus,
  siteName,
}: CreateInvestmentOrderEmptyStateProps) {
  const isKycBlocked = hasInvestorProfile && !canCreateInvestmentOrder;

  const title = !hasInvestorProfile
    ? "Complete your investment profile before starting"
    : isKycBlocked
      ? "Verify your KYC before creating an order"
      : "No active investment plans are available right now";

  const description = !hasInvestorProfile
    ? "Your investor profile needs to be completed before you can submit an investment order. Add your personal details first so your account is ready for plan selection and payment review."
    : isKycBlocked
      ? `Your KYC status is ${formatEnumLabel(kycStatus, "not available")}. Please complete verification before creating a new investment order.`
      : `${siteName} does not currently have an active investment plan available for your account. Please check back soon or contact support for guidance.`;

  const primaryHref = !hasInvestorProfile
    ? "/account/dashboard/user/investment-profile/edit"
    : isKycBlocked
      ? "/account/dashboard/user/kyc"
      : "/account/dashboard/user";

  const primaryLabel = !hasInvestorProfile
    ? "Complete investment profile"
    : isKycBlocked
      ? "Verify KYC"
      : "Return to dashboard";

  return (
    <Empty className="mx-auto max-w-4xl rounded-[2rem] card-premium p-8 text-left text-white sm:p-10">
      <EmptyHeader className="max-w-2xl items-start text-left">
        <EmptyMedia className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          {!hasInvestorProfile ? (
            <FileText className="h-6 w-6 text-blue-300" />
          ) : isKycBlocked ? (
            <ShieldAlert className="h-6 w-6 text-amber-300" />
          ) : (
            <Landmark className="h-6 w-6 text-blue-300" />
          )}
        </EmptyMedia>
        <EmptyTitle className="text-2xl font-semibold tracking-[-0.03em] text-white">
          {title}
        </EmptyTitle>
        <EmptyDescription className="max-w-2xl text-sm leading-7 text-slate-400">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none items-start">
        {isKycBlocked ? (
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            KYC verification required
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/account/dashboard/user"
            className="btn-secondary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
          >
            <CircleAlert className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </EmptyContent>
    </Empty>
  );
}
