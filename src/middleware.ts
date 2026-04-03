import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
} from "./routes";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // BetterAuth session cookie
  const isLoggedIn = Boolean(
    req.cookies.get("better-auth.session_token")?.value ??
    req.cookies.get("better-auth.session")?.value,
  );

  const isPublicRoute = publicRoutes.some(
    (route) =>
      route === "/"
        ? pathname === route
        : pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);

  // --- DEV LOGGING (SAFE) ---
  if (process.env.NODE_ENV === "development") {
    console.log("🧠 BetterAuth Middleware");
    console.log("➡️ Path:", pathname);
    console.log("👤 Logged In:", isLoggedIn);
    console.log("🌐 Public:", isPublicRoute);
    console.log("🔐 Auth UI:", isAuthRoute);
    console.log("🧩 Auth API:", isApiAuthRoute);
    console.log("------------------------");
  }

  // ✅ Always allow BetterAuth API routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // ✅ Logged-in users should not access auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
  }

  // ✅ Not logged in → block protected routes
  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|favicon.ico|public).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
