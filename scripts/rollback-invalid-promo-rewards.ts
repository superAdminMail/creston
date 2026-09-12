import "dotenv/config";

import {
  InvestmentModel,
  InvestmentOrderAdjustmentDirection,
  ReferralActivationType,
  ReferralRewardStatus,
  ReferralRewardType,
  RewardDestinationType,
  RewardSource,
  SavingsTransactionType,
} from "@/generated/prisma";
import { Prisma } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

const APPLY = process.env.APPLY === "true";

type RollbackCandidate = {
  rewardId: string;
  userId: string;
  amount: Prisma.Decimal;
  currency: string;
  promotionCampaignId: string | null;
  activationType: ReferralActivationType | null;
  activationEntityId: string | null;
  destinationType: RewardDestinationType | null;
  destinationId: string | null;
  reason: string;
};

function decimalEquals(
  left: Prisma.Decimal | null | undefined,
  right: Prisma.Decimal | null | undefined,
) {
  if (left == null || right == null) {
    return left == null && right == null;
  }

  return left.eq(right);
}

async function findInvalidPromoRewards(): Promise<RollbackCandidate[]> {
  const rewards = await prisma.referralReward.findMany({
    where: {
      source: RewardSource.PLATFORM_PROMOTION,
      type: ReferralRewardType.PROMOTION_BONUS,
      status: ReferralRewardStatus.CREDITED,
    },
    select: {
      id: true,
      userId: true,
      amount: true,
      currency: true,
      promotionCampaignId: true,
      creditedAt: true,
      activatedBy: true,
      activatedByEntityId: true,
      destinationType: true,
      destinationId: true,
      promotionCampaign: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      creditedAt: "asc",
    },
  });

  const candidates: RollbackCandidate[] = [];

  for (const reward of rewards) {
    if (!reward.activatedBy || !reward.activatedByEntityId) {
      continue;
    }

    if (
      reward.activatedBy === ReferralActivationType.INVESTMENT_ORDER_CONFIRMED
    ) {
      const order = await prisma.investmentOrder.findUnique({
        where: {
          id: reward.activatedByEntityId,
        },
        select: {
          id: true,
          promotionCampaignId: true,
        },
      });

      if (!order) {
        candidates.push({
          rewardId: reward.id,
          userId: reward.userId,
          amount: reward.amount,
          currency: reward.currency,
          promotionCampaignId: reward.promotionCampaignId,
          activationType: reward.activatedBy,
          activationEntityId: reward.activatedByEntityId,
          destinationType: reward.destinationType,
          destinationId: reward.destinationId,
          reason: "The investment order used for activation no longer exists.",
        });

        continue;
      }

      if (
        reward.promotionCampaignId &&
        reward.promotionCampaignId === order.promotionCampaignId
      ) {
        continue;
      }

      candidates.push({
        rewardId: reward.id,
        userId: reward.userId,
        amount: reward.amount,
        currency: reward.currency,
        promotionCampaignId: reward.promotionCampaignId,
        activationType: reward.activatedBy,
        activationEntityId: reward.activatedByEntityId,
        destinationType: reward.destinationType,
        destinationId: reward.destinationId,
        reason: order.promotionCampaignId
          ? `Reward campaign ${reward.promotionCampaignId} was credited from investment order campaign ${order.promotionCampaignId}.`
          : "Promotion reward was credited from an investment order that had no promotion campaign.",
      });

      continue;
    }

    if (
      reward.activatedBy === ReferralActivationType.SAVINGS_DEPOSIT_CONFIRMED
    ) {
      candidates.push({
        rewardId: reward.id,
        userId: reward.userId,
        amount: reward.amount,
        currency: reward.currency,
        promotionCampaignId: reward.promotionCampaignId,
        activationType: reward.activatedBy,
        activationEntityId: reward.activatedByEntityId,
        destinationType: reward.destinationType,
        destinationId: reward.destinationId,
        reason:
          "Promotion reward was credited from a savings deposit confirmation.",
      });
    }
  }

  return candidates;
}

