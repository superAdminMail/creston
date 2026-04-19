import Link from "next/link";
import { ArrowLeft, Landmark, Plus } from "lucide-react";

type UserInvestmentsHeaderProps = {
  siteName: string;
  showNewOrderButton: boolean;
};

export function UserInvestmentsHeader({
  siteName,
  showNewOrderButton,
}: UserInvestmentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link
          href="/account/dashboard/user"
          className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/8 px-3 py-1 text-xs font-medium text-blue-200">
          <Landmark className="h-3.5 w-3.5" />
          Investment order workspace
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
          Investment Orders
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
          Review your {siteName} investment orders, follow payment and
          confirmation progress, and return to active orders from one calm,
          structured workspace.
        </p>
      </div>

      {showNewOrderButton ? (
        <Link
          href="/account/dashboard/user/investment-orders/new"
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          New order
        </Link>
      ) : null}
    </div>
  );
}
