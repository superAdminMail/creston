import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";
import HomeContent from "./HomeContent";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Secure and Modern Wealth Platform",
    description: "The company is a secure and modern wealth platform.",
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
