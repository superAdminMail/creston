import { z } from "zod";

import {
  InvestmentCatalogStatus,
  InvestmentPeriod,
  InvestmentType,
} from "@/generated/prisma";
import { slugify } from "@/lib/slugs/slugify";

const integerPattern = /^-?\d+$/;

export const investmentFormSchema = z.object({
  name: z.string().trim().min(2, "Investment name is required."),
  slug: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
  type: z.nativeEnum(InvestmentType, {
    message: "Select a valid investment type.",
  }),
  period: z.nativeEnum(InvestmentPeriod, {
    message: "Select a valid investment period.",
  }),
  status: z.nativeEnum(InvestmentCatalogStatus, {
    message: "Select a valid catalog status.",
  }),

  iconFileAssetId: z.string().trim().optional().or(z.literal("")),
  sortOrder: z
    .string()
    .trim()
    .min(1, "Sort order is required.")
    .refine(
      (value) => integerPattern.test(value),
      "Enter a valid whole number.",
    ),
  isActive: z
    .union([z.literal("true"), z.literal("false")])
    .transform((value) => value === "true"),
});

export type InvestmentFormInput = z.infer<typeof investmentFormSchema>;

export function normalizeInvestmentFormValues(values: InvestmentFormInput) {
  const slugSource = values.slug || values.name;

  return {
    name: values.name.trim(),
    slugSource,
    normalizedSlug: slugify(slugSource),
    description: values.description?.trim() || null,
    type: values.type,
    period: values.period,
    status: values.status,
    iconFileAssetId: values.iconFileAssetId?.trim() || null,
    sortOrder: Number(values.sortOrder),
    isActive: values.isActive,
  };
}
