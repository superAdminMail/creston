import { notFound } from "next/navigation";

import { getPublicOfferBySlug } from "../_lib/getPublicOfferBySlug";
import OfferClient from "./OfferClient";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";

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

  const offer = await getPublicOfferBySlug(slug);

  if (!offer) {
    notFound();
  }

  return <OfferClient offer={offer} siteName={site.siteName} />;
}
