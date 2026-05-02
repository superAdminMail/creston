"use server";

import {
  InvestmentModel,
  InvestmentOrderStatus,
  Prisma,
  ReferralActivationType,
  ReferralRewardStatus,
  ReferralRewardType,
  ReferralStatus,
  RewardSource,
  SavingsStatus,
  SavingsTransactionType,
  UserAccountStatus,
} from "@/generated/prisma";

import { formatCurrency } from "@/lib/formatters/formatters";
import { upsertSystemNotifications } from "@/lib/notifications/upsertSystemNotifications";
import { prisma } from "@/lib/prisma";
import { toDecimal } from "@/lib/services/investment/decimal";

const REFERRAL_REWARD_AMOUNT = toDecimal(100);
const REFERRAL_CURRENCY = "USD";

type ReferralRewardRow = {
  id: string;
  referralId: string;
  userId: string;
  type: ReferralRewardType;
  status: ReferralRewardStatus;
  amount: Prisma.Decimal;
  currency: string;
  creditedAt: Date | null;
  referral: {
    id: string;
    referrerUserId: string;
    referredUserId: string;
    code: string;
    status: ReferralStatus;
    rewardCurrency: string;
    referrerRewardAmount: Prisma.Decimal;
    referredRewardAmount: Prisma.Decimal;
    activatedBy: ReferralActivationType | null;
    activatedByEntityId: string | null;
    activatedAt: Date | null;
    rewardedAt: Date | null;
  };
};

type RewardDestination =
  | {
      kind: "SAVINGS_ACCOUNT";
      savingsAccountId: string;
      currency: string;
      label: string;
      savingsAccount: {
        id: string;
        name: string;
        balance: Prisma.Decimal;
        currency: string;
        investorProfile: {
          userId: string;
        };
      };
    }
  | {
      kind: "INVESTMENT_ORDER";
      investmentOrderId: string;
      investmentAccountId: string;
      currency: string;
      label: string;
      investmentOrder: {
        id: string;
        investmentModel: InvestmentModel;
        amount: Prisma.Decimal;
        accruedProfit: Prisma.Decimal;
        currentValue: Prisma.Decimal | null;
        currency: string;
        investmentAccount: {
          id: string;
          balance: Prisma.Decimal;
          currency: string;
        };
        investmentPlan: {
          name: string;
        };
        investorProfile: {
          userId: string;
        };
      };
    };

type ReferralRewardCreditInput = {
  referral: ReferralRewardRow["referral"];
  reward: {
    id: string;
    referralId: string;
    userId: string;
    type: ReferralRewardType;
    status: ReferralRewardStatus;
    amount: Prisma.Decimal;
    currency: string;
    creditedAt: Date | null;
  };
  amount: Prisma.Decimal;
  destination: RewardDestination;
  source: "REFERRAL";
  activationType: ReferralActivationType;
  activationEntityId: string | null;
  rewardedAt: Date;
};

type ReferralStatusCheck = {
  isDeleted: boolean;
  deletedAt: Date | null;
  scheduledDeletionAt: Date | null;
  accountStatus: UserAccountStatus;
  emailVerified: boolean;
};

type PlatformPromoRewardRow = {
  id: string;
  referralId: string | null;
  promotionCampaignId: string | null;
  userId: string;
  source: RewardSource;
  type: ReferralRewardType;
  status: ReferralRewardStatus;
  amount: Prisma.Decimal;
  currency: string;
  creditedAt: Date | null;
  promotionCampaign: {
    id: string;
    promoCode: string | null;
    rewardAmount: Prisma.Decimal;
    rewardCurrency: string;
  } | null;
};

async function canReceiveReferralReward(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: {
      isDeleted: true,
      deletedAt: true,
      scheduledDeletionAt: true,
      accountStatus: true,
      emailVerified: true,
    },
  });

  if (!user) return false;

  const statusCheck: ReferralStatusCheck = user;

  if (
    statusCheck.isDeleted ||
    statusCheck.deletedAt ||
    statusCheck.scheduledDeletionAt
  ) {
    return false;
  }

  if (statusCheck.accountStatus !== UserAccountStatus.ACTIVE) {
    return false;
  }

  return statusCheck.emailVerified;
}

function referralNotificationKey(rewardId: string, suffix: string) {
  return `referral-reward:${rewardId}:${suffix}`;
}

function promoRewardNotificationKey(rewardId: string, suffix: string) {
  return `promo-reward:${rewardId}:${suffix}`;
}

async function upsertReferralNotification(tx: Prisma.TransactionClient, input: {
  userId: string;
  key: string;
  title: string;
  message: string;
  link: string;
  metadata: Prisma.InputJsonValue;
}) {
  await upsertSystemNotifications(tx, [
    {
      userId: input.userId,
      key: input.key,
      title: input.title,
      message: input.message,
      link: input.link,
      metadata: input.metadata,
    },
  ]);
}

