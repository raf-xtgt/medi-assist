import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { decodeJwt } from "@/lib/auth/session";

/**
 * GET /api/auth/me
 * Returns the JWT stored in the session cookie.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "No session" }, { status: 401 });
  const payload = decodeJwt(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  return NextResponse.json({ token });
}
