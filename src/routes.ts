export const publicRoutes = [
  "/",
  "/403",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/api/uploadthing",
  "/cookies",
  "/help",
];

export const authRoutes = ["/auth/login", "/auth/register", "/error"];

export const apiAuthPrefix = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT = "/account/dashboard";

export const STAFF_LOGIN_REDIRECT = "/account/dashboard";

export const staffRoutePrefix = "/account/dashboard";

export const sharedRoutes = ["/profile", "/settings"];
