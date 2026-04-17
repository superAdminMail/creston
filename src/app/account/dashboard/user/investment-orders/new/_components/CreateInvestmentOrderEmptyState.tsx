import Link from "next/link";
import { ArrowRight, CircleAlert, FileText, Landmark } from "lucide-react";
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
  siteName: string;
};

export function CreateInvestmentOrderEmptyState({
  hasInvestorProfile,
  siteName,
}: CreateInvestmentOrderEmptyStateProps) {
  const title = hasInvestorProfile
    ? "No active investment plans are available right now"
    : "Complete your investment profile before starting";

  const description = hasInvestorProfile
    ? `${siteName} does not currently have an active investment plan available for your account. Please check back soon or contact support for guidance.`
    : "Your investor profile needs to be completed before you can submit an investment order. Add your personal details first so your account is ready for plan selection and payment review.";

  const primaryHref = hasInvestorProfile
    ? "/account/dashboard/user"
    : "/account/dashboard/user/investment-profile/edit";

  const primaryLabel = hasInvestorProfile
    ? "Return to dashboard"
    : "Complete investment profile";

  return (
    <Empty className="max-w-4xl mx-auto card-premium rounded-[2rem] p-8 text-left text-white sm:p-10">
      <EmptyHeader className="max-w-2xl items-start text-left">
        <EmptyMedia className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          {hasInvestorProfile ? (
            <Landmark className="h-6 w-6 text-blue-300" />
          ) : (
            <FileText className="h-6 w-6 text-blue-300" />
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
