import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";
import {
  getSuperAdminInvestments,
  type SuperAdminIconFileOption,
} from "./getSuperAdminInvestments";

export type SuperAdminInvestmentDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  typeLabel: string;
  periodLabel: string;
  statusLabel: string;
  type: string;
  period: string;
  status: string;
  sortOrder: number;
  isActive: boolean;
  iconUrl: string | null;
  iconFileAssetId: string | null;
  createdAt: string;
  updatedAt: string;
  relatedPlans: Array<{
    id: string;
    name: string;
    slug: string;
    categoryLabel: string;
    isActive: boolean;
  }>;
  formDefaults: {
    name: string;
    slug: string;
    description: string;
    type: string;
    period: string;
    status: string;
    iconFileAssetId: string;
    sortOrder: string;
    isActive: boolean;
  };
  iconFileOptions: SuperAdminIconFileOption[];
};

export async function getSuperAdminInvestmentById(
  investmentId: string,
): Promise<SuperAdminInvestmentDetails> {
  await requireSuperAdminAccess();

  const [investment, investmentData] = await Promise.all([
    prisma.investment.findUnique({
      where: { id: investmentId },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        period: true,
        status: true,
        sortOrder: true,
        isActive: true,
        iconFileAssetId: true,
        createdAt: true,
        updatedAt: true,
        iconFileAsset: {
          select: {
            url: true,
          },
        },
        investmentPlans: {
          orderBy: {
            updatedAt: "desc",
          },
          select: {
            id: true,
            name: true,
            slug: true,
            category: true,
            isActive: true,
          },
        },
      },
    }),
    getSuperAdminInvestments(),
  ]);

  if (!investment) {
    notFound();
  }

  return {
    id: investment.id,
    name: investment.name,
    slug: investment.slug,
    description: investment.description?.trim() || "No description provided.",
    typeLabel: formatEnumLabel(investment.type),
    periodLabel: formatEnumLabel(investment.period),
    statusLabel: formatEnumLabel(investment.status),
    type: investment.type,
    period: investment.period,
    status: investment.status,
    sortOrder: investment.sortOrder,
    isActive: investment.isActive,
    iconUrl: investment.iconFileAsset?.url ?? null,
    iconFileAssetId: investment.iconFileAssetId,
    createdAt: formatDateLabel(investment.createdAt),
    updatedAt: formatDateLabel(investment.updatedAt),
    relatedPlans: investment.investmentPlans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      categoryLabel: formatEnumLabel(plan.category),
      isActive: plan.isActive,
    })),
    formDefaults: {
      name: investment.name,
      slug: investment.slug,
      description: investment.description ?? "",
      type: investment.type,
      period: investment.period,
      status: investment.status,
      iconFileAssetId: investment.iconFileAssetId ?? "",
      sortOrder: String(investment.sortOrder),
      isActive: investment.isActive,
    },
    iconFileOptions: investmentData.iconFileOptions,
  };
}
