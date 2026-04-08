import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { InvestmentOrderStatus } from "@/generated/prisma";
import { ConfirmInvestmentOrderForm } from "@/app/account/_components/ConfirmInvestmentOrderForm";

function toNumber(value: any) {
  return typeof value === "number" ? value : (value?.toNumber() ?? 0);
}

export default async function Page({ params }: { params: { id: string } }) {
  const user = await getCurrentSessionUser();

  if (!user?.id) notFound();

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: params.id,
      investorProfile: {
        userId: user.id,
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

  const roiPercent = toNumber(order.investmentPlanTier.roiPercent);

  return (
    <div className="mx-auto max-w-3xl space-y-6 text-white/90 dark:text-gray-300 px-4 md:px-6 py-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">
          {order.investmentPlan.investment.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {order.investmentPlan.name}
        </p>
      </div>

      {/* Status */}
      <div className="rounded-xl border p-4 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Status</p>
          <p className="text-xs text-muted-foreground">
            {order.status.replace("_", " ")}
          </p>
        </div>

        {order.isMatured && (
          <span className="text-xs text-green-500 font-medium">Matured</span>
        )}
      </div>

      {/* Financials */}
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
      </div>

      {/* Timeline */}
      <div className="rounded-xl border p-4 space-y-2">
        <p className="text-sm font-medium">Lifecycle</p>

        <div className="text-xs text-muted-foreground space-y-1">
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

      {/* Action */}
      {order.status === InvestmentOrderStatus.PENDING_PAYMENT && (
        <ConfirmInvestmentOrderForm orderId={order.id} />
      )}
    </div>
  );
}
