"use server";

import {
  InvestmentModel,
  InvestmentOrderAdjustmentDirection,
  Prisma,
  ReferralActivationType,
  ReferralRewardStatus,
  ReferralRewardType,
  ReferralStatus,
  RewardDestinationType,
  RewardSource,
  SavingsTransactionType,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { toDecimal } from "@/lib/services/investment/decimal";

import {
  canReceiveReward,
  claimReferralReward,
  ensureReferralRewardRow,
  resolveRewardDestination,
  type ReferralRewardRow,
  type RewardDestination,
} from "./rewardTypes";
import {
  referralNotificationKey,
  upsertRewardNotification,
} from "./rewardNotifications";
import { writeReferralAudit } from "./rewardAudits";

type ActivateReferralForReferredUserInput = {
  referredUserId: string;
  activationType: ReferralActivationType;
  activationEntityId: string;
};

type CreditReferralRewardInput = {
  rewardId: string;
  userId: string;
  savingsAccountId?: string;
  investmentOrderId?: string;
  adjustedByUserId?: string;
};

type CreditPendingReferralRewardsInput = {
  userId: string;
  savingsAccountId?: string;
  investmentOrderId?: string;
  adjustedByUserId: string;
};

type CreateReferralInput = {
  referrerUserId: string;
  referredUserId: string;
  code: string;
};

type DecimalInput = Prisma.Decimal | string | number | null | undefined;

function decimal(value: DecimalInput) {
  return toDecimal(value);
}

function isPositiveAmount(value: DecimalInput) {
  try {
    return decimal(value).greaterThan(0);
  } catch {
    return false;
  }
}

async function findReferralRewardById(
  tx: Prisma.TransactionClient,
  rewardId: string,
): Promise<ReferralRewardRow | null> {
  return tx.referralReward.findUnique({
    where: {
      id: rewardId,
    },
    select: {
      id: true,
      referralId: true,
      userId: true,
      type: true,
      status: true,
      amount: true,
      currency: true,
      creditedAt: true,
      referral: {
        select: {
          id: true,
          referrerUserId: true,
          referredUserId: true,
          code: true,
          status: true,
          rewardCurrency: true,
          referrerRewardAmount: true,
          referredRewardAmount: true,
          activatedBy: true,
          activatedByEntityId: true,
          activatedAt: true,
          rewardedAt: true,
        },
      },
    },
  });
}

async function setRewardDestination(
  tx: Prisma.TransactionClient,
  rewardId: string,
  destination: RewardDestination,
) {
  await tx.referralReward.update({
    where: {
      id: rewardId,
    },
    data: {
      destinationId:
        destination.kind === "SAVINGS_ACCOUNT"
          ? destination.savingsAccountId
          : destination.investmentOrderId,
      destinationType:
        destination.kind === "SAVINGS_ACCOUNT"
          ? RewardDestinationType.SAVINGS_ACCOUNT
          : RewardDestinationType.INVESTMENT_ORDER,
    },
  });
}

/**
 * A referral can only become REWARDED when every reward that was created
 * for that referral has been credited.
 *
 * This prevents the referral from being marked REWARDED when, for example,
 * the referred user's reward was credited but the referrer's reward is
 * still pending.
 */
async function syncReferralStatusInTransaction(
  tx: Prisma.TransactionClient,
  referralId: string,
) {
  const referral = await tx.referral.findUnique({
    where: {
      id: referralId,
    },
    select: {
      id: true,
      status: true,
      rewardedAt: true,
      rewards: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  if (!referral) {
    return null;
  }

  if (referral.status === ReferralStatus.CANCELLED) {
    return referral;
  }

  const hasRewards = referral.rewards.length > 0;

  const allRewardsCredited =
    hasRewards &&
    referral.rewards.every(
      (reward) => reward.status === ReferralRewardStatus.CREDITED,
    );

  if (!allRewardsCredited) {
    return referral;
  }

  if (referral.status === ReferralStatus.REWARDED) {
    return referral;
  }

  return tx.referral.update({
    where: {
      id: referral.id,
    },
    data: {
      status: ReferralStatus.REWARDED,
      rewardedAt: referral.rewardedAt ?? new Date(),
    },
  });
}

export async function createReferralForNewUser(input: CreateReferralInput) {
  if (!input.referrerUserId || !input.referredUserId || !input.code) {
    return null;
  }

  if (input.referrerUserId === input.referredUserId) {
    return null;
  }

  const existing = await prisma.referral.findUnique({
    where: {
      referredUserId: input.referredUserId,
    },
  });

  if (existing) {
    return existing;
  }

  const referrer = await prisma.user.findUnique({
    where: {
      id: input.referrerUserId,
    },
    select: {
      id: true,
    },
  });

  if (!referrer) {
    return null;
  }

  return prisma.referral.create({
    data: {
      referrerUserId: input.referrerUserId,
      referredUserId: input.referredUserId,
      code: input.code,
      status: ReferralStatus.PENDING,
    },
  });
}

export async function activateReferralForReferredUser(
  input: ActivateReferralForReferredUserInput,
) {
  return prisma.$transaction(async (tx) => {
    const referral = await tx.referral.findUnique({
      where: {
        referredUserId: input.referredUserId,
      },
    });

    if (!referral) {
      return {
        success: true,
        activated: false,
        reason: "REFERRAL_NOT_FOUND",
      };
    }

    if (
      referral.status === ReferralStatus.CANCELLED ||
      referral.status === ReferralStatus.REWARDED
    ) {
      return {
        success: true,
        activated: false,
        reason: "REFERRAL_ALREADY_SETTLED",
      };
    }

    if (!(await canReceiveReward(tx, input.referredUserId))) {
      return {
        success: true,
        activated: false,
        reason: "NOT_ELIGIBLE",
      };
    }

    const activatedAt = new Date();
    const rewards: ReferralRewardRow[] = [];

    if (isPositiveAmount(referral.referrerRewardAmount)) {
      const reward = await ensureReferralRewardRow(tx, {
        referralId: referral.id,
        userId: referral.referrerUserId,
        type: ReferralRewardType.REFERRER_BONUS,
        amount: referral.referrerRewardAmount,
        currency: referral.rewardCurrency,
        activatedAt,
        activatedBy: input.activationType,
        activatedByEntityId: input.activationEntityId,
      });

      rewards.push(reward);
    }

    if (isPositiveAmount(referral.referredRewardAmount)) {
      const reward = await ensureReferralRewardRow(tx, {
        referralId: referral.id,
        userId: referral.referredUserId,
        type: ReferralRewardType.REFERRED_BONUS,
        amount: referral.referredRewardAmount,
        currency: referral.rewardCurrency,
        activatedAt,
        activatedBy: input.activationType,
        activatedByEntityId: input.activationEntityId,
      });

      rewards.push(reward);
    }

    await tx.referral.update({
      where: {
        id: referral.id,
      },
      data: {
        status: ReferralStatus.ACTIVE,
        activatedBy: input.activationType,
        activatedByEntityId: input.activationEntityId,
        activatedAt,
      },
    });

    await writeReferralAudit(tx, {
      action: "REFERRAL_ACTIVATED",
      referralId: referral.id,
      rewardId: rewards[0]?.id ?? null,
      rewardType: rewards[0]?.type ?? null,
      userId: input.referredUserId,
      amount: referral.referredRewardAmount,
      currency: referral.rewardCurrency,
      destinationType: "NONE",
      destinationId: null,
      activationType: input.activationType,
      activationEntityId: input.activationEntityId,
      description: "Referral activated and eligible rewards were created.",
    });

    return {
      success: true,
      activated: rewards.length > 0,
      referralId: referral.id,
      rewards,
    };
  });
}

export async function creditReferralRewardToSavingsAccount(
  input: CreditReferralRewardInput,
) {
  return prisma.$transaction(async (tx) => {
    const reward = await findReferralRewardById(tx, input.rewardId);

    if (!reward) {
      return {
        success: false,
        credited: false,
        reason: "REWARD_NOT_FOUND",
      };
    }

    if (reward.userId !== input.userId) {
      return {
        success: false,
        credited: false,
        reason: "REWARD_USER_MISMATCH",
      };
    }

    if (reward.status === ReferralRewardStatus.CREDITED) {
      return {
        success: true,
        credited: false,
        alreadyCredited: true,
        rewardId: reward.id,
      };
    }

    if (!reward.referralId) {
      return {
        success: false,
        credited: false,
        reason: "REFERRAL_NOT_FOUND",
      };
    }

    if (!isPositiveAmount(reward.amount)) {
      return {
        success: false,
        credited: false,
        reason: "INVALID_REWARD_AMOUNT",
      };
    }

    let destination: Extract<
      RewardDestination,
      { kind: "SAVINGS_ACCOUNT" }
    > | null = null;

    if (input.savingsAccountId) {
      const account = await tx.savingsAccount.findUnique({
        where: {
          id: input.savingsAccountId,
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
        account &&
        account.investorProfile.userId === input.userId &&
        account.currency === reward.currency
      ) {
        destination = {
          kind: "SAVINGS_ACCOUNT",
          savingsAccountId: account.id,
          currency: account.currency,
          label: `Savings account: ${account.name}`,
          savingsAccount: account,
        };
      }
    }

    if (!destination) {
      const resolved = await resolveRewardDestination(tx, input.userId);

      if (
        resolved?.kind === "SAVINGS_ACCOUNT" &&
        resolved.currency === reward.currency
      ) {
        destination = resolved;
      }
    }

    if (!destination) {
      await writeReferralAudit(tx, {
        action: "REFERRAL_REWARD_PENDING_DESTINATION",
        referralId: reward.referralId,
        rewardId: reward.id,
        rewardType: reward.type,
        userId: reward.userId,
        amount: reward.amount,
        currency: reward.currency,
        destinationType: "NONE",
        destinationId: null,
        activationType:
          reward.referral?.activatedBy ??
          ReferralActivationType.INVESTMENT_ORDER_CONFIRMED,
        activationEntityId: reward.referral?.activatedByEntityId ?? null,
        description:
          "Referral reward is pending because no eligible savings destination was found.",
      });

      return {
        success: false,
        credited: false,
        reason: "SAVINGS_ACCOUNT_NOT_FOUND",
      };
    }

    const creditedAt = new Date();

    const claimed = await claimReferralReward(tx, reward, creditedAt);

    if (!claimed) {
      return {
        success: true,
        credited: false,
        alreadyCredited: true,
        rewardId: reward.id,
      };
    }

    const rewardAmount = decimal(reward.amount);
    const balanceBefore = decimal(destination.savingsAccount.balance);
    const balanceAfter = balanceBefore.add(rewardAmount);

    await tx.savingsAccount.update({
      where: {
        id: destination.savingsAccountId,
      },
      data: {
        balance: balanceAfter,
      },
    });

    const transaction = await tx.savingsTransaction.create({
      data: {
        savingsAccountId: destination.savingsAccountId,
        type: SavingsTransactionType.ADJUSTMENT,
        amount: rewardAmount,
        currency: reward.currency,
        balanceBefore,
        balanceAfter,
        reference: `REFERRAL:${reward.id}`,
        note: "Referral Reward",
        metadata: {
          source: RewardSource.USER_REFERRAL,
          rewardId: reward.id,
          referralId: reward.referralId,
          rewardType: reward.type,
        },
      },
    });

    await setRewardDestination(tx, reward.id, destination);

    await syncReferralStatusInTransaction(tx, reward.referralId);

    await upsertRewardNotification(tx, {
      userId: reward.userId,
      key: referralNotificationKey(reward.id, "credited-savings"),
      title: "Referral reward credited",
      message: `Your ${rewardAmount.toNumber().toLocaleString()} ${reward.currency} referral reward has been credited to your savings account.`,
      link: "/account/dashboard/user/savings",
      metadata: {
        source: RewardSource.USER_REFERRAL,
        referralId: reward.referralId,
        rewardId: reward.id,
        rewardType: reward.type,
        amount: reward.amount.toString(),
        currency: reward.currency,
        destinationType: RewardDestinationType.SAVINGS_ACCOUNT,
        destinationId: destination.savingsAccountId,
      },
    });

    await writeReferralAudit(tx, {
      action: "REFERRAL_REWARD_CREDITED",
      referralId: reward.referralId,
      rewardId: reward.id,
      rewardType: reward.type,
      userId: reward.userId,
      amount: reward.amount,
      currency: reward.currency,
      destinationType: destination.kind,
      destinationId: destination.savingsAccountId,
      activationType:
        reward.referral?.activatedBy ??
        ReferralActivationType.INVESTMENT_ORDER_CONFIRMED,
      activationEntityId: reward.referral?.activatedByEntityId ?? null,
      description: "Referral reward credited to a savings account.",
    });

    return {
      success: true,
      credited: true,
      rewardId: reward.id,
      transactionId: transaction.id,
      amount: rewardAmount.toString(),
    };
  });
}

export async function creditReferralRewardToInvestment(
  input: CreditReferralRewardInput & {
    adjustedByUserId: string;
  },
) {
  return prisma.$transaction(async (tx) => {
    const reward = await findReferralRewardById(tx, input.rewardId);

    if (!reward) {
      return {
        success: false,
        credited: false,
        reason: "REWARD_NOT_FOUND",
      };
    }

    if (reward.userId !== input.userId) {
      return {
        success: false,
        credited: false,
        reason: "REWARD_USER_MISMATCH",
      };
    }

    if (reward.status === ReferralRewardStatus.CREDITED) {
      return {
        success: true,
        credited: false,
        alreadyCredited: true,
        rewardId: reward.id,
      };
    }

    if (!reward.referralId) {
      return {
        success: false,
        credited: false,
        reason: "REFERRAL_NOT_FOUND",
      };
    }

    if (!isPositiveAmount(reward.amount)) {
      return {
        success: false,
        credited: false,
        reason: "INVALID_REWARD_AMOUNT",
      };
    }

    let destination: Extract<
      RewardDestination,
      { kind: "INVESTMENT_ORDER" }
    > | null = null;

    if (input.investmentOrderId) {
      const order = await tx.investmentOrder.findUnique({
        where: {
          id: input.investmentOrderId,
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
        order &&
        order.investorProfile.userId === input.userId &&
        order.currency === reward.currency &&
        order.investmentAccount.currency === reward.currency
      ) {
        destination = {
          kind: "INVESTMENT_ORDER",
          investmentOrderId: order.id,
          investmentAccountId: order.investmentAccount.id,
          currency: order.currency,
          label: `Investment order: ${order.investmentPlan.name}`,
          investmentOrder: order,
        };
      }
    }

    if (!destination) {
      const resolved = await resolveRewardDestination(tx, input.userId);

      if (
        resolved?.kind === "INVESTMENT_ORDER" &&
        resolved.currency === reward.currency &&
        resolved.investmentOrder.investmentAccount.currency === reward.currency
      ) {
        destination = resolved;
      }
    }

    if (!destination) {
      await writeReferralAudit(tx, {
        action: "REFERRAL_REWARD_PENDING_DESTINATION",
        referralId: reward.referralId,
        rewardId: reward.id,
        rewardType: reward.type,
        userId: reward.userId,
        amount: reward.amount,
        currency: reward.currency,
        destinationType: "NONE",
        destinationId: null,
        activationType:
          reward.referral?.activatedBy ??
          ReferralActivationType.INVESTMENT_ORDER_CONFIRMED,
        activationEntityId: reward.referral?.activatedByEntityId ?? null,
        description:
          "Referral reward is pending because no eligible investment destination was found.",
      });

      return {
        success: false,
        credited: false,
        reason: "INVESTMENT_ORDER_NOT_FOUND",
      };
    }

    const creditedAt = new Date();

    const claimed = await claimReferralReward(tx, reward, creditedAt);

    if (!claimed) {
      return {
        success: true,
        credited: false,
        alreadyCredited: true,
        rewardId: reward.id,
      };
    }

    const rewardAmount = decimal(reward.amount);

    const currentValue = destination.investmentOrder.currentValue;

    const investmentValueBefore =
      currentValue && decimal(currentValue).greaterThan(0)
        ? decimal(currentValue)
        : decimal(destination.investmentOrder.amount);

    const nextInvestmentValue = investmentValueBefore.add(rewardAmount);

    const accountBalanceBefore = decimal(
      destination.investmentOrder.investmentAccount.balance,
    );

    const accountBalanceAfter = accountBalanceBefore.add(rewardAmount);

    const earningsBefore = decimal(destination.investmentOrder.accruedProfit);

    const earningsAfter =
      destination.investmentOrder.investmentModel === InvestmentModel.FIXED
        ? earningsBefore.add(rewardAmount)
        : earningsBefore;

    await tx.investmentAccount.update({
      where: {
        id: destination.investmentAccountId,
      },
      data: {
        balance: accountBalanceAfter,
      },
    });

    await tx.investmentOrder.update({
      where: {
        id: destination.investmentOrderId,
      },
      data:
        destination.investmentOrder.investmentModel === InvestmentModel.FIXED
          ? {
              accruedProfit: earningsAfter,
            }
          : {
              currentValue: nextInvestmentValue,
            },
    });

    const adjustment = await tx.investmentOrderAdjustment.create({
      data: {
        reference: `REFERRAL_BONUS:${reward.id}`,
        investmentOrderId: destination.investmentOrderId,
        adjustedByUserId: input.adjustedByUserId,
        direction: InvestmentOrderAdjustmentDirection.ADD,
        amount: rewardAmount,
        earningsBefore,
        earningsAfter,
        balanceBefore: accountBalanceBefore,
        balanceAfter: accountBalanceAfter,
        currency: reward.currency,
        reason: "Referral Reward",
        metadata: {
          source: RewardSource.USER_REFERRAL,
          rewardId: reward.id,
          referralId: reward.referralId,
          rewardType: reward.type,
          amount: reward.amount.toString(),
          currency: reward.currency,
          destinationType: RewardDestinationType.INVESTMENT_ORDER,
          destinationId: destination.investmentOrderId,
          activationType:
            reward.referral?.activatedBy ??
            ReferralActivationType.INVESTMENT_ORDER_CONFIRMED,
          activationEntityId: reward.referral?.activatedByEntityId ?? null,
          adjustedByUserId: input.adjustedByUserId,
        },
      },
    });

    await setRewardDestination(tx, reward.id, destination);

    await syncReferralStatusInTransaction(tx, reward.referralId);

    await upsertRewardNotification(tx, {
      userId: reward.userId,
      key: referralNotificationKey(reward.id, "credited-investment"),
      title: "Referral reward credited",
      message: `Your ${rewardAmount.toNumber().toLocaleString()} ${reward.currency} referral reward has been credited to your investment order.`,
      link: "/account/dashboard/user/investment-orders",
      metadata: {
        source: RewardSource.USER_REFERRAL,
        referralId: reward.referralId,
        rewardId: reward.id,
        rewardType: reward.type,
        amount: reward.amount.toString(),
        currency: reward.currency,
        destinationType: RewardDestinationType.INVESTMENT_ORDER,
        destinationId: destination.investmentOrderId,
      },
    });

    await writeReferralAudit(tx, {
      action: "REFERRAL_REWARD_CREDITED",
      referralId: reward.referralId,
      rewardId: reward.id,
      rewardType: reward.type,
      userId: reward.userId,
      amount: reward.amount,
      currency: reward.currency,
      destinationType: destination.kind,
      destinationId: destination.investmentOrderId,
      activationType:
        reward.referral?.activatedBy ??
        ReferralActivationType.INVESTMENT_ORDER_CONFIRMED,
      activationEntityId: reward.referral?.activatedByEntityId ?? null,
      description: "Referral reward credited to an investment order.",
    });

    return {
      success: true,
      credited: true,
      rewardId: reward.id,
      adjustmentId: adjustment.id,
      amount: rewardAmount.toString(),
    };
  });
}

export async function creditPendingReferralRewardForUser(
  input: CreditPendingReferralRewardsInput,
) {
  const pendingRewards = (await prisma.referralReward.findMany({
    where: {
      userId: input.userId,
      source: RewardSource.USER_REFERRAL,
      status: ReferralRewardStatus.PENDING,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      referralId: true,
      userId: true,
      type: true,
      status: true,
      amount: true,
      currency: true,
      creditedAt: true,
      referral: {
        select: {
          id: true,
          referrerUserId: true,
          referredUserId: true,
          code: true,
          status: true,
          rewardCurrency: true,
          referrerRewardAmount: true,
          referredRewardAmount: true,
          activatedBy: true,
          activatedByEntityId: true,
          activatedAt: true,
          rewardedAt: true,
        },
      },
    },
  })) as ReferralRewardRow[];

  type CreditReferralRewardResult = {
    success: boolean;
    credited: boolean;
    rewardId?: string;
    reason?: string;
    alreadyCredited?: boolean;
    transactionId?: string;
    adjustmentId?: string;
    amount?: string;
  };

  const results: CreditReferralRewardResult[] = [];

  for (const reward of pendingRewards) {
    if (input.savingsAccountId) {
      results.push(
        await creditReferralRewardToSavingsAccount({
          rewardId: reward.id,
          userId: input.userId,
          savingsAccountId: input.savingsAccountId,
        }),
      );

      continue;
    }

    if (input.investmentOrderId) {
      results.push(
        await creditReferralRewardToInvestment({
          rewardId: reward.id,
          userId: input.userId,
          investmentOrderId: input.investmentOrderId,
          adjustedByUserId: input.adjustedByUserId,
        }),
      );

      continue;
    }

    const destination = await prisma.$transaction((tx) =>
      resolveRewardDestination(tx, input.userId),
    );

    if (!destination) {
      results.push({
        success: false,
        rewardId: reward.id,
        credited: false,
        reason: "No eligible destination found",
      });

      continue;
    }

    if (destination.kind === "SAVINGS_ACCOUNT") {
      results.push(
        await creditReferralRewardToSavingsAccount({
          rewardId: reward.id,
          userId: input.userId,
          savingsAccountId: destination.savingsAccountId,
        }),
      );

      continue;
    }

    results.push(
      await creditReferralRewardToInvestment({
        rewardId: reward.id,
        userId: input.userId,
        investmentOrderId: destination.investmentOrderId,
        adjustedByUserId: input.adjustedByUserId,
      }),
    );
  }

  return {
    success: true,
    processed: results.length,
    results,
  };
}

export async function syncReferralStatus(referralId: string) {
  return prisma.$transaction((tx) =>
    syncReferralStatusInTransaction(tx, referralId),
  );
}
