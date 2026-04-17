import z from "zod";

import { PromotionAudienceType, PromotionChannel } from "@/generated/prisma";

export const promotionTypeSchema = z.enum([
  "ANNOUNCEMENT",
  "OFFER",
  "REMINDER",
  "SYSTEM",
]);

export const createPromotionCampaignSchema = z
  .object({
    title: z.string().trim().min(3).max(120),
    promotionType: promotionTypeSchema,
    subject: z.string().trim().max(160).optional(),
    message: z.string().trim().min(10).max(5000),
    audienceType: z.nativeEnum(PromotionAudienceType),
    channel: z.nativeEnum(PromotionChannel),
    userId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.audienceType === PromotionAudienceType.SINGLE_USER &&
      !data.userId
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
  });

export type CreatePromotionCampaignInput = z.infer<
  typeof createPromotionCampaignSchema
>;