async function rollbackSavingsReward(
  tx: Prisma.TransactionClient,
  candidate: RollbackCandidate,
) {
  if (
    candidate.destinationType !== RewardDestinationType.SAVINGS_ACCOUNT ||
    !candidate.destinationId
  ) {
    return {
      rolledBack: false,
      reason: "Missing savings destination.",
    };
  }

  const savingsAccount = await tx.savingsAccount.findUnique({
    where: {
      id: candidate.destinationId,
    },
    select: {
      id: true,
      balance: true,
      currency: true,
    },
  });

  if (!savingsAccount) {
    return {
      rolledBack: false,
      reason: "Savings account no longer exists.",
    };
  }

  const originalTransaction = await tx.savingsTransaction.findFirst({
    where: {
      savingsAccountId: savingsAccount.id,
      reference: `PROMO_BONUS:${candidate.rewardId}`,
      type: SavingsTransactionType.ADJUSTMENT,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!originalTransaction) {
    return {
      rolledBack: false,
      reason: "Original promotion ledger entry was not found.",
    };
  }

  const latestTransaction = await tx.savingsTransaction.findFirst({
    where: {
      savingsAccountId: savingsAccount.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
    },
  });

  if (latestTransaction?.id !== originalTransaction.id) {
    return {
      rolledBack: false,
      reason:
        "The savings account has later transactions. Manual review required.",
    };
  }

  if (
    !decimalEquals(savingsAccount.balance, originalTransaction.balanceAfter)
  ) {
    return {
      rolledBack: false,
      reason:
        "Current savings balance no longer matches the balance immediately after the reward.",
    };
  }

  const balanceBefore = savingsAccount.balance;
  const balanceAfter = balanceBefore.sub(candidate.amount);

  if (balanceAfter.lessThan(0)) {
    return {
      rolledBack: false,
      reason: "Rollback would create a negative savings balance.",
    };
  }

  if (!APPLY) {
    return {
      rolledBack: true,
      reason: "Dry run.",
    };
  }

  await tx.savingsAccount.update({
    where: {
      id: savingsAccount.id,
    },
    data: {
      balance: balanceAfter,
    },
  });

  await tx.savingsTransaction.create({
    data: {
      savingsAccountId: savingsAccount.id,
      type: SavingsTransactionType.ADJUSTMENT,
      amount: candidate.amount.neg(),
      currency: candidate.currency,
      balanceBefore,
      balanceAfter,
      reference: `PROMO_BONUS_ROLLBACK:${candidate.rewardId}`,
      note: "Reversal of invalid promotion reward credit.",
      metadata: {
        source: RewardSource.PLATFORM_PROMOTION,
        rewardId: candidate.rewardId,
        promotionCampaignId: candidate.promotionCampaignId,
        activationType: candidate.activationType,
        activationEntityId: candidate.activationEntityId,
        rollback: true,
        rollbackReason: candidate.reason,
      },
    },
  });

  return {
    rolledBack: true,
    reason: "Savings reward credit reversed.",
  };
}

async function rollbackInvestmentReward(
  tx: Prisma.TransactionClient,
  candidate: RollbackCandidate,
) {
  if (
    candidate.destinationType !== RewardDestinationType.INVESTMENT_ORDER ||
    !candidate.destinationId
  ) {
    return {
      rolledBack: false,
      reason: "Missing investment destination.",
    };
  }

  const investmentOrder = await tx.investmentOrder.findUnique({
    where: {
      id: candidate.destinationId,
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
        },
      },
    },
  });

  if (!investmentOrder || !investmentOrder.investmentAccount) {
    return {
      rolledBack: false,
      reason: "Investment order or investment account no longer exists.",
    };
  }

  const originalAdjustment = await tx.investmentOrderAdjustment.findUnique({
    where: {
      reference: `PROMO_BONUS:${candidate.rewardId}`,
    },
  });

  if (!originalAdjustment) {
    return {
      rolledBack: false,
      reason: "Original promotion adjustment was not found.",
    };
  }

  const latestAdjustment = await tx.investmentOrderAdjustment.findFirst({
    where: {
      investmentOrderId: investmentOrder.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
    },
  });

  if (latestAdjustment?.id !== originalAdjustment.id) {
    return {
      rolledBack: false,
      reason:
        "The investment order has later adjustments. Manual review required.",
    };
  }

  if (
    !decimalEquals(
      investmentOrder.investmentAccount.balance,
      originalAdjustment.balanceAfter,
    )
  ) {
    return {
      rolledBack: false,
      reason:
        "Current investment account balance no longer matches the balance immediately after the reward.",
    };
  }

  const balanceBefore = investmentOrder.investmentAccount.balance;
  const balanceAfter = balanceBefore.sub(candidate.amount);

  if (balanceAfter.lessThan(0)) {
    return {
      rolledBack: false,
      reason: "Rollback would create a negative investment account balance.",
    };
  }

  const earningsBefore = investmentOrder.accruedProfit;

  let earningsAfter = earningsBefore;

  if (investmentOrder.investmentModel === InvestmentModel.FIXED) {
    earningsAfter = earningsBefore.sub(candidate.amount);

    if (earningsAfter.lessThan(0)) {
      return {
        rolledBack: false,
        reason: "Rollback would create negative accrued investment earnings.",
      };
    }
  }

  let currentValueAfter = investmentOrder.currentValue;

  if (investmentOrder.investmentModel === InvestmentModel.MARKET) {
    if (currentValueAfter == null) {
      return {
        rolledBack: false,
        reason: "Market investment has no current value.",
      };
    }

    currentValueAfter = currentValueAfter.sub(candidate.amount);

    if (currentValueAfter.lessThan(0)) {
      return {
        rolledBack: false,
        reason: "Rollback would create negative investment value.",
      };
    }
  }

  if (!APPLY) {
    return {
      rolledBack: true,
      reason: "Dry run.",
    };
  }

  await tx.investmentAccount.update({
    where: {
      id: investmentOrder.investmentAccount.id,
    },
    data: {
      balance: balanceAfter,
    },
  });

  await tx.investmentOrder.update({
    where: {
      id: investmentOrder.id,
    },
    data:
      investmentOrder.investmentModel === InvestmentModel.FIXED
        ? {
            accruedProfit: earningsAfter,
          }
        : {
            currentValue: currentValueAfter,
          },
  });

  await tx.investmentOrderAdjustment.create({
    data: {
      reference: `PROMO_BONUS_ROLLBACK:${candidate.rewardId}`,
      investmentOrderId: investmentOrder.id,
      adjustedByUserId: await getRollbackActorId(tx),
      direction: InvestmentOrderAdjustmentDirection.DEDUCT,
      amount: candidate.amount,
      earningsBefore,
      earningsAfter,
      balanceBefore,
      balanceAfter,
      currency: candidate.currency,
      reason: "Invalid Promotion Reward Reversal",
      metadata: {
        source: RewardSource.PLATFORM_PROMOTION,
        rewardId: candidate.rewardId,
        promotionCampaignId: candidate.promotionCampaignId,
        activationType: candidate.activationType,
        activationEntityId: candidate.activationEntityId,
        rollback: true,
        rollbackReason: candidate.reason,
      },
    },
  });

  return {
    rolledBack: true,
    reason: "Investment promotion reward credit reversed.",
  };
}

