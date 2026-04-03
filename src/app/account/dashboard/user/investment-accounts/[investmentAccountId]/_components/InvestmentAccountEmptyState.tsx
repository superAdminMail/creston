import Link from "next/link";
import { ArrowLeft, CircleAlert } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type InvestmentAccountEmptyStateProps = {
  title?: string;
  description?: string;
};

export function InvestmentAccountEmptyState({
  title = "Investment account not found",
  description = "We could not find a matching investment account in your investment workspace. Return to your account list and choose another account.",
}: InvestmentAccountEmptyStateProps) {
  return (
    <Empty className="max-w-4xl mx-auto card-premium rounded-[2rem] p-8 text-left text-white sm:p-10">
      <EmptyHeader className="max-w-2xl items-start text-left">
        <EmptyMedia className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          <CircleAlert className="h-6 w-6 text-blue-300" />
        </EmptyMedia>
        <EmptyTitle className="text-2xl font-semibold tracking-[-0.03em] text-white">
          {title}
        </EmptyTitle>
        <EmptyDescription className="max-w-2xl text-sm leading-7 text-slate-400">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none items-start">
        <Link
          href="/account/dashboard/user/investment-accounts"
          className="btn-secondary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to accounts
        </Link>
      </EmptyContent>
    </Empty>
  );
}
