import { z } from "zod";

import { InvestmentPeriod, InvestmentTierLevel } from "@/generated/prisma";
import { slugify } from "@/lib/slugs/slugify";

const decimalPattern = /^\d+(?:\.\d{1,2})?$/;
const tierLevelOrder: Record<InvestmentTierLevel, number> = {
  CORE: 0,
  ADVANCED: 1,
  ELITE: 2,
};

const investmentPlanTierInputSchema = z.object({
  level: z.nativeEnum(InvestmentTierLevel, {
    message: "Select a valid tier level.",
  }),
  minAmount: z
    .string()
    .trim()
    .min(1, "Minimum amount is required.")
    .refine((value) => decimalPattern.test(value), "Enter a valid amount."),
  maxAmount: z
    .string()
    .trim()
    .min(1, "Maximum amount is required.")
    .refine((value) => decimalPattern.test(value), "Enter a valid amount."),
  roiPercent: z
    .string()
    .trim()
    .min(1, "ROI is required.")
    .refine((value) => decimalPattern.test(value), "Enter a valid ROI."),
  isActive: z.boolean(),
});

export const investmentPlanFormSchema = z
  .object({
    investmentId: z.string().trim().min(1, "Select an investment."),
    name: z.string().trim().min(2, "Plan name is required."),
    slug: z.string().trim().optional().or(z.literal("")),
    description: z.string().trim().optional().or(z.literal("")),
    period: z.nativeEnum(InvestmentPeriod, {
      message: "Select a valid investment period.",
    }),
    currency: z.string().trim().min(1, "Currency is required."),
    tiers: z.array(investmentPlanTierInputSchema),
    isActive: z
      .union([z.literal("true"), z.literal("false")])
      .transform((value) => value === "true"),
  })
  .superRefine((values, ctx) => {
    const activeTiers = values.tiers
      .filter((tier) => tier.isActive)
      .sort(
        (left, right) =>
          tierLevelOrder[left.level] - tierLevelOrder[right.level],
      );

    if (activeTiers.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tiers"],
        message: "Activate at least one tier for this plan.",
      });
      return;
    }

    const seenLevels = new Set<InvestmentTierLevel>();

    for (const tier of activeTiers) {
      if (seenLevels.has(tier.level)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tiers"],
          message: "Each tier level can only appear once.",
        });
      }

      seenLevels.add(tier.level);

      const minAmount = Number(tier.minAmount);
      const maxAmount = Number(tier.maxAmount);

      if (
        Number.isFinite(minAmount) &&
        Number.isFinite(maxAmount) &&
        maxAmount < minAmount
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tiers"],
          message: `${slugify(tier.level).replaceAll("-", " ")} maximum amount must be greater than or equal to its minimum amount.`,
        });
      }
    }

    for (let index = 1; index < activeTiers.length; index += 1) {
      const previousTier = activeTiers[index - 1];
      const currentTier = activeTiers[index];

      const previousMin = Number(previousTier.minAmount);
      const previousMax = Number(previousTier.maxAmount);
      const currentMin = Number(currentTier.minAmount);
      const currentMax = Number(currentTier.maxAmount);

      if (!Number.isFinite(previousMin) || !Number.isFinite(previousMax)) {
        continue;
      }

      if (!Number.isFinite(currentMin) || !Number.isFinite(currentMax)) {
        continue;
      }

      if (currentMin <= previousMin || currentMax <= previousMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tiers"],
          message:
            "Tier ranges must increase logically from Starter to Growth to Premium.",
        });
      }

      if (currentMin <= previousMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tiers"],
          message: "Active tier ranges cannot overlap.",
        });
      }
    }
  });

export type InvestmentPlanFormInput = z.infer<typeof investmentPlanFormSchema>;

export function normalizeInvestmentPlanFormValues(
  values: InvestmentPlanFormInput,
) {
  const slugSource = values.slug || values.name;

  return {
    investmentId: values.investmentId.trim(),
    name: values.name.trim(),
    slugSource,
    normalizedSlug: slugify(slugSource),
    description: values.description?.trim() || null,
    period: values.period,
    currency: values.currency.trim().toUpperCase(),
    tiers: values.tiers
      .filter((tier) => tier.isActive)
      .map((tier) => ({
        level: tier.level,
        minAmount: Number(tier.minAmount),
        maxAmount: Number(tier.maxAmount),
        roiPercent: Number(tier.roiPercent),
        isActive: tier.isActive,
      }))
      .sort(
        (left, right) =>
          tierLevelOrder[left.level] - tierLevelOrder[right.level],
      ),
    isActive: values.isActive,
  };
}
