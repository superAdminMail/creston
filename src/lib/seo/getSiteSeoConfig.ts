import { cache } from "react";

import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import type { SiteSeoConfig } from "./types";
import { firstNonEmpty } from "./resolveSeoFallbacks";

const DEFAULT_SITE_NAME = "Havenstone";
const DEFAULT_SITE_DESCRIPTION =
  "Havenstone is a secure modern wealth platform designed for long-term investing, retirement security, and lasting financial confidence.";
const DEFAULT_SITE_TAGLINE =
  "Secure wealth growth and retirement confidence.";
const DEFAULT_KEYWORDS = [
  "Havenstone",
  "wealth platform",
  "investment platform",
  "retirement planning",
  "long-term investing",
  "financial security",
  "wealth management",
  "investment plans",
];

function normalizeAbsoluteUrl(baseUrl: string, value: string) {
  try {
    return new URL(value).toString();
  } catch {
    return new URL(value, baseUrl).toString();
  }
}

function resolveFallbackSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000"
  );
}

export const getSiteSeoConfig = cache(async (): Promise<SiteSeoConfig> => {
  const config = await getSiteConfigurationCached();

  const siteUrl = normalizeAbsoluteUrl(
    resolveFallbackSiteUrl(),
    resolveFallbackSiteUrl(),
  );

  const defaultOgImageUrl = normalizeAbsoluteUrl(
    siteUrl,
    firstNonEmpty(config?.defaultOgImageFileAsset?.url, "/opengraph-image") ??
      "/opengraph-image",
  );

  const keywords =
    config?.keywords
      ?.map((keyword) => keyword.trim())
      .filter(Boolean) ?? [];

  return {
    siteName: firstNonEmpty(config?.siteName, DEFAULT_SITE_NAME) ??
      DEFAULT_SITE_NAME,
    siteUrl,
    siteDescription:
      firstNonEmpty(config?.siteDescription, DEFAULT_SITE_DESCRIPTION) ??
      DEFAULT_SITE_DESCRIPTION,
    siteTagline:
      firstNonEmpty(config?.siteTagline, DEFAULT_SITE_TAGLINE) ??
      DEFAULT_SITE_TAGLINE,
    defaultOgImageUrl,
    defaultTwitterHandle: firstNonEmpty(config?.defaultTwitterHandle),
    locale: firstNonEmpty(config?.locale, "en_US") ?? "en_US",
    keywords: keywords.length > 0 ? keywords : DEFAULT_KEYWORDS,
    companyName:
      firstNonEmpty(config?.siteName, DEFAULT_SITE_NAME) ?? DEFAULT_SITE_NAME,
  };
});
