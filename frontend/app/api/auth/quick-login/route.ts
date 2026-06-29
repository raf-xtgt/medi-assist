import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { TESTING_CLINIC_USER_GUID, TESTING_DOCTOR_GUID } from "@/lib/api/model/testing-guid.model";

/**
 * GET /api/auth/quick-login?role=admin|doctor
 * Sets a session cookie for the specified role and redirects to their dashboard.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const role = searchParams.get("role");

  if (role !== "admin" && role !== "doctor") {
    return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
  }

  const userId = role === "admin" ? TESTING_CLINIC_USER_GUID : TESTING_DOCTOR_GUID;
  const userName = role === "admin" ? "Demo Admin" : "Dr. James";
  const userEmail = role === "admin" ? "admin@goodhealth.com" : "james@goodhealth.com";

  // Build a minimal JWT-like token (stub only)
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      name: userName,
      email: userEmail,
      role: role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 hours
    })
  );
  const stubToken = `${header}.${payload}.stub`;

  const redirectUrl = new URL(role === "admin" ? "/admin/dashboard" : "/doctor/dashboard", req.url);
  const res = NextResponse.redirect(redirectUrl);

  res.cookies.set(SESSION_COOKIE, stubToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return res;
}
