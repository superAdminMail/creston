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
          No investments created yet
        </EmptyTitle>
        <EmptyDescription className="text-sm leading-6 text-slate-400">
          Add your first investment product to start building the Havenstone
          catalog for plans, investor orders, and platform growth workflows.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none">
        <Link
          href="/account/dashboard/super-admin/investments/new"
          className="btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Create investment
        </Link>
      </EmptyContent>
    </Empty>
  );
}
