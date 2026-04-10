import type {
  InvestmentCatalogStatus,
  InvestmentPeriod,
  InvestmentType,
} from "@/generated/prisma";

import { prisma } from "@/lib/prisma";
import { requireSuperAdminAccess } from "@/lib/permissions/requireSuperAdminAccess";
import { formatDateLabel, formatEnumLabel } from "@/lib/formatters/formatters";

export type SuperAdminInvestmentFilters = {
  type?: string;
  status?: string;
  isActive?: string;
};

export type SuperAdminInvestmentListItem = {
  id: string;
  name: string;
  slug: string;
  type: InvestmentType;
  typeLabel: string;
  status: InvestmentCatalogStatus;
  statusLabel: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
  iconUrl: string | null;
  plansCount: number;
};

export type SuperAdminInvestmentFilterOptions = {
  types: Array<{ value: InvestmentType; label: string }>;
  statuses: Array<{ value: InvestmentCatalogStatus; label: string }>;
};

export type SuperAdminIconFileOption = {
  id: string;
  label: string;
  url: string;
};

export type SuperAdminInvestmentsData = {
  filters: SuperAdminInvestmentFilters;
  filterOptions: SuperAdminInvestmentFilterOptions;
  investments: SuperAdminInvestmentListItem[];
  iconFileOptions: SuperAdminIconFileOption[];
};

function parseBooleanFilter(value?: string) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export async function getSuperAdminInvestments(
  filters: SuperAdminInvestmentFilters = {},
): Promise<SuperAdminInvestmentsData> {
  await requireSuperAdminAccess();

  const [investments, iconAssets] = await Promise.all([
    prisma.investment.findMany({
      where: {
        ...(filters.type ? { type: filters.type as InvestmentType } : {}),
        ...(filters.status
          ? { status: filters.status as InvestmentCatalogStatus }
          : {}),
        ...(typeof parseBooleanFilter(filters.isActive) === "boolean"
          ? { isActive: parseBooleanFilter(filters.isActive) }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        status: true,
        isActive: true,
        sortOrder: true,
        updatedAt: true,
        iconFileAsset: {
          select: {
            url: true,
          },
        },
        _count: {
          select: {
            investmentPlans: true,
          },
        },
      },
    }),
    prisma.fileAsset.findMany({
      where: {
        url: {
          not: null,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 50,
      select: {
        id: true,
        fileName: true,
        originalName: true,
        url: true,
      },
    }),
  ]);

  return {
    filters,
    filterOptions: {
      types: ["STOCKS", "BONDS", "ETFS", "CRYPTO", "COMMODITIES"].map(
        (value) => ({
          value: value as InvestmentType,
          label: formatEnumLabel(value),
        }),
      ),
      statuses: ["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"].map((value) => ({
        value: value as InvestmentCatalogStatus,
        label: formatEnumLabel(value),
      })),
    },
    investments: investments.map((investment) => ({
      id: investment.id,
      name: investment.name,
      slug: investment.slug,
      type: investment.type,
      typeLabel: formatEnumLabel(investment.type),
      status: investment.status,
      statusLabel: formatEnumLabel(investment.status),
      isActive: investment.isActive,
      sortOrder: investment.sortOrder,
      updatedAt: formatDateLabel(investment.updatedAt),
      iconUrl: investment.iconFileAsset?.url ?? null,
      plansCount: investment._count.investmentPlans,
    })),
    iconFileOptions: iconAssets
      .filter((asset): asset is typeof asset & { url: string } =>
        Boolean(asset.url),
      )
      .map((asset) => ({
        id: asset.id,
        label: asset.originalName?.trim() || asset.fileName,
        url: asset.url,
      })),
  };
}