async function writeReferralAudit(
  tx: Prisma.TransactionClient,
  input: {
    action: "REFERRAL_ACTIVATED" | "REFERRAL_REWARD_CREDITED" | "REFERRAL_REWARD_PENDING_DESTINATION";
    referralId: string;
    rewardId?: string | null;
    rewardType?: ReferralRewardType | null;
    userId: string;
    amount: Prisma.Decimal;
    currency: string;
    destinationType: RewardDestination["kind"] | "NONE";
    destinationId: string | null;
    activationType: ReferralActivationType;
    activationEntityId: string | null;
    description: string;
  },
) {
  await tx.auditLog.create({
    data: {
      actorUserId: input.userId,
      action: input.action,
      entityType: "Referral",
      entityId: input.referralId,
      description: input.description,
      metadata: {
        referralId: input.referralId,
        rewardId: input.rewardId ?? null,
        rewardType: input.rewardType ?? null,
        userId: input.userId,
        amount: input.amount.toString(),
        currency: input.currency,
        destinationType: input.destinationType,
        destinationId: input.destinationId,
        activationType: input.activationType,
        activationEntityId: input.activationEntityId,
        source: "REFERRAL",
      },
    },
  });
}

async function writeRewardAudit(
  tx: Prisma.TransactionClient,
  input: {
    action:
      | "PLATFORM_PROMO_REWARD_RESERVED"
      | "REWARD_ACTIVATION_ATTEMPTED"
      | "REWARD_CREDITED"
      | "REWARD_PENDING_DESTINATION";
    reward: PlatformPromoRewardRow;
    userId: string;
    amount: Prisma.Decimal;
    currency: string;
    destinationType: RewardDestination["kind"] | "NONE";
    destinationId: string | null;
    activationType: ReferralActivationType;
    activationEntityId: string | null;
    description: string;
  },
) {
  await tx.auditLog.create({
    data: {
      actorUserId: input.userId,
      action: input.action,
      entityType: "ReferralReward",
      entityId: input.reward.id,
      description: input.description,
      metadata: {
        source: input.reward.source,
        rewardId: input.reward.id,
        referralId: input.reward.referralId,
        promotionCampaignId: input.reward.promotionCampaignId,
        amount: input.amount.toString(),
        currency: input.currency,
        destinationType: input.destinationType,
        destinationId: input.destinationId,
        activationType: input.activationType,
        activationEntityId: input.activationEntityId,
      },
    },
  });
}

async function findReferralRewardByType(
  tx: Prisma.TransactionClient,
  referralId: string,
  type: ReferralRewardType,
) {
  return tx.referralReward.findUnique({
    where: {
      referralId_type: {
        referralId,
        type,
      },
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
  }) as Promise<ReferralRewardRow | null>;
}

async function createReferralRewardRow(
  tx: Prisma.TransactionClient,
  input: {
    referralId: string;
    userId: string;
    type: ReferralRewardType;
    amount: Prisma.Decimal;
    currency: string;
    status?: ReferralRewardStatus;
  },
) {
  return tx.referralReward.create({
    data: {
      referralId: input.referralId,
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      status: input.status ?? ReferralRewardStatus.PENDING,
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
  }) as Promise<ReferralRewardRow>;
}

async function ensureReferralRewardRow(
  tx: Prisma.TransactionClient,
  input: {
    referralId: string;
    userId: string;
    type: ReferralRewardType;
    amount: Prisma.Decimal;
    currency: string;
  },
) {
  const existing = await findReferralRewardByType(
    tx,
    input.referralId,
    input.type,
  );

  if (existing) {
    return existing;
  }

  return createReferralRewardRow(tx, {
    referralId: input.referralId,
    userId: input.userId,
    type: input.type,
    amount: input.amount,
    currency: input.currency,
    status: ReferralRewardStatus.PENDING,
  });
}

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
          promoCode: true,
          rewardAmount: true,
          rewardCurrency: true,
        },
      },
    },
  }) as Promise<PlatformPromoRewardRow | null>;
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
          promoCode: true,
          rewardAmount: true,
          rewardCurrency: true,
        },
      },
    },
  }) as Promise<PlatformPromoRewardRow>;
}

async function claimReferralRewardForCredit(
  tx: Prisma.TransactionClient,
  reward: ReferralRewardRow,
  creditedAt: Date,
) {
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

  const fresh = await findReferralRewardByType(
    tx,
    reward.referralId,
    reward.type,
  );

  return fresh?.status === ReferralRewardStatus.CREDITED;
}

async function claimPlatformPromoRewardForCredit(
  tx: Prisma.TransactionClient,
  reward: PlatformPromoRewardRow,
  creditedAt: Date,
) {
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
    reward.promotionCampaignId ?? "",
    reward.userId,
  );

  return fresh?.status === ReferralRewardStatus.CREDITED;
}

