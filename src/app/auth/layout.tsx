import { Navbar } from "@/components/layout/navbar";
import { buildSeoMetadata } from "@/lib/seo/buildSeoMetadata";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { resolveGenericPageSeo } from "@/lib/seo/resolveSeoFallbacks";

export async function generateMetadata() {
  const site = await getSiteSeoConfig();
  const seo = resolveGenericPageSeo(site, {
    title: "Secure account access",
    description: `Access your ${site.siteName} account to manage your investments, view your portfolio, and utilize our secure personal savings planning tools. Log in to experience a modern wealth platform designed for long-term financial confidence and stability.`,
  });

  return buildSeoMetadata({
    site,
    ...seo,
    noIndex: true,
    noFollow: true,
  });
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-site-shell flex min-h-screen flex-col text-foreground">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex w-full max-w-7xl flex-1 items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
}
