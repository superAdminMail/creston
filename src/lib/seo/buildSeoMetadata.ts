import type { Metadata } from "next";

import type { SiteSeoConfig } from "./types";

type BuildSeoMetadataInput = {
  site: SiteSeoConfig;
  title: string;
  description: string;
  imageUrl?: string;
  canonicalPath?: string;
  canonicalUrl?: string;
  keywords?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
  openGraphType?: "website" | "article";
};

function toAbsoluteUrl(siteUrl: string, value: string) {
  try {
    return new URL(value).toString();
  } catch {
    return new URL(value, siteUrl).toString();
  }
}

export function buildSeoMetadata({
  site,
  title,
  description,
  imageUrl,
  canonicalPath,
  canonicalUrl,
  keywords,
  noIndex = false,
  noFollow = false,
  openGraphType = "website",
}: BuildSeoMetadataInput): Metadata {
  const resolvedCanonicalUrl =
    canonicalUrl ??
    (canonicalPath ? toAbsoluteUrl(site.siteUrl, canonicalPath) : undefined);
  const resolvedImageUrl = toAbsoluteUrl(
    site.siteUrl,
    imageUrl ?? site.defaultOgImageUrl,
  );

  return {
    metadataBase: new URL(site.siteUrl),
    title,
    description,
    applicationName: site.siteName,
    publisher: site.companyName,
    keywords,
    alternates: resolvedCanonicalUrl
      ? {
          canonical: resolvedCanonicalUrl,
        }
      : undefined,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
      },
    },
    openGraph: {
      type: openGraphType,
      locale: site.locale,
      siteName: site.siteName,
      url: resolvedCanonicalUrl,
      title,
      description,
      images: [
        {
          url: resolvedImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: site.defaultTwitterHandle,
      site: site.defaultTwitterHandle,
      images: [resolvedImageUrl],
    },
  };
}
