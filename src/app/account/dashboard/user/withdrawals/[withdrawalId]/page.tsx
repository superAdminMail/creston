import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCurrency } from "@/lib/formatters/formatters";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    withdrawalId: string;
  }>;
};

export default async function WithdrawalDetailsPage({ params }: Props) {
  const { withdrawalId } = await params;
  const userId = await getCurrentUserId();

  if (!userId) notFound();

  const profile = await prisma.investorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) notFound();

  const withdrawal = await prisma.withdrawalOrder.findFirst({
    where: {
      id: withdrawalId,
      investorProfileId: profile.id,
    },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      hasCommissionFees: true,
      commissionPercent: true,
      savingsFeeAmount: true,
      requestedAt: true,
      payoutSnapshot: true,
      payoutMethod: {
        select: {
          id: true,
          type: true,
          bankName: true,
          network: true,
        },
      },
      investmentOrderId: true,
      investmentAccountId: true,
      investmentOrder: {
        select: {
          id: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
      investmentAccount: {
        select: {
          id: true,
          investmentPlan: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!withdrawal) notFound();

  const payoutSnapshot =
    withdrawal.payoutSnapshot && typeof withdrawal.payoutSnapshot === "object"
      ? (withdrawal.payoutSnapshot as {
          withdrawalMode?: "NORMAL" | "EARLY_WITHDRAWAL" | null;
          requestedAmount?: string | null;
          earlyWithdrawalPenalty?: string | null;
          netPayoutAmount?: string | null;
        })
      : null;

  const sourceLabel =
    withdrawal.investmentOrder?.investmentPlan?.name ??
    withdrawal.investmentAccount?.investmentPlan?.name ??
    "Withdrawal source";

  const methodLabel =
    withdrawal.payoutMethod?.type === "BANK"
      ? withdrawal.payoutMethod.bankName ?? "Bank transfer"
      : withdrawal.payoutMethod?.type === "CRYPTO"
        ? withdrawal.payoutMethod.network ?? "Crypto wallet"
        : "Payment method";

  const statusTone =
    withdrawal.status === "COMPLETED"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
      : withdrawal.status === "REJECTED"
        ? "border-rose-400/20 bg-rose-500/10 text-rose-100"
        : withdrawal.status === "PROCESSING"
          ? "border-blue-400/20 bg-blue-500/10 text-blue-100"
          : "border-white/10 bg-white/5 text-slate-100";

  const sourceType = withdrawal.investmentOrderId
    ? "INVESTMENT_ORDER"
    : withdrawal.investmentAccountId
      ? "SAVINGS_ACCOUNT"
      : null;

  return (
    <div className="relative mx-auto min-h-[calc(100vh-5rem)] max-w-6xl px-4 py-6 sm:py-8">
      <div className="absolute inset-x-4 top-8 -z-10 h-40 rounded-[2rem] bg-[#3c9ee0]/10 blur-3xl" />

      <div className="space-y-6">
        <Link
          href="/account/dashboard/user/withdrawals"
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to withdrawals
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(15,23,42,0.92)] shadow-2xl backdrop-blur-xl">
          <div className="grid gap-0 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="relative p-6 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-slate-300">
                  Withdrawal Receipt
                </div>

                <div>
                  <p className="text-sm text-slate-400">Requested amount</p>
                  <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
                    {formatCurrency(Number(withdrawal.amount), withdrawal.currency)}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                    {sourceLabel}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${statusTone}`}
                  >
                    {withdrawal.status.replaceAll("_", " ").toLowerCase()}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {methodLabel}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {payoutSnapshot?.withdrawalMode === "EARLY_WITHDRAWAL"
                      ? "Early withdrawal"
                      : "Normal withdrawal"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 bg-white/[0.03] p-6 sm:p-8 lg:border-t-0 lg:border-l">
              <div className="grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    Requested At
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {withdrawal.requestedAt.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    Payment Method
                  </p>
                  <p className="mt-1 text-sm text-white">{methodLabel}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    Withdrawal Mode
                  </p>
                  <p className="mt-1 text-sm text-white">
                    {payoutSnapshot?.withdrawalMode === "EARLY_WITHDRAWAL"
                      ? "Early withdrawal"
                      : "Normal withdrawal"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 shadow-xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
              Status
            </p>
            <p className="mt-2 text-lg text-white">{withdrawal.status}</p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 shadow-xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
              Source
            </p>
            <p className="mt-2 text-lg text-white">{sourceLabel}</p>
          </div>

          {withdrawal.hasCommissionFees ? (
            sourceType === "INVESTMENT_ORDER" ? (
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 shadow-xl md:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  Commission Percent
                </p>
                <p className="mt-2 text-lg text-white">
                  {Number(withdrawal.commissionPercent)}%
                </p>
              </div>
            ) : sourceType === "SAVINGS_ACCOUNT" ? (
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 shadow-xl md:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  Savings Fee Amount
                </p>
                <p className="mt-2 text-lg text-white">
                  {formatCurrency(
                    Number(withdrawal.savingsFeeAmount ?? 0),
                    withdrawal.currency,
                  )}
                </p>
              </div>
            ) : null
          ) : null}

          {payoutSnapshot?.withdrawalMode === "EARLY_WITHDRAWAL" ? (
            <div className="rounded-[1.75rem] border border-amber-400/20 bg-amber-500/10 p-5 text-amber-50 shadow-xl md:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-amber-200">
                Early Withdrawal Penalty
              </p>
              <p className="mt-2 text-lg font-medium">
                {formatCurrency(
                  Number(payoutSnapshot.earlyWithdrawalPenalty ?? 0),
                  withdrawal.currency,
                )}
              </p>
            </div>
          ) : null}

          {payoutSnapshot?.netPayoutAmount ? (
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 shadow-xl md:col-span-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                Net Payout
              </p>
              <p className="mt-2 text-lg text-white">
                {formatCurrency(
                  Number(payoutSnapshot.netPayoutAmount),
                  withdrawal.currency,
                )}
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
