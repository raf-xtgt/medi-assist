"""PostgreSQL LISTEN/NOTIFY utilities.

This module provides:
1. A function to fire pg_notify() from background tasks after DB writes.
2. A long-lived asyncpg listener that dispatches notifications to SSE clients.
3. A per-doctor asyncio.Queue registry for fan-out to SSE connections.

Architecture:
  Background Task (after DB commit)
       │
       ▼
  pg_notify('session_events', '{"doctor_guid": ..., "event": ..., ...}')
       │
       ▼  (PostgreSQL LISTEN/NOTIFY wire protocol)
  AsyncPG Listener (on FastAPI startup)
       │
       ▼
  In-memory Queue per doctor_guid
       │
       ▼
  SSE endpoint yields events to the frontend
"""

import asyncio
import json
import os
from collections import defaultdict
from typing import Any

import asyncpg

from dotenv import load_dotenv

load_dotenv()

# ─── Channel name used for all session events ───────────────────────────────
CHANNEL = "session_events"

# ─── In-memory registry: doctor_guid -> set of asyncio.Queue ─────────────────
# Multiple SSE connections per doctor are supported (e.g., multiple tabs).
_queues: dict[str, set[asyncio.Queue]] = defaultdict(set)


def _get_asyncpg_dsn() -> str:
    """Build an asyncpg-compatible DSN from the DATABASE_URL env var.

    asyncpg does NOT support ssl/sslmode as a query parameter.
    We strip it from the DSN and pass ssl=True to asyncpg.connect() instead.
    """
    dsn = os.environ.get("DATABASE_URL", "")
    # Normalize various prefixes to plain postgresql://
    if dsn.startswith("postgresql+asyncpg://"):
        dsn = dsn.replace("postgresql+asyncpg://", "postgresql://", 1)
    elif dsn.startswith("postgres://"):
        dsn = dsn.replace("postgres://", "postgresql://", 1)
    # Remove ssl/sslmode query params — handled via ssl=True kwarg
    dsn = dsn.replace("?ssl=require", "")
    dsn = dsn.replace("&ssl=require", "")
    dsn = dsn.replace("?sslmode=require", "")
    dsn = dsn.replace("&sslmode=require", "")
    return dsn


def _dsn_needs_ssl() -> bool:
    """Check if the original DATABASE_URL requests SSL."""
    dsn = os.environ.get("DATABASE_URL", "")
    return "ssl=require" in dsn or "sslmode=require" in dsn


# ─── Queue management ────────────────────────────────────────────────────────

def register_queue(doctor_guid: str) -> asyncio.Queue:
    """Register a new SSE client queue for a doctor. Returns the queue."""
    q: asyncio.Queue = asyncio.Queue()
    _queues[doctor_guid].add(q)
    return q


def unregister_queue(doctor_guid: str, q: asyncio.Queue) -> None:
    """Remove a queue when an SSE connection closes."""
    _queues[doctor_guid].discard(q)
    if not _queues[doctor_guid]:
        del _queues[doctor_guid]


def _dispatch(doctor_guid: str, payload: dict[str, Any]) -> None:
    """Push an event to all queues listening for a given doctor."""
    for q in _queues.get(doctor_guid, set()):
        try:
            q.put_nowait(payload)
        except asyncio.QueueFull:
            pass  # Drop if the client is too slow


# ─── Notify (called by background tasks after DB commit) ─────────────────────

def send_notify(db_session, doctor_guid: str, event_type: str, data: dict[str, Any]) -> None:
    """Issue a pg_notify on the session_events channel.

    Uses a fresh psycopg2 connection (independent of SQLAlchemy session)
    to guarantee the NOTIFY fires regardless of SQLAlchemy's internal state.

    Args:
        db_session: SQLAlchemy Session (unused now, kept for API compat)
        doctor_guid: Target doctor for routing
        event_type: e.g. 'transcription_complete', 'report_generated', 'followup_queued'
        data: Arbitrary JSON-serializable payload
    """
    import psycopg2

    payload = json.dumps({
        "doctor_guid": doctor_guid,
        "event": event_type,
        **data,
    })

    # Build a psycopg2-compatible DSN
    dsn = os.environ.get("DATABASE_URL", "")
    if dsn.startswith("postgresql+asyncpg://"):
        dsn = dsn.replace("postgresql+asyncpg://", "postgresql://", 1)
    elif dsn.startswith("postgres://"):
        dsn = dsn.replace("postgres://", "postgresql://", 1)
    # psycopg2 uses sslmode=require
    dsn = dsn.replace("?ssl=require", "?sslmode=require")
    dsn = dsn.replace("&ssl=require", "&sslmode=require")

    conn = None
    try:
        conn = psycopg2.connect(dsn)
        conn.set_isolation_level(0)  # AUTOCOMMIT — required for NOTIFY
        cursor = conn.cursor()
        cursor.execute("SELECT pg_notify(%s, %s);", (CHANNEL, payload))
        cursor.close()
        print(f"[pg_notify] NOTIFY sent: {event_type} for doctor {doctor_guid[:8]}...")
    except Exception as e:
        print(f"[pg_notify] ERROR sending notify: {e}")
    finally:
        if conn:
            conn.close()


# ─── Async Listener (started on FastAPI lifespan) ────────────────────────────

async def _on_notification(conn, pid, channel, payload):
    """Callback when a NOTIFY arrives on the channel."""
    print(f"[pg_notify] notification received")
    try:
        data = json.loads(payload)
        print(f"[pg_notify] notification data '{data}'")
        doctor_guid = data.get("doctor_guid")
        if doctor_guid:
            _dispatch(doctor_guid, data)
    except (json.JSONDecodeError, KeyError) as e:
        print(f"[pg_notify] Failed to parse notification: {e}")


async def start_listener() -> asyncpg.Connection:
    """Connect to PostgreSQL and LISTEN on the session_events channel.

    Returns the connection (keep a reference to prevent GC).
    Call this during FastAPI startup.
    """
    dsn = _get_asyncpg_dsn()
    connect_kwargs = {}
    if _dsn_needs_ssl():
        import ssl as ssl_module
        # Create a permissive SSL context (Aurora uses AWS-managed certs)
        ssl_ctx = ssl_module.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl_module.CERT_NONE
        connect_kwargs["ssl"] = ssl_ctx

    conn = await asyncpg.connect(dsn, **connect_kwargs)
    await conn.add_listener(CHANNEL, _on_notification)
    print(f"[pg_notify] Listening on channel '{CHANNEL}'")
    return conn


async def stop_listener(conn: asyncpg.Connection) -> None:
    """Remove listener and close connection. Call during FastAPI shutdown."""
    await conn.remove_listener(CHANNEL, _on_notification)
    await conn.close()
    print(f"[pg_notify] Stopped listening on channel '{CHANNEL}'")
