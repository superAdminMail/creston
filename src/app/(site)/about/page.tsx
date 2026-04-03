import React from "react";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "About Havenstone",
    description:
      "Learn about Havenstone, a secure and modern wealth platform designed for long-term investing, retirement confidence, and financial stability. Discover our mission, values, and commitment to helping you achieve your financial goals.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/about",
  });
}

const page = () => {
  return <div>page</div>;
};

export default page;
