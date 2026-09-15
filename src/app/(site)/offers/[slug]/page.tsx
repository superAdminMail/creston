import { notFound } from "next/navigation";

import { getPublicOfferBySlug } from "../_lib/getPublicOfferBySlug";
import OfferClient from "../_components/OfferClient";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { OfferExpired } from "../_components/OfferExpired";
import OfferUpcoming from "../_components/OfferUpcoming";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function OfferPage({ params }: PageProps) {
  const { slug } = await params;

  const [site] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  const result = await getPublicOfferBySlug(slug);

  if (result.state === "NOT_FOUND") {
    notFound();
  }

  if (result.state === "EXPIRED") {
    return (
      <OfferExpired
        title={result.offer.title}
        expiredAt={result.offer.expiresAt}
      />
    );
  }

  if (result.state === "UPCOMING") {
    return (
      <OfferUpcoming
        title={result.offer.title}
        startsAt={result.offer.startsAt}
      />
    );
  }

  return <OfferClient offer={result.offer} siteName={site.siteName} />;
}
