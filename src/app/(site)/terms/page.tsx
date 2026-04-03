import React from "react";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Terms of Service",
    description:
      "Read Havenstone’s platform terms governing account access, investment workflows, and service use.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/terms",
  });
}

const page = () => {
  return <div>page</div>;
};

export default page;
