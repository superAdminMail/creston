import Link from "next/link";
import { Plus, WalletCards } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function InvestmentPlansEmptyState() {
  return (
    <Empty className="max-w-4xl mx-auto rounded-[1.75rem] border-white/10 bg-white/[0.02] p-8 text-white sm:p-10">
      <EmptyHeader className="max-w-xl">
        <EmptyMedia className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          <WalletCards className="h-6 w-6 text-blue-300" />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-semibold text-white">
          No investment plans created yet
        </EmptyTitle>
        <EmptyDescription className="text-sm leading-6 text-slate-400">
          Investment plans are used to group investments and offer them to
          users. Create your first investment plan to start offering investments
          to your users. You can create different plans for different types of
          investments, or to offer different pricing tiers.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none">
        <Link
          href="/account/dashboard/super-admin/investment-plans/new"
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Create investment plan
        </Link>
      </EmptyContent>
    </Empty>
  );
}