export async function createReferralForNewUser(params: {
  newUserId: string;
  referralCode?: string | null;
}) {
  const code = params.referralCode?.trim();

  if (!code) return null;

  const referrer = await prisma.user.findUnique({
    where: { referralCode: code },
    select: { id: true },
  });

  if (!referrer) return null;

  if (referrer.id === params.newUserId) return null;

  return prisma.referral.upsert({
    where: {
      referredUserId: params.newUserId,
    },
    update: {},
    create: {
      referrerUserId: referrer.id,
      referredUserId: params.newUserId,
      code,
      rewardCurrency: REFERRAL_CURRENCY,
      referrerRewardAmount: REFERRAL_REWARD_AMOUNT,
      referredRewardAmount: REFERRAL_REWARD_AMOUNT,
    },
  });
}

async function findActivePromotionCampaignByCode(
  tx: Prisma.TransactionClient,
  promoCode: string,
) {
  const campaign = await tx.promotionCampaign.findFirst({
    where: {
      promoCode,
      rewardEnabled: true,
      startsAt: {
        lte: new Date(),
      },
      OR: [
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            gte: new Date(),
          },
        },
      ],
    },
    select: {
      id: true,
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

export async function resolveReferralRewardDestination(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<RewardDestination | null> {
  if (!(await canReceiveReferralReward(tx, userId))) {
    return null;
  }

  const [savingsAccount, investmentOrder] = await Promise.all([
    tx.savingsAccount.findFirst({
      where: {
        investorProfile: {
          userId,
        },
        status: SavingsStatus.ACTIVE,
      },
      orderBy: {
        createdAt: "desc",
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
    }),
    tx.investmentOrder.findFirst({
      where: {
        investorProfile: {
          userId,
        },
        status: InvestmentOrderStatus.CONFIRMED,
        isWithdrawn: false,
      },
      orderBy: [
        {
          confirmedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
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
    }),
  ]);

  if (savingsAccount) {
    return {
      kind: "SAVINGS_ACCOUNT",
      savingsAccountId: savingsAccount.id,
      currency: savingsAccount.currency,
      label: `Savings account: ${savingsAccount.name}`,
      savingsAccount,
    };
  }

  if (investmentOrder) {
    return {
      kind: "INVESTMENT_ORDER",
      investmentOrderId: investmentOrder.id,
      investmentAccountId: investmentOrder.investmentAccount.id,
      currency: investmentOrder.currency,
      label: `Investment order: ${investmentOrder.investmentPlan.name}`,
      investmentOrder,
    };
  }

  return null;
}

export const resolveRewardDestinationForUser =
  resolveReferralRewardDestination;

export async function creditReferralRewardToSavingsAccount(
  tx: Prisma.TransactionClient,
  input: ReferralRewardCreditInput & {
    destination: Extract<RewardDestination, { kind: "SAVINGS_ACCOUNT" }>;
  },
) {
  const existingReward = await findReferralRewardByType(
    tx,
    input.referral.id,
    input.reward.type,
  );

  if (existingReward?.status === ReferralRewardStatus.CREDITED) {
    return { credited: false as const, reward: existingReward };
  }

  const reward =
    existingReward ??
    (await createReferralRewardRow(tx, {
      referralId: input.referral.id,
      userId: input.reward.userId,
      type: input.reward.type,
      amount: input.amount,
      currency: input.reward.currency,
      status: ReferralRewardStatus.PENDING,
    }));

  if (reward.status === ReferralRewardStatus.CREDITED) {
    return { credited: false as const, reward };
  }

  const claimed = await claimReferralRewardForCredit(tx, reward, input.rewardedAt);

  if (!claimed) {
    return { credited: false as const, reward };
  }

  const balanceBefore = toDecimal(input.destination.savingsAccount.balance);
  const balanceAfter = balanceBefore.add(input.amount);

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
      amount: input.amount,
      currency: input.reward.currency,
      balanceBefore,
      balanceAfter,
      reference: `REFERRAL_BONUS:${reward.id}`,
      note: "Referral bonus credited",
      metadata: {
        source: "REFERRAL",
        rewardType: reward.type,
        rewardId: reward.id,
        referralId: reward.referralId,
        activationType: input.activationType,
        activationEntityId: input.activationEntityId,
        destinationType: input.destination.kind,
        destinationId: input.destination.savingsAccountId,
      },
    },
  });

  await upsertReferralNotification(tx, {
    userId: reward.userId,
    key: referralNotificationKey(
      reward.id,
      reward.type === ReferralRewardType.REFERRED_BONUS
        ? "referred-credit"
        : "referrer-credit",
    ),
    title:
      reward.type === ReferralRewardType.REFERRED_BONUS
        ? "Referral bonus unlocked"
        : "Referral reward earned",
    message:
      reward.type === ReferralRewardType.REFERRED_BONUS
        ? `Your ${formatCurrency(
            input.amount.toNumber(),
            input.reward.currency,
          )} referral bonus has been credited to your savings account.`
        : `A ${formatCurrency(
            input.amount.toNumber(),
            input.reward.currency,
          )} referral reward has been credited to your savings account.`,
    link: "/account/dashboard/user/savings",
    metadata: {
      source: "REFERRAL",
      referralId: reward.referralId,
      rewardId: reward.id,
      rewardType: reward.type,
      amount: input.amount.toString(),
      currency: input.reward.currency,
      destinationType: input.destination.kind,
      destinationId: input.destination.savingsAccountId,
      activationType: input.activationType,
      activationEntityId: input.activationEntityId,
    },
  });

  await writeReferralAudit(tx, {
    action: "REFERRAL_REWARD_CREDITED",
    referralId: reward.referralId,
    rewardId: reward.id,
    rewardType: reward.type,
    userId: reward.userId,
    amount: input.amount,
    currency: input.reward.currency,
    destinationType: input.destination.kind,
    destinationId: input.destination.savingsAccountId,
    activationType: input.activationType,
    activationEntityId: input.activationEntityId,
    description: "Referral reward credited to a savings account.",
  });

  return { credited: true as const, reward };
}

export async function creditReferralRewardToInvestment(
  tx: Prisma.TransactionClient,
  input: ReferralRewardCreditInput & {
    destination: Extract<RewardDestination, { kind: "INVESTMENT_ORDER" }>;
  },
) {
  const existingReward = await findReferralRewardByType(
    tx,
    input.referral.id,
    input.reward.type,
  );

  if (existingReward?.status === ReferralRewardStatus.CREDITED) {
    return { credited: false as const, reward: existingReward };
  }

  const reward =
    existingReward ??
    (await createReferralRewardRow(tx, {
      referralId: input.referral.id,
      userId: input.reward.userId,
      type: input.reward.type,
      amount: input.amount,
      currency: input.reward.currency,
      status: ReferralRewardStatus.PENDING,
    }));

  if (reward.status === ReferralRewardStatus.CREDITED) {
    return { credited: false as const, reward };
  }

  const claimed = await claimReferralRewardForCredit(tx, reward, input.rewardedAt);

  if (!claimed) {
    return { credited: false as const, reward };
  }

  const investmentAmountBefore = toDecimal(input.destination.investmentOrder.currentValue).greaterThan(0)
    ? toDecimal(input.destination.investmentOrder.currentValue)
    : toDecimal(input.destination.investmentOrder.amount);
  const nextInvestmentValue = investmentAmountBefore.add(input.amount);
  const accountBalanceBefore = toDecimal(
    input.destination.investmentOrder.investmentAccount.balance,
  );
  const accountBalanceAfter = accountBalanceBefore.add(input.amount);

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
    data: {
      ...(input.destination.investmentOrder.investmentModel === InvestmentModel.FIXED
        ? {
            accruedProfit: {
              increment: input.amount,
            },
          }
        : {
            currentValue: nextInvestmentValue,
          }),
    },
  });

  await tx.investmentEarning.create({
    data: {
      investmentOrderId: input.destination.investmentOrderId,
      date: input.rewardedAt,
      amount: input.amount,
    },
  });

  await upsertReferralNotification(tx, {
    userId: reward.userId,
    key: referralNotificationKey(
      reward.id,
      reward.type === ReferralRewardType.REFERRED_BONUS
        ? "referred-credit"
        : "referrer-credit",
    ),
    title:
      reward.type === ReferralRewardType.REFERRED_BONUS
        ? "Referral bonus unlocked"
        : "Referral reward earned",
    message:
      reward.type === ReferralRewardType.REFERRED_BONUS
        ? `Your ${formatCurrency(
            input.amount.toNumber(),
            input.reward.currency,
          )} referral bonus has been credited to your investment order.`
        : `A ${formatCurrency(
            input.amount.toNumber(),
            input.reward.currency,
          )} referral reward has been credited to your investment order.`,
    link: "/account/dashboard/user/investment-orders",
    metadata: {
      source: "REFERRAL",
      referralId: reward.referralId,
      rewardId: reward.id,
      rewardType: reward.type,
      amount: input.amount.toString(),
      currency: input.reward.currency,
      destinationType: input.destination.kind,
      destinationId: input.destination.investmentOrderId,
      activationType: input.activationType,
      activationEntityId: input.activationEntityId,
    },
  });

  await writeReferralAudit(tx, {
    action: "REFERRAL_REWARD_CREDITED",
    referralId: reward.referralId,
    rewardId: reward.id,
    rewardType: reward.type,
    userId: reward.userId,
    amount: input.amount,
    currency: input.reward.currency,
    destinationType: input.destination.kind,
    destinationId: input.destination.investmentOrderId,
    activationType: input.activationType,
    activationEntityId: input.activationEntityId,
    description: "Referral reward credited to an investment order.",
  });

  return { credited: true as const, reward };
}

async function notifyPendingReferralReward(
  tx: Prisma.TransactionClient,
  reward: ReferralRewardRow,
  amount: Prisma.Decimal,
  activationType: ReferralActivationType,
  activationEntityId: string | null,
) {
  await upsertReferralNotification(tx, {
    userId: reward.userId,
    key: referralNotificationKey(reward.id, "pending"),
    title: "Referral reward pending",
    message:
      "Your referral reward is pending and will be credited once you have an eligible savings account or investment order.",
    link: "/account/dashboard/profile",
    metadata: {
      source: "REFERRAL",
      referralId: reward.referralId,
      rewardId: reward.id,
      rewardType: reward.type,
      amount: amount.toString(),
      currency: reward.currency,
      destinationType: "NONE",
      destinationId: null,
      activationType,
      activationEntityId,
      status: "PENDING_DESTINATION",
    },
  });

  await writeReferralAudit(tx, {
    action: "REFERRAL_REWARD_PENDING_DESTINATION",
    referralId: reward.referralId,
    rewardId: reward.id,
    rewardType: reward.type,
    userId: reward.userId,
    amount,
    currency: reward.currency,
    destinationType: "NONE",
    destinationId: null,
    activationType,
    activationEntityId,
    description:
      "Referral reward is pending until the user has an eligible destination.",
  });
}

async function notifyPendingPlatformPromoReward(
  tx: Prisma.TransactionClient,
  reward: PlatformPromoRewardRow,
) {
  await upsertReferralNotification(tx, {
    userId: reward.userId,
    key: promoRewardNotificationKey(reward.id, "reserved"),
    title: "Welcome bonus reserved",
    message:
      "Your $100 welcome bonus is reserved. Start your first savings or investment to unlock it.",
    link: "/account/dashboard",
    metadata: {
      source: RewardSource.PLATFORM_PROMOTION,
      promotionCampaignId: reward.promotionCampaignId,
      rewardId: reward.id,
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
    activationType: ReferralActivationType.SAVINGS_ACCOUNT_CREATED,
    activationEntityId: null,
    description: "Platform promo reward reserved pending the first eligible action.",
  });
}

async function creditPlatformPromoRewardToSavingsAccount(
  tx: Prisma.TransactionClient,
  input: {
    reward: PlatformPromoRewardRow;
    destination: Extract<RewardDestination, { kind: "SAVINGS_ACCOUNT" }>;
    activationType: ReferralActivationType;
    activationEntityId: string | null;
    rewardedAt: Date;
  },
) {
  const existingReward = await findPlatformPromoRewardByCampaignAndUser(
    tx,
    input.reward.promotionCampaignId ?? "",
    input.reward.userId,
  );

  if (existingReward?.status === ReferralRewardStatus.CREDITED) {
    return { credited: false as const, reward: existingReward };
  }

  const reward = existingReward ?? input.reward;

  if (reward.status === ReferralRewardStatus.CREDITED) {
    return { credited: false as const, reward };
  }

  const claimed = await claimPlatformPromoRewardForCredit(
    tx,
    reward,
    input.rewardedAt,
  );

  if (!claimed) {
    return { credited: false as const, reward };
  }

  const balanceBefore = toDecimal(input.destination.savingsAccount.balance);
  const balanceAfter = balanceBefore.add(reward.amount);

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
      amount: reward.amount,
      currency: reward.currency,
      balanceBefore,
      balanceAfter,
      reference: `PROMO_BONUS:${reward.id}`,
      note: "Platform promotion bonus credited",
      metadata: {
        source: RewardSource.PLATFORM_PROMOTION,
        rewardType: reward.type,
        rewardId: reward.id,
        promotionCampaignId: reward.promotionCampaignId,
        amount: reward.amount.toString(),
        currency: reward.currency,
        destinationType: input.destination.kind,
        destinationId: input.destination.savingsAccountId,
        activationType: input.activationType,
        activationEntityId: input.activationEntityId,
      },
    },
  });

  await upsertReferralNotification(tx, {
    userId: reward.userId,
    key: promoRewardNotificationKey(reward.id, "credited-savings"),
    title: "Welcome bonus unlocked",
    message: `Your ${formatCurrency(
      reward.amount.toNumber(),
      reward.currency,
    )} welcome bonus has been credited to your savings account.`,
    link: "/account/dashboard/user/savings",
    metadata: {
      source: RewardSource.PLATFORM_PROMOTION,
      promotionCampaignId: reward.promotionCampaignId,
      rewardId: reward.id,
      rewardType: reward.type,
      amount: reward.amount.toString(),
      currency: reward.currency,
      destinationType: input.destination.kind,
      destinationId: input.destination.savingsAccountId,
      activationType: input.activationType,
      activationEntityId: input.activationEntityId,
    },
  });

  await writeRewardAudit(tx, {
    action: "REWARD_CREDITED",
    reward,
    userId: reward.userId,
    amount: reward.amount,
    currency: reward.currency,
    destinationType: input.destination.kind,
    destinationId: input.destination.savingsAccountId,
    activationType: input.activationType,
    activationEntityId: input.activationEntityId,
    description: "Platform promo reward credited to a savings account.",
  });

  return { credited: true as const, reward };
}

