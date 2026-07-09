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
import type { InvestmentOrderCreationKycStatus } from "@/lib/types/investment-order";

type CreateInvestmentOrderEmptyStateProps = {
  hasInvestorProfile: boolean;
  canCreateInvestmentOrder: boolean;
  kycStatus: InvestmentOrderCreationKycStatus | null;
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
    ? "Complete your investment profile first"
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
    ? "Complete profile"
    : isKycBlocked
      ? "Verify KYC"
      : "Return to dashboard";

  return (
    <Empty className="mx-auto max-w-4xl rounded-[2rem] border border-border/60 bg-white/75 p-8 text-left text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-white sm:p-10">
      <EmptyHeader className="max-w-2xl items-start text-left">
        <EmptyMedia className="flex h-14 w-14 items-center justify-center rounded-3xl border border-border/60 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          {!hasInvestorProfile ? (
            <FileText className="h-6 w-6 text-sky-700 dark:text-blue-300" />
          ) : isKycBlocked ? (
            <ShieldAlert className="h-6 w-6 text-amber-600 dark:text-amber-300" />
          ) : (
            <Landmark className="h-6 w-6 text-sky-700 dark:text-blue-300" />
          )}
        </EmptyMedia>
        <EmptyTitle className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
          {title}
        </EmptyTitle>
        <EmptyDescription className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none items-start">
        {isKycBlocked ? (
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 shadow-sm dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200">
            <BadgeCheck className="h-3.5 w-3.5" />
            KYC verification required
          </div>
        ) : null}

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href={primaryHref}
            className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/account/dashboard/user"
            className="btn-secondary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium"
          >
            <CircleAlert className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </EmptyContent>
    </Empty>
  );
}
