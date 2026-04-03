import { z } from "zod";

import { InvestmentPeriod, InvestmentPlanCategory } from "@/generated/prisma";
import { slugify } from "@/lib/slugs/slugify";

const decimalPattern = /^\d+(?:\.\d{1,2})?$/;

export const investmentPlanFormSchema = z
  .object({
    investmentId: z.string().trim().min(1, "Select an investment."),
    name: z.string().trim().min(2, "Plan name is required."),
    slug: z.string().trim().optional().or(z.literal("")),
    description: z.string().trim().optional().or(z.literal("")),
    category: z.nativeEnum(InvestmentPlanCategory, {
      message: "Select a valid plan category.",
    }),
    period: z.nativeEnum(InvestmentPeriod, {
      message: "Select a valid investment period.",
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
    currency: z.string().trim().min(1, "Currency is required."),
    isActive: z
      .union([z.literal("true"), z.literal("false")])
      .transform((value) => value === "true"),
  })
  .superRefine((values, ctx) => {
    const minAmount = Number(values.minAmount);
    const maxAmount = Number(values.maxAmount);

    if (Number.isFinite(minAmount) && Number.isFinite(maxAmount) && maxAmount < minAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxAmount"],
        message: "Maximum amount must be greater than or equal to minimum amount.",
      });
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
    category: values.category,
    period: values.period,
    minAmount: Number(values.minAmount),
    maxAmount: Number(values.maxAmount),
    currency: values.currency.trim().toUpperCase(),
    isActive: values.isActive,
  };
}
