"use client";

import { useState, useEffect, useCallback } from "react";
import {
  savePatientSession,
  getPatientSession,
  clearPatientSession,
  type PatientSessionData,
} from "@/lib/patient-session";

/**
 * React hook for hydration-safe access to the encrypted patient session.
 *
 * On mount, asynchronously decrypts the stored session (typically < 5ms).
 * `isLoading` is `true` until the initial check completes, preventing
 * a flash of the wrong UI during SSR → client hydration.
 */
export function usePatientSession() {
  const [session, setSession] = useState<PatientSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ── Initial load ──────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getPatientSession();
        if (!cancelled) setSession(data);
      } catch {
        // Storage unavailable or corrupt — treat as no session
        if (!cancelled) setSession(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  /* ── Save ──────────────────────────────────────────────── */
  const saveSession = useCallback(async (data: PatientSessionData) => {
    await savePatientSession(data);
    setSession(data);
  }, []);

  /* ── Clear ─────────────────────────────────────────────── */
  const clearSession = useCallback(() => {
    clearPatientSession();
    setSession(null);
  }, []);

  return {
    patientGuid:  session?.patientGuid  ?? null,
    patientName:  session?.patientName  ?? null,
    patientPhone: session?.patientPhone ?? null,
    isLoading,
    saveSession,
    clearSession,
  };
}
