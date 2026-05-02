import React from "react";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Client Testimonials",
    description:
      `Read how ${site.siteName} supports disciplined investing, retirement planning, and confident long-term financial decision-making.`,
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/testimonial",
  });
}

const page = () => {
  return <div>page</div>;
};

export default page;
