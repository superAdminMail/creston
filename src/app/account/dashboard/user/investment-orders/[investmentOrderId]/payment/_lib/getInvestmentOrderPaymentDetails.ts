import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { formatCurrency } from "@/lib/formatters/formatters";
import {
  formatInvestmentTierReturnLabel,
  resolveInvestmentTierRoiPercentValue,
} from "@/lib/investment/formatInvestmentTierReturnLabel";
import { asJsonObject } from "@/lib/payments/paymentJson";
import { resolveInvestmentOrderBankInfoState } from "@/lib/payments/bank/investmentOrderBankInfo";
import { getPublicPlatformPaymentMethodForCheckout } from "@/lib/services/platform-wallets/getPlatformWallets";
import { decimalToNumber } from "@/lib/services/investment/decimal";
import type { CheckoutFundingMethodType } from "@/lib/types/payments/checkout.types";
import { InvestmentOrderPaymentDetails } from "@/lib/types/payments/investmentOrderPayment.types";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  return decimalToNumber(value as Parameters<typeof decimalToNumber>[0]);
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
      runtimeStatus: true,
      paymentMethodType: true,
      paymentMetadata: true,
      upgradeStatus: true,
      upgradeAmount: true,
      upgradePaymentId: true,
      upgradeRequestedAt: true,
      upgradeReviewedAt: true,
      createdAt: true,
      paymentReference: true,
      paidAt: true,
      confirmedAt: true,
      platformPaymentMethodId: true,
      bankInfoRequestedAt: true,
      bankInfoRespondedAt: true,
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

  const bankInfoState = await resolveInvestmentOrderBankInfoState(
    {
      id: order.id,
      currency: order.currency,
      platformPaymentMethodId: order.platformPaymentMethodId,
      bankInfoRequestedAt: order.bankInfoRequestedAt,
      bankInfoRespondedAt: order.bankInfoRespondedAt,
    },
    user.id,
  );

  const selectedFundingMethodType =
    fundingMethodType ?? order.paymentMethodType ?? "BANK_TRANSFER";
  const resolvedBankMethod =
    selectedFundingMethodType === "CRYPTO_PROVIDER"
      ? await getPublicPlatformPaymentMethodForCheckout({
          currency: order.currency,
          preferredType: "WALLET_ADDRESS",
        })
      : bankInfoState.bankMethod ??
        (await getPublicPlatformPaymentMethodForCheckout({
          currency: order.currency,
          preferredType: "BANK_INFO",
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
    runtimeStatus: order.runtimeStatus,
    paymentMethodType: order.paymentMethodType,
    paymentMetadata: asJsonObject(order.paymentMetadata),
    upgradeStatus: order.upgradeStatus,
    upgradeAmount: order.upgradeAmount
      ? decimalToNumber(order.upgradeAmount)
      : null,
    upgradePaymentId: order.upgradePaymentId,
    upgradeRequestedAt: order.upgradeRequestedAt?.toISOString() ?? null,
    upgradeReviewedAt: order.upgradeReviewedAt?.toISOString() ?? null,
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
    hasExistingBankInfoRequest:
      selectedFundingMethodType !== "CRYPTO_PROVIDER" &&
      bankInfoState.status === "REQUESTED",
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
