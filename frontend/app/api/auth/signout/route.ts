import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * POST /api/auth/signout
 * Clears the session cookie.
 */
export async function POST(_req: NextRequest) {
  const res = NextResponse.json({ message: "Signed out" });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
