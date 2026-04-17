import { prisma } from "@/lib/prisma";
import { requireDashboardRoleAccess } from "@/lib/permissions/requireDashboardRoleAccess";
import type { AdminDepositItem } from "@/lib/types/payments/adminDeposits.types";

function toNumber(value: { toNumber(): number } | number | null | undefined) {
  if (typeof value === "number") return value;
  return value?.toNumber?.() ?? 0;
}

function getPaymentMethodLabel(paymentMethod: {
  label: string | null;
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  instructions: string | null;
} | null) {
  if (!paymentMethod) {
    return null;
  }

  return [
    paymentMethod.label,
    paymentMethod.bankName,
    paymentMethod.accountName,
    paymentMethod.accountNumber
      ? `**** ${paymentMethod.accountNumber.slice(-4)}`
      : null,
    paymentMethod.instructions,
  ]
    .filter(Boolean)
    .join(" - ");
}

export async function getAdminDeposits(): Promise<AdminDepositItem[]> {
  await requireDashboardRoleAccess(["ADMIN", "SUPER_ADMIN"]);

  const [savingsPayments, investmentPayments] = await Promise.all([
    prisma.savingsTransactionPayment.findMany({
      orderBy: {
        submittedAt: "desc",
      },
      take: 150,
      select: {
        id: true,
        status: true,
        claimedAmount: true,
        approvedAmount: true,
        currency: true,
        depositorName: true,
        depositorAccountName: true,
        depositorAccountNo: true,
        transferReference: true,
        blockchainTxHash: true,
        note: true,
        reviewNote: true,
        rejectionReason: true,
        submittedAt: true,
        reviewedAt: true,
        platformPaymentMethod: {
          select: {
            label: true,
            bankName: true,
            accountName: true,
            accountNumber: true,
            instructions: true,
          },
        },
        submittedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        savingsFundingIntent: {
          select: {
            savingsAccount: {
              select: {
                id: true,
                name: true,
                currency: true,
                investorProfile: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.investmentOrderPayment.findMany({
      where: {
        status: "APPROVED",
      },
      orderBy: {
        submittedAt: "desc",
      },
      take: 150,
      select: {
        id: true,
        status: true,
        claimedAmount: true,
        approvedAmount: true,
        currency: true,
        depositorName: true,
        depositorAccountName: true,
        depositorAccountNo: true,
        transferReference: true,
        blockchainTxHash: true,
        note: true,
        reviewNote: true,
        rejectionReason: true,
        submittedAt: true,
        reviewedAt: true,
        platformPaymentMethod: {
          select: {
            label: true,
            bankName: true,
            accountName: true,
            accountNumber: true,
            instructions: true,
          },
        },
        submittedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        investmentOrder: {
          select: {
            id: true,
            status: true,
            investmentPlan: {
              select: {
                name: true,
                period: true,
              },
            },
            investorProfile: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const mappedSavings: AdminDepositItem[] = savingsPayments.map((payment) => ({
    id: `savings-${payment.id}`,
    source: "SAVINGS",
    status: payment.status,
    amount: toNumber(payment.approvedAmount ?? payment.claimedAmount),
    currency: payment.currency,
    submittedAt: payment.submittedAt.toISOString(),
    reviewedAt: payment.reviewedAt?.toISOString() ?? null,
    reference:
      payment.transferReference ??
      payment.blockchainTxHash ??
      payment.id,
    sourceLabel: `${payment.savingsFundingIntent.savingsAccount.name} savings account`,
    depositorName:
      payment.depositorName ??
      payment.submittedByUser?.name ??
      payment.savingsFundingIntent.savingsAccount.investorProfile.user.name,
    depositorAccountName:
      payment.depositorAccountName ??
      payment.submittedByUser?.email ??
      payment.savingsFundingIntent.savingsAccount.investorProfile.user.email,
    paymentMethodLabel: getPaymentMethodLabel(payment.platformPaymentMethod),
    note: payment.note,
    reviewNote: payment.reviewNote,
    rejectionReason: payment.rejectionReason,
    requesterName:
      payment.savingsFundingIntent.savingsAccount.investorProfile.user.name,
    requesterEmail:
      payment.savingsFundingIntent.savingsAccount.investorProfile.user.email,
  }));

  const mappedInvestment: AdminDepositItem[] = investmentPayments.map((payment) => ({
    id: `investment-${payment.id}`,
    source: "INVESTMENT",
    status: payment.status,
    amount: toNumber(payment.approvedAmount ?? payment.claimedAmount),
    currency: payment.currency,
    submittedAt: payment.submittedAt.toISOString(),
    reviewedAt: payment.reviewedAt?.toISOString() ?? null,
    reference:
      payment.transferReference ??
      payment.blockchainTxHash ??
      payment.id,
    sourceLabel: `${payment.investmentOrder.investmentPlan.name} investment order`,
    depositorName:
      payment.depositorName ??
      payment.submittedByUser?.name ??
      payment.investmentOrder.investorProfile.user.name,
    depositorAccountName:
      payment.depositorAccountName ??
      payment.submittedByUser?.email ??
      payment.investmentOrder.investorProfile.user.email,
    paymentMethodLabel: getPaymentMethodLabel(payment.platformPaymentMethod),
    note: payment.note,
    reviewNote: payment.reviewNote,
    rejectionReason: payment.rejectionReason,
    requesterName: payment.investmentOrder.investorProfile.user.name,
    requesterEmail: payment.investmentOrder.investorProfile.user.email,
  }));

  return [...mappedSavings, ...mappedInvestment].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}
