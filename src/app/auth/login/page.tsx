import Link from "next/link";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import LoginForm from "../_components/LoginForm";
import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";
import { getCurrentUserAccessState } from "@/lib/auth/accountAccessState";
import { redirect } from "next/navigation";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) => {
  const accessState = await getCurrentUserAccessState();
  const { account } = await searchParams;

  if (accessState?.status === "SUSPENDED") {
    redirect("/account-suspended");
  }

  if (accessState?.status === "ACTIVE") {
    redirect(getDashboardHomeByRole(accessState.role));
  }

  const blockedAccount =
    accessState?.status === "DELETED" || account === "deleted"
      ? "deleted"
      : null;

  const [site, config] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
  ]);

  return (
    <div>
      <LoginForm
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url}
        successHref="/account/dashboard"
        eyebrow="Secure Sign In"
        title={`Sign in to ${site.siteName}`}
        description="Enter your credentials below to sign in."
        blockedAccount={blockedAccount}
        footer={
          <div className="space-y-3 text-center">
            <p className="text-xs leading-relaxed text-slate-400">
              By signing in, you agree to {site.siteName}&apos;s{" "}
              <Link href="/terms" className="text-blue-200 hover:text-white">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-200 hover:text-white">
                Privacy Policy
              </Link>
              .
            </p>

            <p className="text-sm text-slate-400">
              New to {site.siteName}?
              <Link
                href="/auth/get-started"
                className="font-medium text-white underline-offset-4 hover:text-blue-200 hover:underline"
              >
                {""} Create your account
              </Link>
            </p>

            <p className="text-xs text-slate-500 hidden">
              Staff member?
              <Link
                href="/auth/login/administrator"
                className="ml-1 font-medium text-blue-200 underline-offset-4 hover:text-white hover:underline"
              >
                Administrator
              </Link>
            </p>
          </div>
        }
      />
    </div>
  );
};

export default page;