async function creditPlatformPromoRewardToInvestment(
  tx: Prisma.TransactionClient,
  input: {
    reward: PlatformPromoRewardRow;
    destination: Extract<RewardDestination, { kind: "INVESTMENT_ORDER" }>;
    activationType: ReferralActivationType;
    activationEntityId: string | null;
    rewardedAt: Date;
  },
) {
  const existingReward = await findPlatformPromoRewardByCampaignAndUser(
    tx,
    input.reward.promotionCampaignId ?? "",
    input.reward.userId,
  );

  if (existingReward?.status === ReferralRewardStatus.CREDITED) {
    return { credited: false as const, reward: existingReward };
  }

  const reward = existingReward ?? input.reward;

  if (reward.status === ReferralRewardStatus.CREDITED) {
    return { credited: false as const, reward };
  }

  const claimed = await claimPlatformPromoRewardForCredit(
    tx,
    reward,
    input.rewardedAt,
  );

  if (!claimed) {
    return { credited: false as const, reward };
  }

  const investmentAmountBefore = toDecimal(
    input.destination.investmentOrder.currentValue,
  ).greaterThan(0)
    ? toDecimal(input.destination.investmentOrder.currentValue)
    : toDecimal(input.destination.investmentOrder.amount);
  const nextInvestmentValue = investmentAmountBefore.add(reward.amount);
  const accountBalanceBefore = toDecimal(
    input.destination.investmentOrder.investmentAccount.balance,
  );
  const accountBalanceAfter = accountBalanceBefore.add(reward.amount);

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
    data: {
      ...(input.destination.investmentOrder.investmentModel === InvestmentModel.FIXED
        ? {
            accruedProfit: {
              increment: reward.amount,
            },
          }
        : {
            currentValue: nextInvestmentValue,
          }),
    },
  });

  await tx.investmentEarning.create({
    data: {
      investmentOrderId: input.destination.investmentOrderId,
      date: input.rewardedAt,
      amount: reward.amount,
    },
  });

  await upsertReferralNotification(tx, {
    userId: reward.userId,
    key: promoRewardNotificationKey(reward.id, "credited-investment"),
    title: "Welcome bonus unlocked",
    message: `Your ${formatCurrency(
      reward.amount.toNumber(),
      reward.currency,
    )} welcome bonus has been credited to your investment order.`,
    link: "/account/dashboard/user/investment-orders",
    metadata: {
      source: RewardSource.PLATFORM_PROMOTION,
      promotionCampaignId: reward.promotionCampaignId,
      rewardId: reward.id,
      rewardType: reward.type,
      amount: reward.amount.toString(),
      currency: reward.currency,
      destinationType: input.destination.kind,
      destinationId: input.destination.investmentOrderId,
      activationType: input.activationType,
      activationEntityId: input.activationEntityId,
    },
  });

  await writeRewardAudit(tx, {
    action: "REWARD_CREDITED",
    reward,
    userId: reward.userId,
    amount: reward.amount,
    currency: reward.currency,
    destinationType: input.destination.kind,
    destinationId: input.destination.investmentOrderId,
    activationType: input.activationType,
    activationEntityId: input.activationEntityId,
    description: "Platform promo reward credited to an investment order.",
  });

  return { credited: true as const, reward };
}

