import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  apiAuthPrefix,
  authRoutes,
  protectedRoutePrefixes,
  publicRoutes,
} from "./routes";

function matchesRoute(pathname: string, route: string) {
  if (route === "/") return pathname === "/";
  return pathname === route || pathname.startsWith(`${route}/`);
}

function matchesAny(pathname: string, routes: readonly string[]) {
  return routes.some((route) => matchesRoute(pathname, route));
}

function hasSessionCookie(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name;

    return (
      name === "session_token" ||
      name === "session_data" ||
      name === "better-auth.session_token" ||
      name === "better-auth.session" ||
      name.startsWith("better-auth.session") ||
      name.startsWith("__Secure-better-auth.session") ||
      name.startsWith("__Secure-session_token") ||
      name.startsWith("__Secure-session_data")
    );
  });
}

function isProtectedPath(pathname: string) {
  return protectedRoutePrefixes.some((prefix) =>
    matchesRoute(pathname, prefix),
  );
}

function isAuthUtilityRoute(pathname: string) {
  return (
    matchesRoute(pathname, "/auth/verify-email") ||
    matchesRoute(pathname, "/auth/send-verify-email")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = matchesAny(pathname, publicRoutes);
  const isAuthRoute = matchesAny(pathname, authRoutes);
  const isProtectedRoute = isProtectedPath(pathname);
  const hasCookie = hasSessionCookie(request);
  const isAuthUtility = isAuthUtilityRoute(pathname);

  if (process.env.NODE_ENV === "development") {
    console.log("🧠 BetterAuth Middleware");
    console.log({
      "➡️ Path": pathname,
      "🍪 Has Cookie & isLoggedin": hasCookie,
      "🌐 Public": isPublicRoute,
      "🔐 Auth": isAuthRoute,
      "🛡️ Protected": isProtectedRoute,
      "✉️ Verify Flow": isAuthUtility,
      "🧩 API Auth": isApiAuthRoute,
    });
    console.log("------------------------");
  }

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isAuthUtility) {
      return NextResponse.next();
    }

    if (hasCookie) {
      return NextResponse.redirect(new URL("/account", request.url));
    }

    return NextResponse.next();
  }

  if (isProtectedRoute && !hasCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/:path*",
    "/account/:path*",
    "/api/auth/:path*",
    "/403",
    "/cookies",
    "/help",
    "/privacy",
    "/terms",
    "/compliance",
    "/contact",
    "/error",
  ],
};

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// import {
//   publicRoutes,
//   authRoutes,
//   apiAuthPrefix,
//   DEFAULT_LOGIN_REDIRECT,
//   DEFAULT_ONBOARDING_REDIRECT,
// } from "./routes";

// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   const isLoggedIn = Boolean(
//     req.cookies.get("better-auth.session_token")?.value ??
//     req.cookies.get("better-auth.session")?.value,
//   );

//   const isPublicRoute = publicRoutes.some((route) =>
//     route === "/"
//       ? pathname === route
//       : pathname === route || pathname.startsWith(`${route}/`),
//   );

//   const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
//   const isOnboardingRoute =
//     pathname === DEFAULT_ONBOARDING_REDIRECT ||
//     pathname.startsWith(`${DEFAULT_ONBOARDING_REDIRECT}/`);
//   const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);

//   if (process.env.NODE_ENV === "development") {
//     console.log("🧠 BetterAuth Middleware");
//     console.log("➡️ Path:", pathname);
//     console.log("👤 Logged In:", isLoggedIn);
//     console.log("🌐 Public:", isPublicRoute);
//     console.log("🔐 Auth UI:", isAuthRoute);
//     console.log("🧩 Auth API:", isApiAuthRoute);
//     console.log("------------------------");
//   }

//   if (isApiAuthRoute) {
//     return NextResponse.next();
//   }

//   if (isAuthRoute && isLoggedIn && !isOnboardingRoute) {
//     return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
//   }

//   if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
//     return NextResponse.redirect(new URL("/auth/login", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/((?!.+\\.[\\w]+$|_next|favicon.ico|public).*)",
//     "/",
//     "/(api|trpc)(.*)",
//   ],
// };
