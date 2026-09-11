# Real-Time Pipeline Architecture: Aurora PostgreSQL LISTEN/NOTIFY → FastAPI SSE → Next.js

## Overview

After a doctor clicks "End Appointment" on the frontend, the system processes the consultation recording through a 3-step AI pipeline (transcription → report → follow-up) and delivers results to the browser in real-time without polling. This is achieved by chaining PostgreSQL's native LISTEN/NOTIFY mechanism with Server-Sent Events (SSE).

---

## End-to-End Data Flow

```
┌──────────────────┐     POST /end       ┌──────────────────────────┐
│  Next.js Client  │ ──────────────────→  │  FastAPI (uvicorn)        │
│  (Doctor Browser)│                      │                          │
│                  │                      │  1. Validates session     │
│                  │                      │  2. Sets status=processing│
│                  │                      │  3. Spawns BackgroundTask │
│                  │  ← 200 OK ────────── │                          │
│                  │                      └──────────┬───────────────┘
│                  │                                 │
│                  │                                 ▼
│                  │                      ┌──────────────────────────┐
│                  │                      │  Background Thread        │
│                  │                      │  _process_session_pipeline│
│                  │                      │                          │
│                  │                      │  Step 1: Compose GCS     │
│                  │                      │    chunks → transcribe   │
│                  │                      │    → commit to DB        │
│                  │                      │    → pg_notify(          │
│                  │                      │        'session_events', │
│                  │                      │        {event:           │
│                  │                      │     'transcription_      │
│                  │                      │       complete',...})     │
│                  │                      │          │               │
└────────┬─────────┘                      └──────────┼───────────────┘
         │                                           │
         │ EventSource                               │ PostgreSQL wire protocol
         │ (persistent HTTP)                         │ (NOTIFY payload)
         │                                           ▼
         │                                ┌──────────────────────────┐
         │                                │  Aurora PostgreSQL        │
         │                                │                          │
         │                                │  pg_notify fires on      │
         │                                │  channel 'session_events'│
         │                                │                          │
         │                                └──────────┬───────────────┘
         │                                           │
         │                                           │ asyncpg LISTEN callback
         │                                           ▼
         │                                ┌──────────────────────────┐
         │                                │  asyncpg Listener        │
         │                                │  (FastAPI lifespan)      │
         │                                │                          │
         │                                │  _on_notification()      │
         │                                │    → parse JSON payload  │
         │                                │    → lookup doctor_guid  │
         │                                │    → put into Queue(s)   │
         │                                └──────────┬───────────────┘
         │                                           │
         │                                           │ asyncio.Queue.put_nowait()
         │                                           ▼
         │                                ┌──────────────────────────┐
         │   SSE event: data: {...}       │  SSE Endpoint            │
         │ ←───────────────────────────── │  /events/{doctor_guid}   │
         │                                │                          │
         │                                │  event_generator() loop: │
         │                                │    await queue.get()     │
         │                                │    yield f"event:...\n"  │
         │                                └──────────────────────────┘
         ▼
┌──────────────────┐
│  useSessionEvents│
│  hook (React)    │
│                  │
│  EventSource     │
│  .addEventListener│
│  → setEvents()   │
│  → setLatestEvent│
└──────────────────┘
```

---

## Step-by-Step Breakdown

### 1. Frontend calls `POST /api/agent/ambient-session/end`

The `AmbientCoreWorkspace` component calls `stopRecording()` from `useAmbientRecording`, which:
- Stops the MediaRecorder (triggers final chunk upload)
- Hits the `/end` endpoint with the `session_guid`

The endpoint:
- Validates the session exists and is in `"recording"` state
- Immediately updates `transcription_status` to `"processing"` in the DB
- Spawns a `BackgroundTask` running `_process_session_pipeline(session_guid, SessionLocal)`
- Returns `200 { status: "processing", session_guid }` instantly

### 2. Background Pipeline Executes (3 Steps)

The background task gets its own SQLAlchemy `Session` (via `SessionLocal()`) to avoid interfering with the request lifecycle:

| Step | Action | DB Column Updated | pg_notify Event |
|------|--------|-------------------|-----------------|
| 1 | Compose GCS chunks → transcribe audio | `transcript`, `audio_stream_url` | `transcription_complete` |
| 2 | Generate clinical report from transcript | `transcript_metadata` (JSON) | `report_generated` |
| 3 | Generate follow-up message → insert `follow_up_queue` row | `follow_up_queue` table | `followup_queued` |

After each step: commit to DB first, then call `send_notify()`.

### 3. `send_notify()` — Fires PostgreSQL NOTIFY

```python
send_notify(db, doctor_guid, "transcription_complete", {
    "session_guid": session_guid,
    "transcript": transcript,
})
```

Under the hood (`util/pg_notify.py`):
- Opens a fresh `psycopg2` connection with `AUTOCOMMIT` isolation (required for NOTIFY)
- Executes: `SELECT pg_notify('session_events', '{"doctor_guid": ..., "event": ..., ...}')`
- Closes the connection immediately