export const creditRewardToSavingsAccount =
  creditPlatformPromoRewardToSavingsAccount;

export const creditRewardToInvestmentOrder =
  creditPlatformPromoRewardToInvestment;

async function syncReferralStatus(tx: Prisma.TransactionClient, referralId: string) {
  const rewardStatuses = await tx.referralReward.findMany({
    where: {
      referralId,
      status: {
        in: [ReferralRewardStatus.PENDING, ReferralRewardStatus.CREDITED],
      },
    },
    select: {
      status: true,
    },
  });

  const pendingCount = rewardStatuses.filter(
    (reward) => reward.status === ReferralRewardStatus.PENDING,
  ).length;
  const creditedCount = rewardStatuses.length - pendingCount;

  if (creditedCount === 0) {
    return;
  }

  if (pendingCount === 0) {
    await tx.referral.update({
      where: { id: referralId },
      data: {
        status: ReferralStatus.REWARDED,
        rewardedAt: new Date(),
      },
    });
    return;
  }

  await tx.referral.update({
    where: { id: referralId },
    data: {
      status: ReferralStatus.ACTIVE,
      rewardedAt: null,
    },
  });
}

export async function activateReferralForReferredUser(params: {
  referredUserId: string;
  activationType: ReferralActivationType;
  activationEntityId: string;
  savingsAccountId?: string;
  investmentOrderId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (!(await canReceiveReferralReward(tx, params.referredUserId))) {
      return null;
    }

    const referral = await tx.referral.findUnique({
      where: {
        referredUserId: params.referredUserId,
      },
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
    });

    if (!referral || referral.referrerUserId === referral.referredUserId) {
      return null;
    }

    if (referral.status === ReferralStatus.CANCELLED) {
      return null;
    }

    const now = new Date();

    if (referral.status === ReferralStatus.PENDING) {
      await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: ReferralStatus.ACTIVE,
          activatedBy: params.activationType,
          activatedByEntityId: params.activationEntityId,
          activatedAt: now,
        },
      });

      await writeReferralAudit(tx, {
        action: "REFERRAL_ACTIVATED",
        referralId: referral.id,
        rewardId: null,
        rewardType: null,
        userId: referral.referredUserId,
        amount: referral.referredRewardAmount,
        currency: referral.rewardCurrency,
        destinationType: "NONE",
        destinationId: null,
        activationType: params.activationType,
        activationEntityId: params.activationEntityId,
        description: "Referral activated after the referred user completed an eligible operation.",
      });
    }

    const referredRewardAmount = referral.referredRewardAmount;
    const referrerRewardAmount = referral.referrerRewardAmount;

    const referredReward = await ensureReferralRewardRow(tx, {
      referralId: referral.id,
      userId: referral.referredUserId,
      type: ReferralRewardType.REFERRED_BONUS,
      amount: referredRewardAmount,
      currency: referral.rewardCurrency,
    });

    if (referredReward.status !== ReferralRewardStatus.CREDITED) {
      if (params.activationType === ReferralActivationType.SAVINGS_ACCOUNT_CREATED) {
        if (!params.savingsAccountId) {
          return null;
        }

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

        if (!savingsAccount) {
          return null;
        }

        const credited = await creditReferralRewardToSavingsAccount(tx, {
          referral,
          reward: referredReward,
          amount: referredRewardAmount,
          destination: {
            kind: "SAVINGS_ACCOUNT",
            savingsAccountId: savingsAccount.id,
            currency: savingsAccount.currency,
            label: `Savings account: ${savingsAccount.name}`,
            savingsAccount,
          },
          source: "REFERRAL",
          activationType: params.activationType,
          activationEntityId: params.activationEntityId,
          rewardedAt: now,
        });

        if (!credited.credited) {
          return null;
        }
      } else {
        if (!params.investmentOrderId) {
          return null;
        }

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

        if (!investmentOrder) {
          return null;
        }

        const credited = await creditReferralRewardToInvestment(tx, {
          referral,
          reward: referredReward,
          amount: referredRewardAmount,
          destination: {
            kind: "INVESTMENT_ORDER",
            investmentOrderId: investmentOrder.id,
            investmentAccountId: investmentOrder.investmentAccount.id,
            currency: investmentOrder.currency,
            label: `Investment order: ${investmentOrder.investmentPlan.name}`,
            investmentOrder,
          },
          source: "REFERRAL",
          activationType: params.activationType,
          activationEntityId: params.activationEntityId,
          rewardedAt: now,
        });

        if (!credited.credited) {
          return null;
        }
      }
    }

    const existingReferrerReward = await findReferralRewardByType(
      tx,
      referral.id,
      ReferralRewardType.REFERRER_BONUS,
    );

    const referrerReward =
      existingReferrerReward ??
      (await createReferralRewardRow(tx, {
        referralId: referral.id,
        userId: referral.referrerUserId,
        type: ReferralRewardType.REFERRER_BONUS,
        amount: referrerRewardAmount,
        currency: referral.rewardCurrency,
        status: ReferralRewardStatus.PENDING,
      }));
    const referrerRewardWasCreated = !existingReferrerReward;

    const referrerDestination = await resolveReferralRewardDestination(
      tx,
      referral.referrerUserId,
    );

    if (!referrerDestination) {
      if (
        referrerRewardWasCreated &&
        referrerReward.status === ReferralRewardStatus.PENDING
      ) {
        await notifyPendingReferralReward(
          tx,
          referrerReward,
          referrerRewardAmount,
          params.activationType,
          params.activationEntityId,
        );
      }

      await syncReferralStatus(tx, referral.id);

      return {
        referralId: referral.id,
        creditedReferrer: false,
        creditedReferred: true,
        referrerPending: true,
      };
    }

    const referrerCreditResult =
      referrerDestination.kind === "SAVINGS_ACCOUNT"
        ? await creditReferralRewardToSavingsAccount(tx, {
            referral,
            reward: referrerReward,
            amount: referrerRewardAmount,
            destination: referrerDestination,
            source: "REFERRAL",
            activationType: params.activationType,
            activationEntityId: params.activationEntityId,
            rewardedAt: now,
          })
        : await creditReferralRewardToInvestment(tx, {
            referral,
            reward: referrerReward,
            amount: referrerRewardAmount,
            destination: referrerDestination,
            source: "REFERRAL",
            activationType: params.activationType,
            activationEntityId: params.activationEntityId,
            rewardedAt: now,
          });

    await syncReferralStatus(tx, referral.id);

    return {
      referralId: referral.id,
      creditedReferrer: referrerCreditResult.credited,
      creditedReferred: true,
      referrerPending: !referrerCreditResult.credited,
    };
  });
}

