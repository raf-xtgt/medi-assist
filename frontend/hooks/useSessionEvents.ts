"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/api/constants";

/**
 * Event types pushed from the backend SSE stream.
 * Maps to the pipeline stages in ambient_session_controller.py.
 */
export type SessionEventType =
  | "transcription_complete"
  | "report_generated"
  | "followup_queued"
  | "pipeline_failed";

export interface SessionEvent {
  event: SessionEventType;
  doctor_guid: string;
  session_guid: string;
  appointment_guid: string;
  transcript?: string;
  report?: Record<string, unknown>;
  followup_guid?: string;
  follow_up_msg?: string;
  error?: string;
}

interface UseSessionEventsOptions {
  /** The doctor GUID to subscribe to events for */
  doctorGuid: string;
  /** Whether the connection should be active */
  enabled?: boolean;
  /** Route through Next.js proxy (/api/agent/...) to avoid CORS. Default: false */
  useProxy?: boolean;
}

interface UseSessionEventsReturn {
  /** All events received (accumulates across sessions) */
  events: SessionEvent[];
  /** Latest event received */
  latestEvent: SessionEvent | null;
  /** Whether the EventSource connection is open */
  isConnected: boolean;
  /** Any connection error */
  error: string | null;
  /** Get all events for a specific session */
  getEventsForSession: (sessionGuid: string) => SessionEvent[];
  /** Clear events (e.g., on logout) */
  clearEvents: () => void;
}

/**
 * Hook that connects to the backend SSE stream for real-time session updates.
 *
 * Opens a single EventSource connection per doctor. Events arrive as each
 * pipeline step completes (transcription → report → follow-up), eliminating
 * the need for polling.
 *
 * Architecture:
 *   Background Task (DB commit) → pg_notify → asyncpg listener → SSE → this hook
 */
export function useSessionEvents({
  doctorGuid,
  enabled = true,
  useProxy = false,
}: UseSessionEventsOptions): UseSessionEventsReturn {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [latestEvent, setLatestEvent] = useState<SessionEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled || !doctorGuid) return;

    // When useProxy is true, route through the Next.js API route (same origin)
    // to avoid CORS issues with ngrok/external URLs.
    // The API route at /api/agent/ambient-session/events/[doctorGuid] proxies
    // the SSE stream from FastAPI.
    const baseUrl = useProxy ? "" : API_BASE_URL;
    const url = `${baseUrl}/api/agent/ambient-session/events/${doctorGuid}`;

    console.log("[useSessionEvents] Opening EventSource:", url);
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log("[useSessionEvents] Connection opened");
      setIsConnected(true);
      setError(null);
    };

    es.onerror = (err) => {
      console.error("[useSessionEvents] Connection error:", err);
      setIsConnected(false);
      // EventSource auto-reconnects; only set error if fully closed
      if (es.readyState === EventSource.CLOSED) {
        setError("SSE connection closed");
        console.error("[useSessionEvents] Connection CLOSED (will not reconnect)");
      }
    };

    // Listen for each event type
    const eventTypes: SessionEventType[] = [
      "transcription_complete",
      "report_generated",
      "followup_queued",
      "pipeline_failed",
    ];

    const handleEvent = (e: MessageEvent) => {
      try {
        console.log("[useSessionEvents] Event received:", e.type, e.data);
        const data: SessionEvent = JSON.parse(e.data);
        setEvents((prev) => [...prev, data]);
        setLatestEvent(data);
      } catch (err) {
        console.error("[useSessionEvents] Failed to parse event:", err);
      }
    };

    eventTypes.forEach((type) => {
      es.addEventListener(type, handleEvent);
    });

    return () => {
      eventTypes.forEach((type) => {
        es.removeEventListener(type, handleEvent);
      });
      es.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [doctorGuid, enabled, useProxy]);

  const getEventsForSession = useCallback(
    (sessionGuid: string): SessionEvent[] => {
      return events.filter((e) => e.session_guid === sessionGuid);
    },
    [events]
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
    setLatestEvent(null);
  }, []);

  return {
    events,
    latestEvent,
    isConnected,
    error,
    getEventsForSession,
    clearEvents,
  };
}
