"use server";

import {
  InvestmentModel,
  InvestmentOrderAdjustmentDirection,
  Prisma,
  ReferralActivationType,
  ReferralRewardStatus,
  ReferralRewardType,
  RewardDestinationType,
  RewardSource,
  SavingsTransactionType,
} from "@/generated/prisma";

import { formatCurrency } from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";
import { toDecimal } from "@/lib/services/investment/decimal";

import {
  PlatformPromoRewardRow,
  RewardDestination,
  canReceiveReward,
  resolveRewardDestination,
} from "./rewardTypes";
import {
  promoRewardNotificationKey,
  upsertRewardNotification,
} from "./rewardNotifications";
import { writeRewardAudit } from "./rewardAudits";

async function findPlatformPromoRewardByCampaignAndUser(
  tx: Prisma.TransactionClient,
  promotionCampaignId: string,
  userId: string,
) {
  return tx.referralReward.findUnique({
    where: {
      promotionCampaignId_userId: {
        promotionCampaignId,
        userId,
      },
    },
    select: {
      id: true,
      referralId: true,
      promotionCampaignId: true,
      userId: true,
      source: true,
      type: true,
      status: true,
      amount: true,
      currency: true,
      creditedAt: true,
      promotionCampaign: {
        select: {
          id: true,
          title: true,
          slug: true,
          promoCode: true,
          rewardAmount: true,
          rewardCurrency: true,
        },
      },
    },
  }) as Promise<PlatformPromoRewardRow | null>;
}

async function findActivePromotionCampaignByCode(
  tx: Prisma.TransactionClient,
  promoCode: string,
) {
  const now = new Date();

  const campaign = await tx.promotionCampaign.findFirst({
    where: {
      promoCode,
      rewardEnabled: true,
      startsAt: {
        lte: now,
      },
      OR: [
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            gte: now,
          },
        },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      promoCode: true,
      rewardAmount: true,
      rewardCurrency: true,
      rewardEnabled: true,
      startsAt: true,
      expiresAt: true,
      maxRedemptions: true,
      redemptionCount: true,
    },
  });

  if (!campaign) {
    return null;
  }

  if (
    campaign.maxRedemptions != null &&
    campaign.redemptionCount >= campaign.maxRedemptions
  ) {
    return null;
  }

  return campaign;
}

async function createPlatformPromoRewardRow(
  tx: Prisma.TransactionClient,
  input: {
    promotionCampaignId: string;
    userId: string;
    amount: Prisma.Decimal;
    currency: string;
    promoCode: string;
  },
) {
  return tx.referralReward.create({
    data: {
      source: RewardSource.PLATFORM_PROMOTION,
      promotionCampaignId: input.promotionCampaignId,
      userId: input.userId,
      type: ReferralRewardType.PROMOTION_BONUS,
      amount: input.amount,
      currency: input.currency,
      status: ReferralRewardStatus.PENDING,
      metadata: {
        source: RewardSource.PLATFORM_PROMOTION,
        promoCode: input.promoCode,
        promotionCampaignId: input.promotionCampaignId,
        amount: input.amount.toString(),
        currency: input.currency,
      },
    },
    select: {
      id: true,
      referralId: true,
      promotionCampaignId: true,
      userId: true,
      source: true,
      type: true,
      status: true,
      amount: true,
      currency: true,
      creditedAt: true,
      promotionCampaign: {
        select: {
          id: true,
          title: true,
          slug: true,
          promoCode: true,
          rewardAmount: true,
          rewardCurrency: true,
        },
      },
    },
  }) as Promise<PlatformPromoRewardRow>;
}

