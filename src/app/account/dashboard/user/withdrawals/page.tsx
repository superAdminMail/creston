import { getCurrentUserId } from "@/lib/getCurrentUser";
import { prisma } from "@/lib/prisma";
import type { AvailableWithdrawalBalanceSummary } from "@/lib/service/getAvailableWithdrawalBalance";
import { getAvailableWithdrawalBalance } from "@/lib/service/getAvailableWithdrawalBalance";
import { getWithdrawalSourceOptions } from "@/lib/service/getAvailableWithdrawalSource";
import type { WithdrawalRequestItemDto } from "@/lib/types/withdrawalRequests";
import WithdrawalsClient from "../_components/WithdrawalsClient";

export default async function Page() {
  const userId = await getCurrentUserId();

  if (!userId) return null;

  const profile = await prisma.investorProfile.findUnique({
    where: { userId },
    include: {
      paymentMethods: true,
      withdrawalOrders: {
        include: {
          payoutMethod: true,
          investmentOrder: {
            include: {
              investmentPlan: {
                select: {
                  name: true,
                  investmentModel: true,
                },
              },
            },
          },
          investmentAccount: {
            select: {
              id: true,
              currency: true,
              investmentPlan: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          requestedAt: "desc",
        },
        take: 8,
      },
    },
  });

  const withdrawalSources = profile?.id
    ? await getWithdrawalSourceOptions(profile.id)
    : [];
  const availableBalance = profile?.id
    ? await getAvailableWithdrawalBalance(profile.id)
    : ({
        totalBalance: 0,
        investmentBalance: 0,
        savingsBalance: 0,
        currency: "USD",
        investmentOrders: [],
      } satisfies AvailableWithdrawalBalanceSummary);

  const withdrawalOrders: WithdrawalRequestItemDto[] =
    profile?.withdrawalOrders?.map((order) => ({
      id: order.id,
      amount: order.amount.toString(),
      currency: order.currency,
      status: order.status,
      requestedAt: order.requestedAt.toISOString(),
      payoutMethod: order.payoutMethod
        ? {
            id: order.payoutMethod.id,
            type: order.payoutMethod.type,
            bankName: order.payoutMethod.bankName,
            network: order.payoutMethod.network,
          }
        : null,
      payoutSnapshot: order.payoutSnapshot
        ? {
            withdrawalMode:
              typeof order.payoutSnapshot === "object" &&
              order.payoutSnapshot &&
              "withdrawalMode" in order.payoutSnapshot &&
              order.payoutSnapshot.withdrawalMode === "EARLY_WITHDRAWAL"
                ? "EARLY_WITHDRAWAL"
                : typeof order.payoutSnapshot === "object" &&
                    order.payoutSnapshot &&
                    "withdrawalMode" in order.payoutSnapshot &&
                    order.payoutSnapshot.withdrawalMode === "NORMAL"
                  ? "NORMAL"
                  : null,
            earlyWithdrawalPenalty:
              typeof order.payoutSnapshot === "object" &&
              order.payoutSnapshot &&
              "earlyWithdrawalPenalty" in order.payoutSnapshot
                ? String(order.payoutSnapshot.earlyWithdrawalPenalty ?? "")
                : null,
          }
        : null,
      investmentOrder: order.investmentOrder
        ? {
            investmentPlan: order.investmentOrder.investmentPlan
              ? {
                  name: order.investmentOrder.investmentPlan.name,
                }
              : null,
          }
        : null,
      investmentAccount: order.investmentAccount
        ? {
            investmentPlan: order.investmentAccount.investmentPlan
              ? {
                  name: order.investmentAccount.investmentPlan.name,
                }
              : null,
          }
        : null,
    })) ?? [];

  return (
    <WithdrawalsClient
      kycStatus={profile?.kycStatus ?? "NOT_STARTED"}
      paymentMethods={profile?.paymentMethods ?? []}
      withdrawalSources={withdrawalSources}
      withdrawalOrders={withdrawalOrders}
      availableBalance={availableBalance}
    />
  );
}
