import {
  Prisma,
  ReferralActivationType,
  ReferralRewardType,
} from "@/generated/prisma";

import { PlatformPromoRewardRow, RewardDestination } from "./rewardTypes";

export async function writeReferralAudit(
  tx: Prisma.TransactionClient,
  input: {
    action:
      | "REFERRAL_ACTIVATED"
      | "REFERRAL_REWARD_CREDITED"
      | "REFERRAL_REWARD_PENDING_DESTINATION";
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

export async function writeRewardAudit(
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