export async function creditPendingReferralRewardForUser(params: {
  userId: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (!(await canReceiveReferralReward(tx, params.userId))) {
      return {
        credited: 0,
        destination: null as RewardDestination | null,
      };
    }

    const destination = await resolveReferralRewardDestination(tx, params.userId);

    if (!destination) {
      return {
        credited: 0,
        destination: null as RewardDestination | null,
      };
    }

    const pendingRewards = await tx.referralReward.findMany({
      where: {
        userId: params.userId,
        source: RewardSource.USER_REFERRAL,
        status: ReferralRewardStatus.PENDING,
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
      orderBy: {
        createdAt: "asc",
      },
    }) as ReferralRewardRow[];

    let creditedCount = 0;
    const touchedReferralIds = new Set<string>();

    for (const reward of pendingRewards) {
      const creditedAt = new Date(Date.now() + creditedCount);

      const creditResult =
        destination.kind === "SAVINGS_ACCOUNT"
          ? await creditReferralRewardToSavingsAccount(tx, {
              referral: reward.referral,
              reward,
              amount: reward.amount,
              destination,
              source: "REFERRAL",
              activationType: reward.referral.activatedBy ?? ReferralActivationType.SAVINGS_ACCOUNT_CREATED,
              activationEntityId: reward.referral.activatedByEntityId,
              rewardedAt: creditedAt,
            })
          : await creditReferralRewardToInvestment(tx, {
              referral: reward.referral,
              reward,
              amount: reward.amount,
              destination,
              source: "REFERRAL",
              activationType: reward.referral.activatedBy ?? ReferralActivationType.INVESTMENT_ORDER_CONFIRMED,
              activationEntityId: reward.referral.activatedByEntityId,
              rewardedAt: creditedAt,
            });

      if (creditResult.credited) {
        creditedCount += 1;
        touchedReferralIds.add(reward.referralId);
      }
    }

    for (const referralId of touchedReferralIds) {
      await syncReferralStatus(tx, referralId);
    }

    return {
      credited: creditedCount,
      destination,
    };
  });
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
    if (!(await canReceiveReferralReward(tx, params.userId))) {
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
        const duplicateReward = await findPlatformPromoRewardByCampaignAndUser(
          tx,
          campaign.id,
          params.userId,
        );

        return duplicateReward;
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

    await notifyPendingPlatformPromoReward(tx, reward);

    return reward;
  });
}

