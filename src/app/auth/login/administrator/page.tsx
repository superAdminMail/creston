import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "../../_components/LoginForm";
import { getDashboardHomeByRole } from "@/lib/auth/dashboard-home";
import { getCurrentUserAccessState } from "@/lib/auth/accountAccessState";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import type { DashboardRole } from "@/constants/dashboard-menu";
import { UserRole } from "@/generated/prisma";

const STAFF_ROLES: DashboardRole[] = [
  UserRole.ADMIN,
  UserRole.MODERATOR,
  UserRole.SUPER_ADMIN,
];

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
    const role = accessState.role as DashboardRole;
    if (STAFF_ROLES.includes(role)) {
      redirect(getDashboardHomeByRole(role));
    }
    redirect("/403");
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
        eyebrow="Staff Sign In"
        title={`Administrator access to ${site.siteName}`}
        description="Enter your credentials below to sign in."
        blockedAccount={blockedAccount}
        footer={
          <div className="space-y-3 text-center">
            <p className="text-xs leading-relaxed text-slate-400">
              Staff accounts only. Users should sign in through the main login
              page.
            </p>

            <p className="text-sm text-slate-400">
              Need the user login?
              <Link
                href="/auth/login"
                className="font-medium text-white underline-offset-4 hover:text-blue-200 hover:underline"
              >
                {""} Return to sign in
              </Link>
            </p>
          </div>
        }
      />
    </div>
  );
};

export default page;
