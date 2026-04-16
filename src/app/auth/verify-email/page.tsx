import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { VerifyEmailRequestInlineForm } from "../_components/VerifyEmailRequestForm";
import { AuthShell } from "@/app/auth/_components/AuthShell";
import { Button } from "@/components/ui/button";
import { getCurrentSessionUser } from "@/lib/getCurrentSessionUser";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import { getSiteSeoConfig } from "@/lib/seo/getSiteSeoConfig";
import { prisma } from "@/lib/prisma";

type VerifyEmailPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function resolveVerificationState(
  params: Record<string, string | string[] | undefined>,
) {
  const error =
    getSingleParam(params.error)?.toLowerCase() ??
    getSingleParam(params.status)?.toLowerCase() ??
    "";

  const success =
    getSingleParam(params.success)?.toLowerCase() ??
    getSingleParam(params.verified)?.toLowerCase() ??
    "";

  const email = getSingleParam(params.email)?.toLowerCase().trim();

  if (success === "true" || success === "1" || success === "yes") {
    return { state: "success" as const, email };
  }

  if (
    error.includes("expired") ||
    error.includes("token_expired") ||
    error.includes("verification_expired")
  ) {
    return { state: "expired" as const, email };
  }

  if (
    error.includes("invalid") ||
    error.includes("token_invalid") ||
    error.includes("verification_invalid") ||
    error.includes("used") ||
    error.includes("failed")
  ) {
    return { state: "invalid" as const, email };
  }

  return { state: "default" as const, email };
}

function StateCard({
  icon,
  title,
  description,
  tone = "default",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone?: "success" | "warning" | "danger" | "default";
  children?: React.ReactNode;
}) {
  const styles = {
    success: "border-emerald-500/20 bg-emerald-500/10",
    warning: "border-amber-400/20 bg-amber-500/10",
    danger: "border-red-400/20 bg-red-500/10",
    default: "border-white/10 bg-white/[0.03]",
  };

  return (
    <div
      className={`space-y-5 rounded-3xl border p-5 backdrop-blur-sm ${styles[tone]}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
          {icon}
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="text-sm leading-6 text-slate-300">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

async function reconcileVerifiedUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      accountStatus: true,
      emailVerifiedAt: true,
    },
  });

  if (!user) return null;

  if (user.emailVerified && user.accountStatus !== "ACTIVE") {
    const verifiedAt = user.emailVerifiedAt ?? new Date();

    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: "ACTIVE",
        emailVerifiedAt: verifiedAt,
      },
    });

    return {
      ...user,
      accountStatus: "ACTIVE" as const,
      emailVerifiedAt: verifiedAt,
    };
  }

  return user;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = (await searchParams) ?? {};
  const [site, config, sessionUser] = await Promise.all([
    getSiteSeoConfig(),
    getSiteConfigurationCached(),
    getCurrentSessionUser(),
  ]);

  const { state, email } = resolveVerificationState(params);

  const user = await reconcileVerifiedUser(sessionUser?.id ?? "");

  const isActivated = user?.emailVerified && user.accountStatus === "ACTIVE";

  if (isActivated) {
    return (
      <AuthShell
        eyebrow="Account Security"
        title="Email verified"
        description={`Your ${site.siteName} account is now verified and ready to continue.`}
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url}
      >
        <div className="space-y-6">
          <StateCard
            tone="success"
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-300" />}
            title="Your email has been verified"
            description="Your account has been secured successfully. You can continue to your account dashboard."
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">
                    Verification complete
                  </p>
                  <p className="text-xs leading-6 text-slate-400">
                    Sensitive account features can now be accessed normally.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="btn-primary h-11 rounded-2xl px-5 text-sm font-semibold text-white"
              >
                <Link href="/account">Continue to account</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-11 rounded-2xl border-white/10 bg-white/[0.03] px-5 text-sm text-white hover:bg-white/[0.06]"
              >
                <Link href="/auth/login">Go to sign in</Link>
              </Button>
            </div>
          </StateCard>
        </div>
      </AuthShell>
    );
  }

  if (state === "expired") {
    return (
      <AuthShell
        eyebrow="Account Security"
        title="Verification link expired"
        description={`Request a fresh verification link for your ${site.siteName} account.`}
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url}
      >
        <VerifyEmailRequestInlineForm defaultEmail={email} mode="expired" />
      </AuthShell>
    );
  }

  if (state === "invalid") {
    return (
      <AuthShell
        eyebrow="Account Security"
        title="Verification link invalid"
        description={`Request a fresh verification link for your ${site.siteName} account.`}
        siteName={site.siteName}
        siteLogoUrl={config?.siteLogoFileAsset?.url}
      >
        <VerifyEmailRequestInlineForm defaultEmail={email} mode="invalid" />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account Security"
      title="Verify your email"
      description={`Use the link sent to your inbox to verify your ${site.siteName} account.`}
      siteName={site.siteName}
      siteLogoUrl={config?.siteLogoFileAsset?.url}
    >
      <div className="space-y-6">
        <StateCard
          tone="default"
          icon={<RefreshCcw className="h-5 w-5 text-blue-300" />}
          title="Check your inbox"
          description="Open the latest verification email we sent you and use the secure link to complete account verification."
        >
          <VerifyEmailRequestInlineForm defaultEmail={email} />
        </StateCard>

        <StateCard
          tone="danger"
          icon={<AlertCircle className="h-5 w-5 text-red-300" />}
          title="Still having trouble?"
          description="If your link is invalid or expired, request a fresh verification email and use the newest message in your inbox."
        />
      </div>
    </AuthShell>
  );
}
