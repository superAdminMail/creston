export const publicRoutes = [
  "/",
  "/403",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/api/uploadthing",
  "/cookies",
  "/help",
  "/privacy",
  "/terms",
  "/compliance",
  "/contact",
] as const;

export const authRoutes = [
  "/auth/login",
  "/auth/get-started",
  "/auth/onboarding",
  "/auth/verify-email",
  "/auth/send-verify-email",
  "/auth/reset-password",
  "/auth/forgot-password",
  "/error",
] as const;

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/account";
export const DEFAULT_ONBOARDING_REDIRECT = "/auth/onboarding";

export const protectedRoutePrefixes = ["/account"] as const;

export const sharedRoutes = [
  "/account/dashboard/profile",
  "/account/dashboard/settings",
] as const;
