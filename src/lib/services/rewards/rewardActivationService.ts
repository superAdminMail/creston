"use server";

import { ReferralActivationType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

import {
  activateReferralForReferredUser,
  creditPendingReferralRewardForUser,
} from "../../referrals/referralRewardService.impl";
import { creditPendingPlatformPromoRewardForUser } from "./platformPromoRewardService";

type ActivateEligibleRewardsInput = {
  referredUserId: string;
  activationType: ReferralActivationType;
  activationEntityId: string;
  savingsAccountId?: string;
  investmentOrderId?: string;
  promotionCampaignId?: string;
  adjustedByUserId: string;
};

export async function activateEligibleRewardsForUser(
  input: ActivateEligibleRewardsInput,
) {
  const referralResult = await activateReferralForReferredUser({
    referredUserId: input.referredUserId,
    activationType: input.activationType,
    activationEntityId: input.activationEntityId,
  });

  let referralCredits = null;

  if (referralResult.referralId && referralResult.activated) {
    const referredUserId = input.referredUserId;

    referralCredits = await creditPendingReferralRewardForUser({
      userId: referredUserId,
      referralId: referralResult.referralId,
      savingsAccountId: input.savingsAccountId,
      investmentOrderId: input.investmentOrderId,
      adjustedByUserId: input.adjustedByUserId,
    });

    const referral = await prisma.referral.findUnique({
      where: {
        id: referralResult.referralId,
      },
      select: {
        referrerUserId: true,
      },
    });

    if (referral?.referrerUserId) {
      const referrerCredits = await creditPendingReferralRewardForUser({
        userId: referral.referrerUserId,
        referralId: referralResult.referralId,
        adjustedByUserId: input.adjustedByUserId,
      });

      referralCredits = {
        referredUser: referralCredits,
        referrer: referrerCredits,
      };
    }
  }

  const promotionResult = input.promotionCampaignId
    ? await creditPendingPlatformPromoRewardForUser({
        userId: input.referredUserId,
        promotionCampaignId: input.promotionCampaignId,
        activationType: input.activationType,
        activationEntityId: input.activationEntityId,
        savingsAccountId: input.savingsAccountId,
        investmentOrderId: input.investmentOrderId,
        adjustedByUserId: input.adjustedByUserId,
      })
    : {
        credited: 0,
        destination: null,
      };

  return {
    success: true,
    referral: referralResult,
    referralCredits,
    promotion: promotionResult,
  };
}
