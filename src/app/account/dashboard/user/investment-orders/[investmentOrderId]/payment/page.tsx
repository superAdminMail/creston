import { redirect, notFound } from "next/navigation";

import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/formatters/formatters";
import InvestmentOrderPaymentClient, {
  type InvestmentOrderPaymentDetails,
} from "./_components/InvestmentOrderPaymentClient";

type PageProps = {
  params: Promise<{
    investmentOrderId: string;
  }>;
};

async function getOrderDetails(investmentOrderId: string) {
  const user = await getCurrentSessionUser();

  if (!user?.id) {
    redirect("/auth/login");
  }

  const order = await prisma.investmentOrder.findFirst({
    where: {
      id: investmentOrderId,
      investorProfile: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      amount: true,
      amountPaid: true,
      currency: true,
      status: true,
      paymentMethodType: true,
      investmentPlan: {
        select: {
          id: true,
          name: true,
          period: true,
        },
      },
      investmentPlanTier: {
        select: {
          id: true,
          level: true,
          minAmount: true,
          maxAmount: true,
          roiPercent: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const amount = order.amount.toNumber();
  const amountPaid = order.amountPaid.toNumber();
  const remainingAmount = Math.max(amount - amountPaid, 0);

  const details: InvestmentOrderPaymentDetails = {
    id: order.id,
    amount,
    amountPaid,
    remainingAmount,
    currency: order.currency,
    status: order.status,
    paymentMethodType: order.paymentMethodType,
    plan: {
      id: order.investmentPlan.id,
      name: order.investmentPlan.name,
      period: order.investmentPlan.period,
    },
    tier: {
      id: order.investmentPlanTier.id,
      level: order.investmentPlanTier.level,
      minAmount: order.investmentPlanTier.minAmount.toNumber(),
      maxAmount: order.investmentPlanTier.maxAmount.toNumber(),
      roiPercent: order.investmentPlanTier.roiPercent?.toNumber() ?? 0,
    },
    amountLabel: formatCurrency(amount, order.currency),
    remainingAmountLabel: formatCurrency(remainingAmount, order.currency),
  };

  return details;
}

export default async function InvestmentOrderPaymentPage({ params }: PageProps) {
  const { investmentOrderId } = await params;
  const order = await getOrderDetails(investmentOrderId);

  return (
    <InvestmentOrderPaymentClient order={order} />
  );
}