async function claimPlatformPromoReward(
  tx: Prisma.TransactionClient,
  reward: PlatformPromoRewardRow,
  creditedAt: Date,
) {
  if (!reward.promotionCampaignId) {
    return false;
  }

  const updateResult = await tx.referralReward.updateMany({
    where: {
      id: reward.id,
      status: ReferralRewardStatus.PENDING,
    },
    data: {
      status: ReferralRewardStatus.CREDITED,
      creditedAt,
    },
  });

  if (updateResult.count > 0) {
    return true;
  }

  const fresh = await findPlatformPromoRewardByCampaignAndUser(
    tx,
    reward.promotionCampaignId,
    reward.userId,
  );

  return fresh?.status === ReferralRewardStatus.CREDITED;
}

export async function createPendingPlatformPromoRewardForUser(params: {
  userId: string;
  promoCode: string;
}) {
  const promoCode = params.promoCode.trim().toUpperCase();

  if (!promoCode) {
    return null;
  }

  return prisma.$transaction(async (tx) => {
    if (!(await canReceiveReward(tx, params.userId))) {
      return null;
    }

    const campaign = await findActivePromotionCampaignByCode(tx, promoCode);

    if (!campaign) {
      return null;
    }

    const existingReward = await findPlatformPromoRewardByCampaignAndUser(
      tx,
      campaign.id,
      params.userId,
    );

    if (existingReward) {
      return existingReward;
    }

    let reward: PlatformPromoRewardRow;

    try {
      reward = await createPlatformPromoRewardRow(tx, {
        promotionCampaignId: campaign.id,
        userId: params.userId,
        amount: campaign.rewardAmount,
        currency: campaign.rewardCurrency,
        promoCode: campaign.promoCode ?? promoCode,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return findPlatformPromoRewardByCampaignAndUser(
          tx,
          campaign.id,
          params.userId,
        );
      }

      throw error;
    }

    const redemptionUpdate = await tx.promotionCampaign.updateMany({
      where: {
        id: campaign.id,
        ...(campaign.maxRedemptions != null
          ? {
              redemptionCount: {
                lt: campaign.maxRedemptions,
              },
            }
          : {}),
      },
      data: {
        redemptionCount: {
          increment: 1,
        },
      },
    });

    if (redemptionUpdate.count === 0) {
      throw new Error("This campaign has reached its redemption limit.");
    }

    await upsertRewardNotification(tx, {
      userId: reward.userId,
      key: promoRewardNotificationKey(reward.id, "reserved"),
      title: reward.promotionCampaign?.title ?? "Promotion reward reserved",
      message: `Your ${formatCurrency(
        reward.amount.toNumber(),
        reward.currency,
      )} promotional reward has been reserved.`,
      link: "/account/dashboard",
      metadata: {
        source: RewardSource.PLATFORM_PROMOTION,
        promotionCampaignId: reward.promotionCampaignId,
        rewardId: reward.id,
        promoCode: reward.promotionCampaign?.promoCode ?? promoCode,
        campaignSlug: reward.promotionCampaign?.slug ?? null,
        amount: reward.amount.toString(),
        currency: reward.currency,
        status: "PENDING",
      },
    });

    await writeRewardAudit(tx, {
      action: "PLATFORM_PROMO_REWARD_RESERVED",
      reward,
      userId: reward.userId,
      amount: reward.amount,
      currency: reward.currency,
      destinationType: "NONE",
      destinationId: null,
      activationType: ReferralActivationType.INVESTMENT_ORDER_CONFIRMED,
      activationEntityId: null,
      description: "Platform promotion reward reserved for an eligible user.",
    });

    return reward;
  });
}

export async function creditPlatformPromoRewardToSavingsAccount(
  tx: Prisma.TransactionClient,
  input: {
    reward: PlatformPromoRewardRow;
    destination: Extract<RewardDestination, { kind: "SAVINGS_ACCOUNT" }>;
    activationType: ReferralActivationType;
    activationEntityId: string | null;
    rewardedAt: Date;
  },
) {
  if (input.reward.status === ReferralRewardStatus.CREDITED) {
    return {
      credited: false as const,
      reward: input.reward,
    };
  }

  const claimed = await claimPlatformPromoReward(
    tx,
    input.reward,
    input.rewardedAt,
  );

  if (!claimed) {
    return {
      credited: false as const,
      reward: input.reward,
    };
  }

  const balanceBefore = toDecimal(input.destination.savingsAccount.balance);
  const balanceAfter = balanceBefore.add(input.reward.amount);

  await tx.savingsAccount.update({
    where: {
      id: input.destination.savingsAccountId,
    },
    data: {
      balance: balanceAfter,
    },
  });

  await tx.savingsTransaction.create({
    data: {
      savingsAccountId: input.destination.savingsAccountId,
      type: SavingsTransactionType.ADJUSTMENT,
      amount: input.reward.amount,
      currency: input.reward.currency,
      balanceBefore,
      balanceAfter,
      reference: `PROMO_BONUS:${input.reward.id}`,
      note:
        input.reward.promotionCampaign?.title ?? "Promotion reward credited",
      metadata: {
        source: RewardSource.PLATFORM_PROMOTION,
        rewardType: input.reward.type,
        rewardId: input.reward.id,
        promotionCampaignId: input.reward.promotionCampaignId,
        promoCode: input.reward.promotionCampaign?.promoCode ?? null,
        campaignSlug: input.reward.promotionCampaign?.slug ?? null,
        amount: input.reward.amount.toString(),
        currency: input.reward.currency,
        destinationType: input.destination.kind,
        destinationId: input.destination.savingsAccountId,
        activationType: input.activationType,
        activationEntityId: input.activationEntityId,
      },
    },
  });

  await upsertRewardNotification(tx, {
    userId: input.reward.userId,
    key: promoRewardNotificationKey(input.reward.id, "credited-savings"),
    title: input.reward.promotionCampaign?.title ?? "Promotion reward credited",
    message: `Your ${formatCurrency(
      input.reward.amount.toNumber(),
      input.reward.currency,
    )} promotional reward has been credited to your savings account.`,
    link: "/account/dashboard/user/savings",
    metadata: {
      source: RewardSource.PLATFORM_PROMOTION,
      promotionCampaignId: input.reward.promotionCampaignId,
      rewardId: input.reward.id,
      campaignSlug: input.reward.promotionCampaign?.slug ?? null,
      amount: input.reward.amount.toString(),
      currency: input.reward.currency,
      destinationType: input.destination.kind,
      destinationId: input.destination.savingsAccountId,
      activationType: input.activationType,
      activationEntityId: input.activationEntityId,
    },
  });

  await writeRewardAudit(tx, {
    action: "REWARD_CREDITED",
    reward: input.reward,
    userId: input.reward.userId,
    amount: input.reward.amount,
    currency: input.reward.currency,
    destinationType: input.destination.kind,
    destinationId: input.destination.savingsAccountId,
    activationType: input.activationType,
    activationEntityId: input.activationEntityId,
    description: "Platform promotion reward credited to a savings account.",
  });

  return {
    credited: true as const,
    reward: input.reward,
  };
}

export async function creditPlatformPromoRewardToInvestment(
  tx: Prisma.TransactionClient,
  input: {
    reward: PlatformPromoRewardRow;
    destination: Extract<RewardDestination, { kind: "INVESTMENT_ORDER" }>;
    activationType: ReferralActivationType;
    activationEntityId: string | null;
    rewardedAt: Date;
    adjustedByUserId: string;
  },
) {
  if (input.reward.status === ReferralRewardStatus.CREDITED) {
    return {
      credited: false as const,
      reward: input.reward,
    };
  }

  const claimed = await claimPlatformPromoReward(
    tx,
    input.reward,
    input.rewardedAt,
  );

  if (!claimed) {
    return {
      credited: false as const,
      reward: input.reward,
    };
  }

  const investmentOrder = input.destination.investmentOrder;

  const accountBalanceBefore = toDecimal(
    investmentOrder.investmentAccount.balance,
  );

  const accountBalanceAfter = accountBalanceBefore.add(input.reward.amount);

  const earningsBefore = toDecimal(investmentOrder.accruedProfit);
  const earningsAfter =
    investmentOrder.investmentModel === InvestmentModel.FIXED
      ? earningsBefore.add(input.reward.amount)
      : earningsBefore;

  const investmentValueBefore = toDecimal(investmentOrder.currentValue);

  const nextInvestmentValue =
    investmentOrder.investmentModel === InvestmentModel.MARKET
      ? (investmentValueBefore.greaterThan(0)
          ? investmentValueBefore
          : toDecimal(investmentOrder.amount)
        ).add(input.reward.amount)
      : investmentValueBefore;

  await tx.investmentAccount.update({
    where: {
      id: input.destination.investmentAccountId,
    },
    data: {
      balance: accountBalanceAfter,
    },
  });

  await tx.investmentOrder.update({
    where: {
      id: input.destination.investmentOrderId,
    },
    data:
      investmentOrder.investmentModel === InvestmentModel.FIXED
        ? {
            accruedProfit: earningsAfter,
          }
        : {
            currentValue: nextInvestmentValue,
          },
  });

  await tx.investmentOrderAdjustment.create({
    data: {
      reference: `PROMO_BONUS:${input.reward.id}`,
      investmentOrderId: input.destination.investmentOrderId,
      adjustedByUserId: input.adjustedByUserId,
      direction: InvestmentOrderAdjustmentDirection.ADD,
      amount: input.reward.amount,
      earningsBefore,
      earningsAfter,
      balanceBefore: accountBalanceBefore,
      balanceAfter: accountBalanceAfter,
      currency: input.reward.currency,
      reason: "Promotion Reward",
      metadata: {
        source: RewardSource.PLATFORM_PROMOTION,
        rewardType: input.reward.type,
        rewardId: input.reward.id,
        promotionCampaignId: input.reward.promotionCampaignId,
        promoCode: input.reward.promotionCampaign?.promoCode ?? null,
        campaignSlug: input.reward.promotionCampaign?.slug ?? null,
        amount: input.reward.amount.toString(),
        currency: input.reward.currency,
        destinationType: input.destination.kind,
        destinationId: input.destination.investmentOrderId,
        activationType: input.activationType,
        activationEntityId: input.activationEntityId,
        adjustedByUserId: input.adjustedByUserId,
      },
    },
  });

  await upsertRewardNotification(tx, {
    userId: input.reward.userId,
    key: promoRewardNotificationKey(input.reward.id, "credited-investment"),
    title: input.reward.promotionCampaign?.title ?? "Promotion reward credited",
    message: `Your ${formatCurrency(
      input.reward.amount.toNumber(),
      input.reward.currency,
    )} promotional reward has been credited to your investment order.`,
    link: "/account/dashboard/user/investment-orders",
    metadata: {
      source: RewardSource.PLATFORM_PROMOTION,
      promotionCampaignId: input.reward.promotionCampaignId,
      rewardId: input.reward.id,
      campaignSlug: input.reward.promotionCampaign?.slug ?? null,
      amount: input.reward.amount.toString(),
      currency: input.reward.currency,
      destinationType: input.destination.kind,
      destinationId: input.destination.investmentOrderId,
      activationType: input.activationType,
      activationEntityId: input.activationEntityId,
    },
  });

  await writeRewardAudit(tx, {
    action: "REWARD_CREDITED",
    reward: input.reward,
    userId: input.reward.userId,
    amount: input.reward.amount,
    currency: input.reward.currency,
    destinationType: input.destination.kind,
    destinationId: input.destination.investmentOrderId,
    activationType: input.activationType,
    activationEntityId: input.activationEntityId,
    description: "Platform promotion reward credited to an investment order.",
  });

  return {
    credited: true as const,
    reward: input.reward,
  };
}

export async function creditPendingPlatformPromoRewardForUser(params: {
  userId: string;
  activationType: ReferralActivationType;
  activationEntityId: string;
  savingsAccountId?: string;
  investmentOrderId?: string;
  adjustedByUserId: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (!(await canReceiveReward(tx, params.userId))) {
      return {
        credited: 0,
        destination: null as RewardDestination | null,
      };
    }

    let destination: RewardDestination | null = null;

    if (params.savingsAccountId) {
      const savingsAccount = await tx.savingsAccount.findUnique({
        where: {
          id: params.savingsAccountId,
        },
        select: {
          id: true,
          name: true,
          balance: true,
          currency: true,
          investorProfile: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (
        savingsAccount &&
        savingsAccount.investorProfile.userId === params.userId
      ) {
        destination = {
          kind: "SAVINGS_ACCOUNT",
          savingsAccountId: savingsAccount.id,
          currency: savingsAccount.currency,
          label: `Savings account: ${savingsAccount.name}`,
          savingsAccount,
        };
      }
    }

    if (!destination && params.investmentOrderId) {
      const investmentOrder = await tx.investmentOrder.findUnique({
        where: {
          id: params.investmentOrderId,
        },
        select: {
          id: true,
          investmentModel: true,
          amount: true,
          accruedProfit: true,
          currentValue: true,
          currency: true,
          investmentAccount: {
            select: {
              id: true,
              balance: true,
              currency: true,
            },
          },
          investmentPlan: {
            select: {
              name: true,
            },
          },
          investorProfile: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (
        investmentOrder &&
        investmentOrder.investorProfile.userId === params.userId &&
        investmentOrder.investmentAccount
      ) {
        destination = {
          kind: "INVESTMENT_ORDER",
          investmentOrderId: investmentOrder.id,
          investmentAccountId: investmentOrder.investmentAccount.id,
          currency: investmentOrder.currency,
          label: `Investment order: ${investmentOrder.investmentPlan.name}`,
          investmentOrder,
        };
      }
    }

    if (!destination) {
      destination = await resolveRewardDestination(tx, params.userId);
    }

    if (!destination) {
      return {
        credited: 0,
        destination: null,
      };
    }

    const pendingRewards = (await tx.referralReward.findMany({
      where: {
        userId: params.userId,
        source: RewardSource.PLATFORM_PROMOTION,
        status: ReferralRewardStatus.PENDING,
      },
      select: {
        id: true,
        referralId: true,
        promotionCampaignId: true,
        userId: true,
        source: true,
        type: true,
        status: true,
        amount: true,
        currency: true,
        creditedAt: true,
        promotionCampaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            promoCode: true,
            rewardAmount: true,
            rewardCurrency: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })) as PlatformPromoRewardRow[];

    let creditedCount = 0;

    for (const reward of pendingRewards) {
      const rewardedAt = new Date(Date.now() + creditedCount);

      const result =
        destination.kind === "SAVINGS_ACCOUNT"
          ? await creditPlatformPromoRewardToSavingsAccount(tx, {
              reward,
              destination,
              activationType: params.activationType,
              activationEntityId: params.activationEntityId,
              rewardedAt,
            })
          : await creditPlatformPromoRewardToInvestment(tx, {
              reward,
              destination,
              activationType: params.activationType,
              activationEntityId: params.activationEntityId,
              rewardedAt,
              adjustedByUserId: params.adjustedByUserId,
            });

      if (result.credited) {
        creditedCount += 1;
      }
    }

    return {
      credited: creditedCount,
      destination,
    };
  });
}

export const creditRewardToSavingsAccount =
  creditPlatformPromoRewardToSavingsAccount;

export const creditRewardToInvestmentOrder =
  creditPlatformPromoRewardToInvestment;

export const creditPendingRewardToDestination =
  creditPendingPlatformPromoRewardForUser;
