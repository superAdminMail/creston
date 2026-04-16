import { notFound } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/getCurrentUser";

function toNumber(value: any) {
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

  const roiPercent = toNumber(order.investmentPlanTier.roiPercent);

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
      </div>

      <div className="flex items-center justify-between rounded-xl border p-4">
        <div>
          <p className="text-sm font-medium">Status</p>
          <p className="text-xs text-muted-foreground">
            {order.status.replaceAll("_", " ")}
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
          <p className="text-xs text-muted-foreground">ROI</p>
          <p className="text-lg font-semibold">{roiPercent}%</p>
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

        <div className="space-y-1 text-xs text-muted-foreground">
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
        </div>
      </div>
    </div>
  );
}
