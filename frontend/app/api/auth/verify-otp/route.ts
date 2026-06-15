import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/session";

/**
 * POST /api/auth/verify-otp
 * Verifies OTP and sets a session cookie.
 *
 * Stub implementation: accepts OTP "123456" for demo.
 * Replace with real FastAPI call when backend is ready.
 */
export async function POST(req: NextRequest) {
  const { identifier, otp, role } = await req.json();

  if (!identifier || !otp) {
    return NextResponse.json({ error: "identifier and otp required" }, { status: 400 });
  }

  // TODO: proxy to FastAPI → POST /api/agent/auth/verify-otp
  // const res = await fetch(`${process.env.FASTAPI_URL}/api/agent/auth/verify-otp`, { ... });

  // Stub: accept "123456" and assign requested role (defaults to "patient")
  if (otp !== "123456") {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
  }

  const userRole  = (role as string) || "patient";
  const userId    = `stub_${Date.now()}`;
  const userName  = identifier.includes("@") ? identifier.split("@")[0] : "Demo User";

  // Build a minimal JWT-like token (not cryptographically signed — stub only)
  const header  = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub:   userId,
      name:  userName,
      email: identifier.includes("@") ? identifier : `${userName}@mediassist.health`,
      phone: identifier.includes("@") ? undefined : identifier,
      role:  userRole,
      iat:   Math.floor(Date.now() / 1000),
      exp:   Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 hours
    })
  );
  const stubToken = `${header}.${payload}.stub`;

  const res = NextResponse.json({ token: stubToken });
  res.cookies.set(SESSION_COOKIE, stubToken, {
    httpOnly: true,
    sameSite: "lax",
    secure:   process.env.NODE_ENV === "production",
    maxAge:   60 * 60 * 8,
    path:     "/",
  });
  return res;
}
