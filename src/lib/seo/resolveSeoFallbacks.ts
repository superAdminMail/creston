import { formatEnumLabel } from "@/lib/formatters/formatters";
import type { ResolvedSeoFields, SiteSeoConfig } from "./types";

type GenericPageSeoInput = {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  keywords?: Array<string | null | undefined> | null;
  fallbackTitle?: string;
  fallbackDescription?: string;
};

type InvestmentPlanSeoInput = {
  name: string;
  description?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoImageUrl?: string | null;
  currency?: string | null;
  period?: string | null;
  riskLevel?: string | null;
};

export function firstNonEmpty(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();

    if (trimmed) {
      return trimmed;
    }
  }

  return undefined;
}

function normalizeKeywords(keywords: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const keyword of keywords) {
    const trimmed = keyword?.trim();

    if (!trimmed) {
      continue;
    }

    const key = trimmed.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(trimmed);
  }

  return normalized;
}

function clampDescription(value: string, maxLength = 180) {
  const trimmed = value.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function withSiteName(title: string, siteName: string) {
  return title.includes(siteName) ? title : `${title} | ${siteName}`;
}

export function resolveGenericPageSeo(
  site: SiteSeoConfig,
  input: GenericPageSeoInput = {},
): ResolvedSeoFields {
  const title = withSiteName(
    firstNonEmpty(input.title, input.fallbackTitle, site.siteName) ??
      site.siteName,
    site.siteName,
  );

  const description = clampDescription(
    firstNonEmpty(
      input.description,
      input.fallbackDescription,
      site.siteDescription,
    ) ?? site.siteDescription,
  );

  return {
    title,
    description,
    imageUrl: firstNonEmpty(input.imageUrl, site.defaultOgImageUrl) ??
      site.defaultOgImageUrl,
    keywords: normalizeKeywords([...(input.keywords ?? []), ...site.keywords]),
  };
}

export function resolveInvestmentPlanSeo(
  site: SiteSeoConfig,
  plan: InvestmentPlanSeoInput,
): ResolvedSeoFields {
  const periodLabel = firstNonEmpty(plan.period)
    ? formatEnumLabel(plan.period as string)
    : undefined;
  const riskLevelLabel = firstNonEmpty(plan.riskLevel)
    ? formatEnumLabel(plan.riskLevel as string)
    : undefined;

  const generatedTitle = `${plan.name} Investment Plan`;

  const generatedDescription = firstNonEmpty(
    plan.description,
    [
      `Explore the ${plan.name} investment plan on ${site.siteName}`,
      periodLabel ? `built for a ${periodLabel.toLowerCase()} horizon` : null,
      riskLevelLabel
        ? `and a ${riskLevelLabel.toLowerCase()} risk profile`
        : null,
      plan.currency ? `in ${plan.currency} denomination.` : ".",
    ]
      .filter(Boolean)
      .join(" ")
      .replace(/\s+\./g, "."),
    `Discover the ${plan.name} plan on ${site.siteName} with a structured investment approach designed for long-term financial stability.`,
  );

  return resolveGenericPageSeo(site, {
    title: firstNonEmpty(plan.seoTitle, generatedTitle),
    description: firstNonEmpty(plan.seoDescription, generatedDescription),
    imageUrl: plan.seoImageUrl,
    keywords: [plan.name, periodLabel, riskLevelLabel],
  });
}
