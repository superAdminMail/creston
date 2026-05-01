import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { formatCurrency } from "@/lib/formatters/formatters";
import {
  formatInvestmentTierReturnLabel,
  resolveInvestmentTierRoiPercentValue,
} from "@/lib/investment/formatInvestmentTierReturnLabel";
import { hasUserBankInfoRequest } from "@/lib/payments/bank/hasUserBankInfoRequest";
import { getUserPrivateBankInfo } from "@/lib/payments/bank/getUserPrivateBankInfo";
import { getPublicPlatformPaymentMethodForCheckout } from "@/lib/services/platform-wallets/getPlatformWallets";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import { InvestmentOrderPaymentDetails } from "@/lib/types/payments/investmentOrderPayment.types";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

export async function getInvestmentOrderPaymentDetails(
  investmentOrderId: string,
  fundingMethodType?: CheckoutFundingMethodType | null,
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
          investmentModel: true,
        },
      },
      investmentPlanTier: {
        select: {
          id: true,
          level: true,
          minAmount: true,
          maxAmount: true,
          fixedRoiPercent: true,
          projectedRoiMin: true,
          projectedRoiMax: true,
        },
      },
      platformPaymentMethod: {
        select: {
          id: true,
          label: true,
          type: true,
          providerName: true,
          bankName: true,
          bankCode: true,
          accountName: true,
          reference: true,
          bankAddress: true,
          accountNumber: true,
          iban: true,
          swiftCode: true,
          routingNumber: true,
          branchName: true,
          country: true,
          instructions: true,
          notes: true,
          isPrivate: true,
          isDefault: true,
          sortOrder: true,
          verificationStatus: true,
          cryptoAsset: true,
          cryptoNetwork: true,
          walletAddress: true,
          walletTag: true,
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

  const hasExistingBankInfoRequest = await hasUserBankInfoRequest(user.id);

  const selectedFundingMethodType =
    fundingMethodType ?? order.paymentMethodType ?? "BANK_TRANSFER";
  const preferredPlatformPaymentMethodType =
    selectedFundingMethodType === "CRYPTO_PROVIDER"
      ? "WALLET_ADDRESS"
      : "BANK_INFO";
  const orderPaymentMethodMatchesSelectedFundingMethod =
    order.platformPaymentMethod?.type === preferredPlatformPaymentMethodType;

  const privateBankMethod =
    orderPaymentMethodMatchesSelectedFundingMethod ||
    selectedFundingMethodType === "CRYPTO_PROVIDER"
      ? null
      : await getUserPrivateBankInfo(user.id, order.currency);

  const fallbackBankMethod =
    orderPaymentMethodMatchesSelectedFundingMethod ? null : privateBankMethod;

  const resolvedBankMethod =
    (orderPaymentMethodMatchesSelectedFundingMethod
      ? order.platformPaymentMethod
      : null) ??
    fallbackBankMethod ??
    (await getPublicPlatformPaymentMethodForCheckout({
      currency: order.currency,
      preferredType: preferredPlatformPaymentMethodType,
    }));

  const amount = toNumber(order.amount);
  const amountPaid = toNumber(order.amountPaid);
  const remainingAmount = Math.max(amount - amountPaid, 0);
  const latestPayment = order.payments[0] ?? null;
  const latestBankPaymentShortfallAmount =
    latestPayment &&
    latestPayment.status === "APPROVED" &&
    latestPayment.approvedAmount !== null &&
    latestPayment.approvedAmount !== undefined
      ? Math.max(
          toNumber(latestPayment.claimedAmount) -
            toNumber(latestPayment.approvedAmount),
          0,
        )
      : 0;

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
      roiPercent:
        resolveInvestmentTierRoiPercentValue({
          investmentModel: order.investmentPlan.investmentModel,
          fixedRoiPercent: order.investmentPlanTier.fixedRoiPercent
            ? toNumber(order.investmentPlanTier.fixedRoiPercent)
            : null,
          projectedRoiMin: order.investmentPlanTier.projectedRoiMin
            ? toNumber(order.investmentPlanTier.projectedRoiMin)
            : null,
          projectedRoiMax: order.investmentPlanTier.projectedRoiMax
            ? toNumber(order.investmentPlanTier.projectedRoiMax)
            : null,
          }) ?? 0,
      returnLabel: formatInvestmentTierReturnLabel({
        investmentModel: order.investmentPlan.investmentModel,
        fixedRoiPercent: order.investmentPlanTier.fixedRoiPercent
          ? toNumber(order.investmentPlanTier.fixedRoiPercent)
          : null,
        projectedRoiMin: order.investmentPlanTier.projectedRoiMin
          ? toNumber(order.investmentPlanTier.projectedRoiMin)
          : null,
        projectedRoiMax: order.investmentPlanTier.projectedRoiMax
          ? toNumber(order.investmentPlanTier.projectedRoiMax)
          : null,
      }),
    },
    bankMethod: resolvedBankMethod
      ? {
          id: resolvedBankMethod.id,
          label: resolvedBankMethod.label,
          type: resolvedBankMethod.type,
          providerName: resolvedBankMethod.providerName ?? null,
          bankName: resolvedBankMethod.bankName,
          bankCode: resolvedBankMethod.bankCode ?? null,
          accountName: resolvedBankMethod.accountName,
          reference: resolvedBankMethod.reference ?? null,
          bankAddress: resolvedBankMethod.bankAddress ?? null,
          accountNumber: resolvedBankMethod.accountNumber,
          iban: resolvedBankMethod.iban ?? null,
          swiftCode: resolvedBankMethod.swiftCode ?? null,
          routingNumber: resolvedBankMethod.routingNumber ?? null,
          branchName: resolvedBankMethod.branchName ?? null,
          country: resolvedBankMethod.country ?? null,
          instructions: resolvedBankMethod.instructions,
          notes: resolvedBankMethod.notes ?? null,
          isPrivate: resolvedBankMethod.isPrivate,
          isDefault: resolvedBankMethod.isDefault,
          sortOrder: resolvedBankMethod.sortOrder,
          verificationStatus: resolvedBankMethod.verificationStatus,
          cryptoAsset: resolvedBankMethod.cryptoAsset ?? null,
          cryptoNetwork: resolvedBankMethod.cryptoNetwork ?? null,
          walletAddress: resolvedBankMethod.walletAddress ?? null,
          walletTag: resolvedBankMethod.walletTag ?? null,
          currency: resolvedBankMethod.currency ?? order.currency,
        }
      : null,
    hasBankMethod: Boolean(resolvedBankMethod),
    hasExistingBankInfoRequest,
    bankInfoRequest: null,
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
    latestBankPaymentShortfallAmount,
  };
}
