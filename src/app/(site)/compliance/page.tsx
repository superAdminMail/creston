import React from "react";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Compliance",
    description:
      "Learn about Havenstone's commitment to regulatory compliance, security standards, and ethical practices in wealth management. Discover how we prioritize the safety and trust of our users while providing innovative financial solutions.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/compliance",
  });
}

const page = () => {
  return <div>coming soon...</div>;
};

export default page;