Why a separate connection? SQLAlchemy's session management and transaction state can interfere with NOTIFY delivery. A raw psycopg2 autocommit connection guarantees the NOTIFY fires immediately.

### 4. Aurora PostgreSQL Delivers the Notification

PostgreSQL's LISTEN/NOTIFY is a built-in pub/sub mechanism:
- The `session_events` channel carries all pipeline events for all doctors
- Any connected client that has issued `LISTEN session_events` receives the payload
- Aurora PostgreSQL (AWS) supports this natively — no additional infrastructure needed
- Payload is limited to ~8000 bytes (the transcript and report are included directly)

### 5. asyncpg Listener Receives the Notification

On FastAPI startup (via the `lifespan` context manager in `main.py`):

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    conn = await start_listener()  # asyncpg.connect() + LISTEN
    app.state.pg_listen_conn = conn
    yield
    await stop_listener(conn)      # UNLISTEN + close
```

`start_listener()` establishes a persistent asyncpg connection and registers a callback:
- `await conn.add_listener("session_events", _on_notification)`
- When a NOTIFY arrives, `_on_notification` parses the JSON and calls `_dispatch(doctor_guid, payload)`

### 6. Queue Fan-Out to SSE Connections

The in-memory registry (`_queues: dict[str, set[asyncio.Queue]]`) maps each `doctor_guid` to a set of queues — one per active SSE connection (supports multiple tabs):

```python
def _dispatch(doctor_guid, payload):
    for queue in _queues[doctor_guid]:
        queue.put_nowait(payload)
```

### 7. SSE Endpoint Yields the Event

The `/events/{doctor_guid}` endpoint is a `StreamingResponse` with `media_type="text/event-stream"`:

```python
async def event_generator():
    queue = register_queue(doctor_guid)
    try:
        while not disconnected:
            payload = await asyncio.wait_for(queue.get(), timeout=30)
            yield f"event: {event_type}\ndata: {json.dumps(payload)}\n\n"
    finally:
        unregister_queue(doctor_guid, queue)
```

- 30-second timeout sends a `: keepalive\n\n` comment to prevent proxy/browser timeouts
- Checks `request.is_disconnected()` each iteration
- Cleans up the queue on disconnect

### 8. Next.js Client Receives the Event

The `useSessionEvents` hook opens an `EventSource` **directly to FastAPI** (not through Next.js rewrites, which buffer responses and break SSE):

```typescript
const url = `http://localhost:8000/api/agent/ambient-session/events/${doctorGuid}`;
const es = new EventSource(url);

es.addEventListener("transcription_complete", handleEvent);
es.addEventListener("report_generated", handleEvent);
es.addEventListener("followup_queued", handleEvent);
es.addEventListener("pipeline_failed", handleEvent);
```

Each event updates React state → triggers re-render → UI shows the transcript/report/follow-up as it arrives.

---

## Why Not Polling?

| Aspect | Polling | SSE (current) |
|--------|---------|---------------|
| Latency | 0–5s delay (poll interval) | ~50ms (wire time) |
| Server load | N requests per session × 3 steps | 1 persistent connection |
| Complexity | Timer management, race conditions | Single hook, auto-reconnect |
| Multi-session | Need to track & poll each session | One connection handles all sessions |

---

## Why Not WebSockets?

- SSE is unidirectional (server → client) which matches this use case exactly
- Native browser `EventSource` API handles reconnection automatically
- No need for a WebSocket library (socket.io, etc.)
- Simpler server implementation (no upgrade handshake, no frame protocol)
- Works through HTTP/2 multiplexing

---

## Key Implementation Details

### CORS
FastAPI has `allow_origins=["*"]` in dev, so the browser can connect directly from `localhost:3000` (Next.js) to `localhost:8000` (FastAPI) without CORS issues.

### Next.js Rewrite Bypass
Next.js API route rewrites buffer responses before forwarding, which breaks the streaming nature of SSE. The frontend connects directly to FastAPI's URL instead of going through the Next.js proxy.

### Multiple Sessions per Doctor
Since the SSE stream is scoped to `doctor_guid` (not `session_guid`), a single connection receives events from ALL of that doctor's in-flight sessions. The frontend filters by `session_guid` using `getEventsForSession(guid)`.

### Graceful Degradation
If the SSE connection fails, the frontend can fall back to the polling endpoint:
`GET /api/agent/ambient-session/status/{session_guid}`

---

## Production Considerations

1. **Payload size:** PostgreSQL NOTIFY payloads are limited to ~8KB. For very long transcripts, consider sending only a reference and letting the frontend fetch the full content.
2. **Connection pooling:** The asyncpg LISTEN connection is a single long-lived connection. It does NOT use a connection pool — this is by design (LISTEN requires a dedicated connection).
3. **Horizontal scaling:** If running multiple FastAPI instances, each needs its own LISTEN connection. All instances receive all notifications (PostgreSQL broadcasts to all listeners), so the queue registry correctly routes to whichever instance the doctor's SSE connection is on.
4. **SSL:** Aurora requires SSL. The asyncpg connection uses `ssl.create_default_context()` with hostname verification disabled (AWS-managed certs).
