"use server";

import { ReferralActivationType } from "@/generated/prisma";

import {
  activateReferralForReferredUser,
  creditPendingReferralRewardForUser,
} from "./referralRewardService.impl";

import { creditPendingPlatformPromoRewardForUser } from "./platformPromoRewardService";

type ActivateEligibleRewardsInput = {
  referredUserId: string;
  activationType: ReferralActivationType;
  activationEntityId: string;
  savingsAccountId?: string;
  investmentOrderId?: string;
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

  const referralCreditResult = await creditPendingReferralRewardForUser({
    userId: input.referredUserId,
    savingsAccountId: input.savingsAccountId,
    investmentOrderId: input.investmentOrderId,
    adjustedByUserId: input.adjustedByUserId,
  });

  const promotionResult = await creditPendingPlatformPromoRewardForUser({
    userId: input.referredUserId,
    activationType: input.activationType,
    activationEntityId: input.activationEntityId,
    savingsAccountId: input.savingsAccountId,
    investmentOrderId: input.investmentOrderId,
    adjustedByUserId: input.adjustedByUserId,
  });

  return {
    success: true,
    referral: referralResult,
    referralCredits: referralCreditResult,
    promotion: promotionResult,
  };
}
