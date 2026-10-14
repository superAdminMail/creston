import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend/mail";
import PasswordResetEmailTemplate from "./password-reset/PasswordResetEmailTemplate";
import { getSiteConfigurationCached } from "@/lib/site/getSiteConfigurationCached";
import VerifyEmailTemplate from "./verify-email/VerifyEmailTemplate";
import { sendPostVerificationWelcome } from "@/lib/welcome/sendPostVerificationWelcome";
import { generateAccountId } from "@/lib/auth/accountID";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { UserAccountStatus } from "@/generated/prisma";

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

function getAuthBaseUrl() {
  return (
    normalizeOrigin(process.env.APP_BASE_URL) ??
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeOrigin(process.env.BETTER_AUTH_URL) ??
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

async function assertAccountCanAuthenticate(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      accountStatus: true,
      isDeleted: true,
      isSuspended: true,
    },
  });

  if (
    !user ||
    user.isDeleted ||
    user.accountStatus === UserAccountStatus.DELETED
  ) {
    throw new APIError("FORBIDDEN", {
      message: "This account is unavailable.",
    });
  }

  if (user.accountStatus === UserAccountStatus.DEACTIVATED) {
    throw new APIError("FORBIDDEN", {
      message: "This account has been deactivated.",
    });
  }

  if (
    user.isSuspended ||
    user.accountStatus === UserAccountStatus.SUSPENDED ||
    user.accountStatus === UserAccountStatus.BLOCKED
  ) {
    throw new APIError("FORBIDDEN", {
      message: "This account is suspended.",
    });
  }

  if (user.accountStatus !== UserAccountStatus.ACTIVE) {
    throw new APIError("FORBIDDEN", {
      message: "This account is not eligible to sign in.",
    });
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;

      const body = ctx.body as { email?: unknown } | undefined;
      const email = body?.email;

      if (typeof email !== "string" || !email.trim()) return;

      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email.trim(),
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

      if (user) {
        await assertAccountCanAuthenticate(user.id);
      }
    }),
  },

  user: {
    additionalFields: {
      accountId: {
        type: "string",
        required: false,
        unique: true,
        input: false,
        returned: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            accountId: generateAccountId(),
          },
        }),
      },
    },

    session: {
      create: {
        before: async (session) => {
          await assertAccountCanAuthenticate(session.userId);
          return { data: session };
        },
      },
    },
  },

  baseURL: getAuthBaseUrl(),
  trustedOrigins: getTrustedOrigins(),

  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
    requireEmailVerification: true,

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

    onPasswordReset: async ({ user }) => {
      console.log(`Password reset completed for ${user.email}`);
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,

    async onEmailVerification(user: { id: string }) {
      await prisma.user.updateMany({
        where: {
          id: user.id,
          accountStatus: UserAccountStatus.PENDING_VERIFICATION,
          isDeleted: false,
          isSuspended: false,
        },
        data: {
          emailVerifiedAt: new Date(),
          accountStatus: UserAccountStatus.ACTIVE,
        },
      });
    },

    afterEmailVerification: async (user) => {
      await sendPostVerificationWelcome({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    },

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

  logger: {
    level: "debug",
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