async function getRollbackActorId(tx: Prisma.TransactionClient) {
  const admin = await tx.user.findFirst({
    where: {
      role: {
        in: ["SUPER_ADMIN", "ADMIN"],
      },
    },
    select: {
      id: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!admin) {
    throw new Error(
      "No ADMIN or SUPER_ADMIN user exists. Cannot create investment rollback adjustment.",
    );
  }

  return admin.id;
}

async function rollbackReward(candidate: RollbackCandidate) {
  return prisma.$transaction(async (tx) => {
    const freshReward = await tx.referralReward.findUnique({
      where: {
        id: candidate.rewardId,
      },
      select: {
        id: true,
        status: true,
        amount: true,
        userId: true,
        promotionCampaignId: true,
        activatedBy: true,
        activatedByEntityId: true,
        destinationType: true,
        destinationId: true,
      },
    });

    if (!freshReward) {
      return {
        rolledBack: false,
        reason: "Reward no longer exists.",
      };
    }

    if (freshReward.status !== ReferralRewardStatus.CREDITED) {
      return {
        rolledBack: false,
        reason: "Reward is no longer credited. Nothing to rollback.",
      };
    }

    if (
      freshReward.promotionCampaignId !== candidate.promotionCampaignId ||
      freshReward.userId !== candidate.userId
    ) {
      return {
        rolledBack: false,
        reason: "Reward changed since scan.",
      };
    }

    const liveCandidate: RollbackCandidate = {
      ...candidate,
      amount: freshReward.amount,
      promotionCampaignId: freshReward.promotionCampaignId,
      activationType: freshReward.activatedBy,
      activationEntityId: freshReward.activatedByEntityId,
      destinationType: freshReward.destinationType,
      destinationId: freshReward.destinationId,
    };

    const result =
      liveCandidate.destinationType === RewardDestinationType.SAVINGS_ACCOUNT
        ? await rollbackSavingsReward(tx, liveCandidate)
        : liveCandidate.destinationType ===
            RewardDestinationType.INVESTMENT_ORDER
          ? await rollbackInvestmentReward(tx, liveCandidate)
          : {
              rolledBack: false,
              reason: "Unknown reward destination.",
            };

    if (!result.rolledBack || !APPLY) {
      return result;
    }

    await tx.referralReward.update({
      where: {
        id: liveCandidate.rewardId,
      },
      data: {
        status: ReferralRewardStatus.PENDING,
        creditedAt: null,
        activatedAt: null,
        activatedBy: null,
        activatedByEntityId: null,
        destinationId: null,
        destinationType: null,
      },
    });

    await tx.notification.updateMany({
      where: {
        key: {
          in: [
            `promo-reward:${liveCandidate.rewardId}:credited-savings`,
            `promo-reward:${liveCandidate.rewardId}:credited-investment`,
          ],
        },
      },
      data: {
        title: "Promotion reward pending",
        message:
          "Your promotional reward is pending until the qualifying investment is confirmed.",
        link: "/account/dashboard",
        metadata: {
          source: RewardSource.PLATFORM_PROMOTION,
          rewardId: liveCandidate.rewardId,
          promotionCampaignId: liveCandidate.promotionCampaignId,
          status: "PENDING",
          rollback: true,
        },
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: liveCandidate.userId,
        action: "PROMOTION_REWARD_ROLLED_BACK",
        entityType: "ReferralReward",
        entityId: liveCandidate.rewardId,
        description:
          "Invalid cross-campaign promotion reward credit was reversed and the reward was returned to pending status.",
        metadata: {
          source: RewardSource.PLATFORM_PROMOTION,
          rewardId: liveCandidate.rewardId,
          promotionCampaignId: liveCandidate.promotionCampaignId,
          amount: liveCandidate.amount.toString(),
          currency: liveCandidate.currency,
          activationType: liveCandidate.activationType,
          activationEntityId: liveCandidate.activationEntityId,
          destinationType: liveCandidate.destinationType,
          destinationId: liveCandidate.destinationId,
          reason: liveCandidate.reason,
          rollback: true,
        },
      },
    });

    return result;
  });
}

async function main() {
  console.log(
    APPLY
      ? "⚠️ APPLY=true — invalid promotion rewards WILL be rolled back."
      : "🔎 DRY RUN — no database changes will be made.",
  );

  const candidates = await findInvalidPromoRewards();

  console.log(`Found ${candidates.length} invalid promotion reward(s).`);

  let rolledBack = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    console.log(
      `\nReward ${candidate.rewardId} | user=${candidate.userId} | amount=${candidate.amount.toString()} ${candidate.currency}`,
    );
    console.log(`Reason: ${candidate.reason}`);

    try {
      const result = await rollbackReward(candidate);

      console.log(
        result.rolledBack
          ? `✓ ${result.reason}`
          : `- SKIPPED: ${result.reason}`,
      );

      if (result.rolledBack) {
        rolledBack += 1;
      } else {
        skipped += 1;
      }
    } catch (error) {
      skipped += 1;
      console.error("✗ ERROR:", error);
    }
  }

  console.log("\n----------------------------------------");
  console.log(`Candidates: ${candidates.length}`);
  console.log(`Processed:  ${rolledBack}`);
  console.log(`Skipped:    ${skipped}`);
  console.log(`Mode:       ${APPLY ? "APPLY" : "DRY RUN"}`);
  console.log("----------------------------------------");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
