import z from "zod";

import { PromotionAudienceType, PromotionChannel } from "@/generated/prisma";

import { promotionTypeSchema } from "@/lib/promotions/promotion-types";

const highlightSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional().default(""),
});

const stepSchema = z.object({
  number: z.string().trim().min(1).max(10),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500),
});

const termSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000),
});

function jsonArrayField<T extends z.ZodTypeAny>(itemSchema: T) {
  return z
    .string()
    .optional()
    .default("[]")
    .transform((value, ctx) => {
      if (!value.trim()) {
        return [];
      }

      try {
        const parsed: unknown = JSON.parse(value);

        if (!Array.isArray(parsed)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Expected an array.",
          });

          return z.NEVER;
        }

        const result = z.array(itemSchema).safeParse(parsed);

        if (!result.success) {
          for (const issue of result.error.issues) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: issue.path,
              message: issue.message,
            });
          }

          return z.NEVER;
        }

        return result.data;
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid JSON data.",
        });

        return z.NEVER;
      }
    });
}

export const createPromotionCampaignSchema = z
  .object({
    title: z.string().trim().min(3).max(120),

    promotionType: promotionTypeSchema,

    subject: z.string().trim().max(160).optional(),

    message: z.string().trim().max(5000).optional(),

    audienceType: z.nativeEnum(PromotionAudienceType),

    channel: z.nativeEnum(PromotionChannel),

    userId: z.string().trim().optional(),

    rewardEnabled: z.enum(["true", "false"]).optional().default("false"),

    promoCode: z.string().trim().max(40).optional(),

    rewardAmount: z.string().trim().optional(),

    rewardCurrency: z.string().trim().max(8).optional(),

    startsAt: z.string().trim().optional(),

    expiresAt: z.string().trim().optional(),

    maxRedemptions: z.string().trim().optional(),

    claimCtaEnabled: z.enum(["true", "false"]).optional().default("false"),

    isPublic: z.enum(["true", "false"]).optional().default("false"),

    description: z.string().trim().max(10000).optional().default(""),

    highlights: jsonArrayField(highlightSchema),

    steps: jsonArrayField(stepSchema),

    terms: jsonArrayField(termSchema),
  })
  .superRefine((data, ctx) => {
    const rewardEnabled = data.rewardEnabled === "true";

    if (rewardEnabled) {
      if (!data.promoCode?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["promoCode"],
          message: "A promo code is required for reward campaigns.",
        });
      }

      if (!data.rewardAmount?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rewardAmount"],
          message: "A reward amount is required when rewards are enabled.",
        });
      } else {
        const amount = Number(data.rewardAmount);

        if (!Number.isFinite(amount) || amount <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["rewardAmount"],
            message: "Reward amount must be greater than zero.",
          });
        }
      }

      if (!data.rewardCurrency?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rewardCurrency"],
          message: "A reward currency is required when rewards are enabled.",
        });
      }
    }

    if (
      data.audienceType === PromotionAudienceType.SINGLE_USER &&
      !data.userId?.trim()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["userId"],
        message: "A user must be selected for single-user promotions.",
      });
    }

    if (data.channel === PromotionChannel.EMAIL && !data.subject?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subject"],
        message: "Email promotions require a subject.",
      });
    }

    if (data.startsAt && data.expiresAt) {
      const startsAt = new Date(data.startsAt);
      const expiresAt = new Date(data.expiresAt);

      if (
        !Number.isNaN(startsAt.getTime()) &&
        !Number.isNaN(expiresAt.getTime()) &&
        expiresAt <= startsAt
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["expiresAt"],
          message: "Expiration must be later than the start date.",
        });
      }
    }

    if (data.maxRedemptions?.trim()) {
      const maxRedemptions = Number(data.maxRedemptions);

      if (!Number.isInteger(maxRedemptions) || maxRedemptions < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxRedemptions"],
          message: "Maximum redemptions must be a positive whole number.",
        });
      }
    }
  });

export type CreatePromotionCampaignInput = z.infer<
  typeof createPromotionCampaignSchema
>;
