import { type NextRequest, NextResponse } from "next/server";
import { decodeJwt, isExpired, payloadToSession, SESSION_COOKIE } from "@/lib/auth/session";
import { isAuthPath, isProtectedPath, isWrongRolePath, roleHome } from "@/lib/auth/guards";
import type { UserRole } from "@/lib/auth/types";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public paths — skip entirely
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/" ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // Zero-login patient paths — publicly accessible without a session
  const PUBLIC_PATIENT_PATHS = [
    "/patient/landing",
    "/patient/book",
    "/patient/triage",
  ];
  if (PUBLIC_PATIENT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token   = req.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? decodeJwt(token) : null;

  // If no valid token and trying to access a protected route → redirect to login
  if (!payload || isExpired(payloadToSession(token!, payload))) {
    if (isProtectedPath(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const role = payload.role as UserRole;

  // Already authenticated and hitting an auth path → redirect home
  if (isAuthPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = roleHome(role);
    url.searchParams.delete("from");
    return NextResponse.redirect(url);
  }

  // Comment out to not enforce auth
  // Accessing another role's area → redirect to own home
  // if (isWrongRolePath(pathname, role)) {
  //   const url = req.nextUrl.clone();
  //   url.pathname = roleHome(role);
  //   return NextResponse.redirect(url);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.ico
     * - images/      (public images folder)
     * - doctors/     (public doctor headshot images)
     * - *.png, *.jpg, *.svg, *.ico, *.webp (static assets)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|images/|doctors/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)).*)",
  ],
};
