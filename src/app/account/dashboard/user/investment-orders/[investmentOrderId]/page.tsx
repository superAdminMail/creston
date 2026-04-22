import { notFound } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";
import { formatEnumLabel } from "@/lib/formatters/formatters";
import { formatInvestmentTierReturnLabel } from "@/lib/investment/formatInvestmentTierReturnLabel";
import { CancelPendingInvestmentOrderButton } from "@/components/account/CancelPendingInvestmentOrderButton";

type DecimalLike = {
  toNumber(): number;
};

function toNumber(value: DecimalLike | number | null | undefined) {
  return typeof value === "number" ? value : (value?.toNumber?.() ?? 0);
}

type PageProps = {
  params: Promise<{
    investmentOrderId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { investmentOrderId } = await params;
  const userId = await getCurrentUserId();

  if (!userId) notFound();

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: investmentOrderId,
      investorProfile: {
        userId,
      },
    },
    include: {
      investmentPlan: {
        include: {
          investment: true,
        },
      },
      investmentPlanTier: true,
    },
  });

  if (!order) notFound();

  const amount = toNumber(order.amount);
  const accruedProfit = toNumber(order.accruedProfit);
  const expectedReturn = toNumber(order.expectedReturn);
  const amountPaid = toNumber(order.amountPaid);
  const remainingAmount = Math.max(amount - amountPaid, 0);

  const returnLabel = formatInvestmentTierReturnLabel({
    investmentModel: order.investmentModel,
    fixedRoiPercent: order.investmentPlanTier.fixedRoiPercent
      ? toNumber(order.investmentPlanTier.fixedRoiPercent)
      : null,
    projectedRoiMin: order.investmentPlanTier.projectedRoiMin
      ? toNumber(order.investmentPlanTier.projectedRoiMin)
      : null,
    projectedRoiMax: order.investmentPlanTier.projectedRoiMax
      ? toNumber(order.investmentPlanTier.projectedRoiMax)
      : null,
  });
  const paymentMethodLabel = order.paymentMethodType
    ? formatEnumLabel(order.paymentMethodType)
    : "Not set";

  const canPay =
    remainingAmount > 0 &&
    order.status !== "PAID" &&
    order.status !== "CONFIRMED" &&
    order.status !== "CANCELLED" &&
    order.status !== "REJECTED";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 text-white/90 dark:text-gray-300 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {order.investmentPlan.investment.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {order.investmentPlan.name}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            disabled={!canPay}
            className="rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white"
          >
            <Link
              href={`/account/dashboard/user/investment-orders/${order.id}/payment`}
            >
              Make Payment
            </Link>
          </Button>

          {order.status === "PENDING_PAYMENT" ? (
            <CancelPendingInvestmentOrderButton
              orderId={order.id}
              className="rounded-2xl"
            />
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div>
          <p className="text-sm font-medium">Status</p>
          <p className="text-xs text-muted-foreground">
            {formatEnumLabel(order.status)}
          </p>
        </div>

        {order.isMatured && (
          <span className="text-xs font-medium text-green-500">Matured</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Invested</p>
          <p className="text-lg font-semibold">${amount.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Return</p>
          <p className="text-lg font-semibold">
            {returnLabel ?? "Not configured"}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Earned</p>
          <p className="text-lg font-semibold">${accruedProfit.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Expected Return</p>
          <p className="text-lg font-semibold">${expectedReturn.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Amount Paid</p>
          <p className="text-lg font-semibold">${amountPaid.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className="text-lg font-semibold">${remainingAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border p-4">
        <p className="text-sm font-medium">Lifecycle</p>

        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <p>
            Start:{" "}
            {order.startDate
              ? new Date(order.startDate).toLocaleDateString()
              : "Not started"}
          </p>

          <p>
            Maturity:{" "}
            {order.maturityDate
              ? new Date(order.maturityDate).toLocaleDateString()
              : "Not set"}
          </p>

          <p>Payment method: {paymentMethodLabel}</p>

          <p>
            Payment reference: {order.paymentReference || "Not provided"}
          </p>

          <p>
            Paid at:{" "}
            {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : "Not paid yet"}
          </p>

          <p>
            Confirmed at:{" "}
            {order.confirmedAt
              ? new Date(order.confirmedAt).toLocaleDateString()
              : "Awaiting confirmation"}
          </p>
        </div>
      </div>
    </div>
  );
}
