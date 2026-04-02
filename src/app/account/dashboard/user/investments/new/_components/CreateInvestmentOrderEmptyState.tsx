import Link from "next/link";
import { ArrowRight, CircleAlert, FileText, Landmark } from "lucide-react";

type CreateInvestmentOrderEmptyStateProps = {
  hasInvestorProfile: boolean;
};

export function CreateInvestmentOrderEmptyState({
  hasInvestorProfile,
}: CreateInvestmentOrderEmptyStateProps) {
  const title = hasInvestorProfile
    ? "No active investment plans are available right now"
    : "Complete your investment profile before starting";

  const description = hasInvestorProfile
    ? "Havenstone does not currently have an active investment plan available for your account. Please check back soon or contact support for guidance."
    : "Your investor profile needs to be completed before you can submit an investment order. Add your personal details first so your account is ready for plan selection and payment review.";

  const primaryHref = hasInvestorProfile
    ? "/account/dashboard/user"
    : "/account/dashboard/user/investment-profile/edit";

  const primaryLabel = hasInvestorProfile
    ? "Return to dashboard"
    : "Complete investment profile";

  return (
    <section className="card-premium rounded-[2rem] p-8 sm:p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
        {hasInvestorProfile ? (
          <Landmark className="h-6 w-6 text-blue-300" />
        ) : (
          <FileText className="h-6 w-6 text-blue-300" />
        )}
      </div>

      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
        {description}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
    </section>
  );
}
