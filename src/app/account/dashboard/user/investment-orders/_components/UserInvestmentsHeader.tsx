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
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl dark:text-white">
          Track active orders
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
          Review payment progress, confirmation state, and order actions for
          each {siteName} investment in one structured workspace.
        </p>
      </div>

      {showNewOrderButton ? (
        <Link
          href="/account/dashboard/user/investment-orders/new"
          className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create order
        </Link>
      ) : null}
    </div>
  );
}
