import type { UserRole } from "./types";
import { PROTECTED_PREFIXES, ROLE_HOME_ROUTES } from "./types";

/** Returns the correct home route for a role */
export function roleHome(role: UserRole): string {
  return ROLE_HOME_ROUTES[role];
}

/** Returns true if a path belongs to another role's protected area */
export function isWrongRolePath(pathname: string, role: UserRole): boolean {
  for (const [r, prefix] of Object.entries(PROTECTED_PREFIXES)) {
    if (r !== role && pathname.startsWith(prefix)) return true;
  }
  return false;
}

/** Returns true if pathname is under a protected area */
export function isProtectedPath(pathname: string): boolean {
  return Object.values(PROTECTED_PREFIXES).some((p) => pathname.startsWith(p));
}

/** Returns true if pathname is an auth route */
export function isAuthPath(pathname: string): boolean {
  return pathname.startsWith("/login") || pathname.startsWith("/verify");
}
