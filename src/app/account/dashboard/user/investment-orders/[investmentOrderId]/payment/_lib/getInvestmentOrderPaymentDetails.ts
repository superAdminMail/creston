import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { formatCurrency } from "@/lib/formatters/formatters";
import { getUserPrivateBankInfo } from "@/lib/payments/bank/getUserPrivateBankInfo";
import { getPublicPlatformPaymentMethods } from "@/lib/services/platform-wallets/getPlatformWallets";
import { InvestmentOrderPaymentDetails } from "@/lib/types/payments/investmentOrderPayment.types";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

export async function getInvestmentOrderPaymentDetails(
  investmentOrderId: string,
): Promise<InvestmentOrderPaymentDetails> {
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
      createdAt: true,
      paymentReference: true,
      paidAt: true,
      confirmedAt: true,
      platformPaymentMethodId: true,
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
      platformPaymentMethod: {
        select: {
          id: true,
          label: true,
          type: true,
            bankName: true,
            bankCode: true,
            accountName: true,
            reference: true,
            bankAddress: true,
            accountNumber: true,
          instructions: true,
          notes: true,
          currency: true,
          isActive: true,
        },
      },
      payments: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          type: true,
          status: true,
          claimedAmount: true,
          approvedAmount: true,
          currency: true,
          depositorName: true,
          transferReference: true,
          note: true,
          reviewNote: true,
          rejectionReason: true,
          submittedAt: true,
          reviewedAt: true,
          receiptFile: {
            select: {
              id: true,
              url: true,
              fileName: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const existingBankInfoRequest = await prisma.notification.findFirst({
    where: {
      userId: user.id,
      key: `investment-order-bank-info-request-ack:${order.id}:${user.id}`,
    },
    select: {
      id: true,
      read: true,
      createdAt: true,
    },
  });

  const privateBankMethod = order.platformPaymentMethod
    ? null
    : await getUserPrivateBankInfo(user.id, order.currency);

  const fallbackBankMethod = await getPublicPlatformPaymentMethods().then(
    (methods) =>
      methods.find(
        (method) =>
          method.type === "BANK_INFO" &&
          (method.currency === order.currency || method.currency === null),
      ) ?? null,
  );

  const resolvedBankMethod =
    order.platformPaymentMethod ?? privateBankMethod ?? fallbackBankMethod;

  const amount = toNumber(order.amount);
  const amountPaid = toNumber(order.amountPaid);
  const remainingAmount = Math.max(amount - amountPaid, 0);

  return {
    id: order.id,
    amount,
    amountPaid,
    remainingAmount,
    currency: order.currency,
    status: order.status,
    paymentMethodType: order.paymentMethodType,
    createdAt: order.createdAt.toISOString(),
    paymentReference: order.paymentReference ?? null,
    paidAt: order.paidAt?.toISOString() ?? null,
    confirmedAt: order.confirmedAt?.toISOString() ?? null,
    plan: {
      id: order.investmentPlan.id,
      name: order.investmentPlan.name,
      period: order.investmentPlan.period,
    },
    tier: {
      id: order.investmentPlanTier.id,
      level: order.investmentPlanTier.level,
      minAmount: toNumber(order.investmentPlanTier.minAmount),
      maxAmount: toNumber(order.investmentPlanTier.maxAmount),
      roiPercent: toNumber(order.investmentPlanTier.roiPercent),
    },
    bankMethod: resolvedBankMethod
      ? {
          id: resolvedBankMethod.id,
          label: resolvedBankMethod.label,
        bankName: resolvedBankMethod.bankName,
        bankCode: resolvedBankMethod.bankCode ?? null,
        accountName: resolvedBankMethod.accountName,
        reference: resolvedBankMethod.reference ?? null,
        bankAddress: resolvedBankMethod.bankAddress ?? null,
        accountNumber: resolvedBankMethod.accountNumber,
          instructions: resolvedBankMethod.instructions,
          notes: resolvedBankMethod.notes ?? null,
          currency: resolvedBankMethod.currency ?? order.currency,
        }
      : null,
    hasBankMethod: Boolean(resolvedBankMethod),
    hasExistingBankInfoRequest: Boolean(existingBankInfoRequest),
    bankInfoRequest: existingBankInfoRequest
      ? {
          id: existingBankInfoRequest.id,
          createdAt: existingBankInfoRequest.createdAt.toISOString(),
          status: existingBankInfoRequest.read ? "READ" : "SENT",
        }
      : null,
    recentPayments: order.payments.map((payment) => ({
      id: payment.id,
      type: payment.type,
      status: payment.status,
      claimedAmount: toNumber(payment.claimedAmount),
      approvedAmount: payment.approvedAmount
        ? toNumber(payment.approvedAmount)
        : null,
      currency: payment.currency,
      depositorName: payment.depositorName ?? null,
      transferReference: payment.transferReference ?? null,
      note: payment.note ?? null,
      reviewNote: payment.reviewNote ?? null,
      rejectionReason: payment.rejectionReason ?? null,
      submittedAt: payment.submittedAt.toISOString(),
      reviewedAt: payment.reviewedAt?.toISOString() ?? null,
      receipt: payment.receiptFile
        ? {
            id: payment.receiptFile.id,
            url: payment.receiptFile.url ?? null,
            fileName: payment.receiptFile.fileName,
          }
        : null,
    })),
    amountLabel: formatCurrency(amount, order.currency),
    amountPaidLabel: formatCurrency(amountPaid, order.currency),
    remainingAmountLabel: formatCurrency(remainingAmount, order.currency),
  };
}
