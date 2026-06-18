/**
 * SSE Proxy Route — streams events from FastAPI to the browser.
 *
 * Next.js rewrites buffer responses (killing SSE streaming). This API route
 * manually proxies the EventStream from FastAPI, bypassing that limitation.
 *
 * Browser → GET /api/agent/ambient-session/events/:doctorGuid
 *        → This route fetches from FastAPI and pipes the stream back.
 */

const FASTAPI_URL = process.env.FASTAPI_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ doctorGuid: string }> }
) {
  const { doctorGuid } = await params;

  const upstreamUrl = `${FASTAPI_URL}/api/agent/ambient-session/events/${doctorGuid}`;

  // Fetch the upstream SSE stream from FastAPI
  const upstreamResponse = await fetch(upstreamUrl, {
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
    cache: "no-store",
  });

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return new Response("Failed to connect to event stream", { status: 502 });
  }

  // Pipe the ReadableStream directly back to the browser
  return new Response(upstreamResponse.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
