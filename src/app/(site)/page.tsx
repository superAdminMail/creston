import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import HomeContent from "./HomeContent";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Secure Wealth Growth and Retirement Confidence",
    description:
      "Havenstone is a secure and modern wealth platform built for long-term investing, retirement confidence, and financial stability. Discover how we can help you achieve your financial goals with innovative investment solutions and expert guidance.",
  });

  return buildSeoMetadata({
    site,
    ...seo,
    canonicalPath: "/",
  });
}

const page = () => {
  return (
    <div>
      <HomeContent />
    </div>
  );
};

export default page;
