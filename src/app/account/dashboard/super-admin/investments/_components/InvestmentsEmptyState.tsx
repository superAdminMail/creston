import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function InvestmentsEmptyState() {
  return (
    <Empty className="max-w-4xl mx-auto rounded-[1.75rem] border-white/10 bg-white/[0.02] p-8 text-white sm:p-10">
      <EmptyHeader className="max-w-xl">
        <EmptyMedia className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
          <Layers className="h-6 w-6 text-blue-300" />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-semibold text-white">
          No investment products created yet
        </EmptyTitle>
        <EmptyDescription className="text-sm leading-6 text-slate-400">
          Create your first investment product to start offering structured
          savings and investment opportunities to your customers. You can always
          add more products later.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none">
        <Link
          href="/account/dashboard/super-admin/investments/new"
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Create investment product
        </Link>
      </EmptyContent>
    </Empty>
  );
}
