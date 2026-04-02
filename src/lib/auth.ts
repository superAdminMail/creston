import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

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
  },

  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwt", // or "jwt" or "compact"
    },
  },
});
