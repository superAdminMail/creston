import React from "react";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Contact Havenstone",
    description:
      "Get in touch with Havenstone for support, inquiries, or to learn more about our secure and modern wealth platform. We're here to help you achieve your financial goals with confidence and stability.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/contact",
  });
}

const page = () => {
  return <div>page</div>;
};

export default page;
