import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/mail";
import PasswordResetEmailTemplate from "./password-reset/PasswordResetEmailTemplate";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import VerifyEmailTemplate from "./verify-email/VerifyEmailTemplate";

function normalizeOrigin(value: string | undefined | null) {
  if (!value) return null;

  const trimmed = value.trim();

  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${trimmed.replace(/\/$/, "")}`;
}

function isDefinedOrigin(value: string | null): value is string {
  return typeof value === "string" && value.length > 0;
}

export function getAuthBaseUrl() {
  return (
    normalizeOrigin(process.env.BETTER_AUTH_URL) ??
    normalizeOrigin(process.env.APP_BASE_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeOrigin(process.env.NEXTAUTH_URL) ??
    "http://localhost:3000"
  );
}

function getTrustedOrigins() {
  const origins = [
    getAuthBaseUrl(),
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    normalizeOrigin(process.env.VERCEL_URL),
  ];

  const extraOrigins = process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map(
    (origin) => normalizeOrigin(origin),
  );

  return Array.from(
    new Set([...origins, ...(extraOrigins ?? [])].filter(isDefinedOrigin)),
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: getAuthBaseUrl(),
  trustedOrigins: getTrustedOrigins(),

  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url }) => {
      const site = await getSiteConfigurationCached();

      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        html: PasswordResetEmailTemplate({
          resetUrl: url,
          expiresInMinutes: 30,
          siteName: site?.siteName?.trim() || "Company",
          siteLogoUrl: site?.siteLogoFileAsset?.url ?? null,
        }),
        from: process.env.EMAIL_FROM_NO_REPLY,
        replyTo: process.env.EMAIL_FROM_SUPPORT,
      });
    },

    // optional
    onPasswordReset: async ({ user }) => {
      console.log(`Password reset completed for ${user.email}`);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,

    sendVerificationEmail: async ({ user, url }) => {
      const site = await getSiteConfigurationCached();

        void sendEmail({
          to: user.email,
          subject: `Verify your ${site?.siteName?.trim() || "Company"} email`,
          html: VerifyEmailTemplate({
            verifyUrl: url,
            expiresInMinutes: 60,
            siteName: site?.siteName?.trim() || "Company",
            siteLogoUrl: site?.siteLogoFileAsset?.url ?? null,
          }),
          from: process.env.EMAIL_FROM_NO_REPLY,
          replyTo: process.env.EMAIL_FROM_SUPPORT,
        });
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwt",
    },
  },
});
