import React from "react";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Privacy Policy",
    description:
      "Read Havenstone's Privacy Policy to understand how we collect, use, and protect your personal information. Learn about our commitment to data security, user privacy, and compliance with relevant regulations as we provide a secure and trustworthy wealth management platform.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/privacy",
  });
}

const page = () => {
  return <div>page</div>;
};

export default page;
