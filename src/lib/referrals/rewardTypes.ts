"use server";

import {
  InvestmentModel,
  InvestmentOrderStatus,
  Prisma,
  ReferralActivationType,
  ReferralRewardStatus,
  ReferralRewardType,
  ReferralStatus,
  RewardDestinationType,
  RewardSource,
  SavingsStatus,
  UserAccountStatus,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

export type ReferralRewardRow = {
  id: string;
  referralId: string | null;
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
  } | null;
};

export type PlatformPromoRewardRow = {
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
    title: string;
    slug: string | null;
    promoCode: string | null;
    rewardAmount: Prisma.Decimal;
    rewardCurrency: string;
  } | null;
};

export type RewardDestination =
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

export type ReferralRewardCreditInput = {
  referral: ReferralRewardRow["referral"];
  reward: {
    id: string;
    referralId: string | null;
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

export async function canReceiveReward(
  tx: Prisma.TransactionClient,
  userId: string,
) {
  const user = await tx.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      isDeleted: true,
      deletedAt: true,
      scheduledDeletionAt: true,
      accountStatus: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return false;
  }

  if (user.isDeleted || user.deletedAt || user.scheduledDeletionAt) {
    return false;
  }

  if (user.accountStatus !== UserAccountStatus.ACTIVE) {
    return false;
  }

  return user.emailVerified;
}

export async function resolveRewardDestination(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<RewardDestination | null> {
  if (!(await canReceiveReward(tx, userId))) {
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

export const resolveRewardDestinationForUser = resolveRewardDestination;

export async function findReferralRewardByType(
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

export async function createReferralRewardRow(
  tx: Prisma.TransactionClient,
  input: {
    referralId: string;
    userId: string;
    type: ReferralRewardType;
    amount: Prisma.Decimal;
    currency: string;
    status?: ReferralRewardStatus;
    activatedAt?: Date | null;
    activatedBy?: ReferralActivationType | null;
    activatedByEntityId?: string | null;
  },
): Promise<ReferralRewardRow> {
  return tx.referralReward.create({
    data: {
      referralId: input.referralId,
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      currency: input.currency,
      status: input.status ?? ReferralRewardStatus.PENDING,
      activatedAt: input.activatedAt ?? null,
      activatedBy: input.activatedBy ?? null,
      activatedByEntityId: input.activatedByEntityId ?? null,
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

export async function ensureReferralRewardRow(
  tx: Prisma.TransactionClient,
  input: {
    referralId: string;
    userId: string;
    type: ReferralRewardType;
    amount: Prisma.Decimal;
    currency: string;
    activatedAt?: Date | null;
    activatedBy?: ReferralActivationType | null;
    activatedByEntityId?: string | null;
  },
): Promise<ReferralRewardRow> {
  const existing = await findReferralRewardByType(
    tx,
    input.referralId,
    input.type,
  );

  if (existing) {
    return existing;
  }

  return createReferralRewardRow(tx, input);
}

export async function claimReferralReward(
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

  const fresh = reward.referralId
    ? await findReferralRewardByType(tx, reward.referralId, reward.type)
    : null;

  return fresh?.status === ReferralRewardStatus.CREDITED;
}

export function rewardDestinationType(
  destination: RewardDestination,
): RewardDestinationType {
  return destination.kind === "SAVINGS_ACCOUNT"
    ? RewardDestinationType.SAVINGS_ACCOUNT
    : RewardDestinationType.INVESTMENT_ORDER;
}
