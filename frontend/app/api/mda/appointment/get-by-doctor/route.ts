/**
 * Proxy Route — POST /api/mda/appointment/get-by-doctor
 *
 * Routes the get-by-doctor request server-side to avoid:
 *   - CORS preflight failures (browser → ngrok)
 *   - Stale/expired ngrok tunnel issues
 *
 * Browser → POST /api/mda/appointment/get-by-doctor
 *        → This route → FastAPI (http://localhost:8000 or FASTAPI_URL)
 */

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const upstreamUrl = `${FASTAPI_URL}/api/mda/appointment/get-by-doctor`;

  let body: string;
  try {
    body = await request.text();
  } catch {
    return new Response(JSON.stringify({ detail: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
      // Next.js server-side fetch — no CORS restrictions
      cache: "no-store",
    });
  } catch (err) {
    console.error("[proxy/get-by-doctor] Failed to reach FastAPI:", err);
    return new Response(
      JSON.stringify({ detail: "Failed to reach backend" }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const responseBody = await upstreamResponse.text();

  return new Response(responseBody, {
    status: upstreamResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}
