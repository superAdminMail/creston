import Link from "next/link";
import { ArrowRight, FileText, Landmark } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type UserInvestmentsEmptyStateProps = {
  hasInvestorProfile: boolean;
  siteName: string;
};

export function UserInvestmentsEmptyState({
  hasInvestorProfile,
  siteName,
}: UserInvestmentsEmptyStateProps) {
  const title = hasInvestorProfile
    ? "No investment orders yet"
    : "Complete your investment profile first";

  const description = hasInvestorProfile
    ? `When you create an investment order, ${siteName} will list it here with its status, plan details, and next steps.`
    : "Your investor profile needs to be completed before you can create and manage investment orders from this workspace.";

  const href = hasInvestorProfile
    ? "/account/dashboard/user/investment-orders/new"
    : "/account/dashboard/user/investment-profile/edit";

  const ctaLabel = hasInvestorProfile
    ? "Create your first order"
    : "Complete investment profile";

  return (
    <Empty className="mx-auto max-w-4xl rounded-[2rem] border border-border/60 bg-white/75 p-8 text-slate-950 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-white sm:p-10">
      <EmptyHeader className="max-w-2xl">
        <EmptyMedia className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-border/60 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          {hasInvestorProfile ? (
            <Landmark className="h-6 w-6 text-sky-700 dark:text-blue-300" />
          ) : (
            <FileText className="h-6 w-6 text-sky-700 dark:text-blue-300" />
          )}
        </EmptyMedia>
        <EmptyTitle className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
          {title}
        </EmptyTitle>
        <EmptyDescription className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none">
        <Link
          href={href}
          className="btn-primary inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </EmptyContent>
    </Empty>
  );
}
