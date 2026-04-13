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
];

export const authRoutes = [
  "/auth/login",
  "/auth/get-started",
  "/auth/onboarding",
  "/auth/verify-email",
  "/auth/reset-password",
  "/auth/forgot-password",
  "/error",
];

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/account/dashboard";
export const DEFAULT_ONBOARDING_REDIRECT = "/auth/onboarding";

export const staffRoutePrefix = "/account";

export const sharedRoutes = ["/profile", "/settings"];