export async function creditPendingPlatformPromoRewardForUser(params: {
  userId: string;
  activationType: ReferralActivationType;
  activationEntityId: string;
  savingsAccountId?: string;
  investmentOrderId?: string;
}) {
  return prisma.$transaction(async (tx) => {
    if (!(await canReceiveReferralReward(tx, params.userId))) {
      return {
        credited: 0,
        destination: null as RewardDestination | null,
      };
    }

    const destination = await resolveReferralRewardDestination(tx, params.userId);

    if (!destination) {
      return {
        credited: 0,
        destination: null as RewardDestination | null,
      };
    }

    const pendingRewards = await tx.referralReward.findMany({
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
            promoCode: true,
            rewardAmount: true,
            rewardCurrency: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    }) as PlatformPromoRewardRow[];

    let creditedCount = 0;

    for (const reward of pendingRewards) {
      const creditedAt = new Date(Date.now() + creditedCount);

      const creditResult =
        destination.kind === "SAVINGS_ACCOUNT"
          ? await creditPlatformPromoRewardToSavingsAccount(tx, {
              reward,
              destination,
              activationType: params.activationType,
              activationEntityId: params.activationEntityId,
              rewardedAt: creditedAt,
            })
          : await creditPlatformPromoRewardToInvestment(tx, {
              reward,
              destination,
              activationType: params.activationType,
              activationEntityId: params.activationEntityId,
              rewardedAt: creditedAt,
            });

      if (creditResult.credited) {
        creditedCount += 1;
      }
    }

    return {
      credited: creditedCount,
      destination,
    };
  });
}

export const creditPendingRewardToDestination =
  creditPendingPlatformPromoRewardForUser;

export async function activateEligibleRewardsForUser(params: {
  referredUserId: string;
  activationType: ReferralActivationType;
  activationEntityId: string;
  savingsAccountId?: string;
  investmentOrderId?: string;
}) {
  const referralResult = await activateReferralForReferredUser(params);
  const promoResult = await creditPendingPlatformPromoRewardForUser({
    userId: params.referredUserId,
    activationType: params.activationType,
    activationEntityId: params.activationEntityId,
    savingsAccountId: params.savingsAccountId,
    investmentOrderId: params.investmentOrderId,
  });

  return {
    referralResult,
    promoResult,
  };
}
