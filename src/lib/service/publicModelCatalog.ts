import { cache } from "react";
import { Prisma } from "@/generated/prisma";

import { formatCurrency, formatEnumLabel } from "@/lib/formatters/formatters";
import { prisma } from "@/lib/prisma";
import {
  getPublicInvestmentProducts,
  type PublicInvestmentProductViewModel,
} from "@/lib/service/publicInvestmentCatalog";

const savingsProductSelect = Prisma.validator<Prisma.SavingsProductSelect>()({
  id: true,
  name: true,
  description: true,
  interestRatePercent: true,
  interestPayoutFrequency: true,
  interestEnabled: true,
  isLockable: true,
  minimumLockDays: true,
  maximumLockDays: true,
  allowsWithdrawals: true,
  allowsDeposits: true,
  minBalance: true,
  maxBalance: true,
  currency: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

type PublicSavingsProductRecord = Prisma.SavingsProductGetPayload<{
  select: typeof savingsProductSelect;
}>;

export type PublicSavingsProductViewModel = {
  id: string;
  name: string;
  description: string | null;
  interestRateLabel: string | null;
  payoutFrequencyLabel: string | null;
  lockLabel: string;
  balanceRangeLabel: string | null;
  featureLabels: string[];
  overview: string;
  sortOrder: number;
  isActive: boolean;
  currency: string;
};

export type PublicModelCatalogItem = {
  id: string;
  name: string;
  kind: "investment" | "savings";
  kindLabel: string;
  href: string;
  iconUrl: string | null;
  description: string;
  badges: string[];
  stats: Array<{
    label: string;
    value: string;
  }>;
};

function formatFrequencyLabel(
  frequency: PublicSavingsProductRecord["interestPayoutFrequency"],
) {
  if (!frequency) {
    return null;
  }

  return formatEnumLabel(frequency);
}

function formatLockLabel(product: PublicSavingsProductRecord) {
  if (!product.isLockable) {
    return "Flexible access";
  }

  if (product.minimumLockDays && product.maximumLockDays) {
    if (product.minimumLockDays === product.maximumLockDays) {
      return `${product.minimumLockDays} day lock`;
    }

    return `${product.minimumLockDays} - ${product.maximumLockDays} day lock`;
  }

  if (product.minimumLockDays) {
    return `From ${product.minimumLockDays} days`;
  }

  if (product.maximumLockDays) {
    return `Up to ${product.maximumLockDays} days`;
  }

  return "Flexible access";
}

function formatBalanceRange(product: PublicSavingsProductRecord) {
  const min = product.minBalance ? Number(product.minBalance) : null;
  const max = product.maxBalance ? Number(product.maxBalance) : null;

  if (min !== null && max !== null) {
    return formatCurrency(min, product.currency) ===
      formatCurrency(max, product.currency)
      ? formatCurrency(min, product.currency)
      : `${formatCurrency(min, product.currency)} - ${formatCurrency(max, product.currency)}`;
  }

  if (min !== null) {
    return `From ${formatCurrency(min, product.currency)}`;
  }

  if (max !== null) {
    return `Up to ${formatCurrency(max, product.currency)}`;
  }

  return null;
}

function mapSavingsProduct(
  product: PublicSavingsProductRecord,
): PublicSavingsProductViewModel {
  const interestRateLabel =
    product.interestRatePercent === null
      ? null
      : `${Number(product.interestRatePercent).toFixed(2)}%`;

  const featureLabels = [
    product.interestEnabled ? "Interest enabled" : "Interest off",
    product.allowsDeposits ? "Deposits allowed" : "Deposits restricted",
    product.allowsWithdrawals
      ? "Withdrawals allowed"
      : "Withdrawals restricted",
  ];

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    interestRateLabel,
    payoutFrequencyLabel: formatFrequencyLabel(product.interestPayoutFrequency),
    lockLabel: formatLockLabel(product),
    balanceRangeLabel: formatBalanceRange(product),
    featureLabels,
    overview:
      product.description ||
      `${product.name} is a secure savings option for disciplined balance growth and flexible account planning.`,
    sortOrder: product.sortOrder,
    isActive: product.isActive,
    currency: product.currency,
  };
}

export const getPublicSavingsProducts = cache(
  async (): Promise<PublicSavingsProductViewModel[]> => {
    const products = await prisma.savingsProduct.findMany({
      where: {
        isActive: true,
      },
      select: savingsProductSelect,
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return products.map(mapSavingsProduct);
  },
);

export const getPublicModelCatalog = cache(
  async (): Promise<
    Array<
      PublicModelCatalogItem & {
        product:
          | PublicInvestmentProductViewModel
          | PublicSavingsProductViewModel;
      }
    >
  > => {
    const [investmentProducts, savingsProducts] = await Promise.all([
      getPublicInvestmentProducts(),
      getPublicSavingsProducts(),
    ]);

    const investmentItems = investmentProducts.map((product) => ({
      id: product.id,
      name: product.name,
      kind: "investment" as const,
      kindLabel: "Investment Product",
      href: `/investment-products#${product.slug}`,
      iconUrl: product.iconUrl,
      description: product.overview,
      badges: [product.typeLabel, ...product.modelLabels],
      stats: [
        {
          label: "Starting from",
          value: product.startingAmountLabel ?? "Quoted per plan",
        },
        {
          label: "Plans",
          value: product.planCountLabel,
        },
        {
          label: "Timeline",
          value: product.durationLabel ?? "Varies",
        },
      ],
      product,
    }));

    const savingsItems = savingsProducts.map((product) => ({
      id: product.id,
      name: product.name,
      kind: "savings" as const,
      kindLabel: "Savings Product",
      href: `/savings-products#${product.id}`,
      iconUrl: null,
      description: product.overview,
      badges: [
        product.interestRateLabel ?? "No fixed rate",
        product.payoutFrequencyLabel ?? "Flexible payout",
        ...product.featureLabels.slice(0, 1),
      ],
      stats: [
        {
          label: "Balance range",
          value: product.balanceRangeLabel ?? "Quoted per account",
        },
        {
          label: "Lock",
          value: product.lockLabel,
        },
        {
          label: "Interest",
          value: product.interestRateLabel ?? "Variable",
        },
      ],
      product,
    }));

    return [...investmentItems, ...savingsItems].sort((left, right) => {
      if (left.kind !== right.kind) {
        return left.kind === "investment" ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    });
  },
);
