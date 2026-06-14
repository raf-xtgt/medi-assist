import { type NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/send-otp
 * Proxies to FastAPI OTP sender (or stub for now).
 */
export async function POST(req: NextRequest) {
  const { identifier } = await req.json();

  if (!identifier) {
    return NextResponse.json({ error: "identifier required" }, { status: 400 });
  }

  // TODO: proxy to FastAPI →  POST /api/agent/auth/send-otp
  // const res = await fetch(`${process.env.FASTAPI_URL}/api/agent/auth/send-otp`, { ... });

  // Stub: always succeed in development
  console.log(`[medi-assist] Sending OTP to ${identifier}`);
  return NextResponse.json({ message: "OTP sent", identifier });
}
