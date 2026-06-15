"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { OtpState, Session, UserRole } from "@/lib/auth/types";
import { decodeJwt, isExpired, payloadToSession } from "@/lib/auth/session";
import { roleHome } from "@/lib/auth/guards";
import { useRouter } from "next/navigation";

interface SessionContextValue {
  session:    Session | null;
  isLoading:  boolean;
  otpState:   OtpState;
  sendOtp:    (identifier: string) => Promise<void>;
  verifyOtp:  (identifier: string, otp: string) => Promise<void>;
  signOut:    () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession]   = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [otpState, setOtpState] = useState<OtpState>("idle");

  /* Rehydrate from /api/auth/me on mount */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const { token } = await res.json();
          const payload = decodeJwt(token);
          if (payload) {
            const s = payloadToSession(token, payload);
            if (!isExpired(s)) setSession(s);
          }
        }
      } catch {
        // unauthenticated — leave session null
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const sendOtp = useCallback(async (identifier: string) => {
    setOtpState("sending");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      if (!res.ok) throw new Error("Failed to send OTP");
      setOtpState("awaiting_otp");
    } catch {
      setOtpState("error");
    }
  }, []);

  const verifyOtp = useCallback(
    async (identifier: string, otp: string) => {
      setOtpState("verifying");
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier, otp }),
        });
        if (!res.ok) throw new Error("Invalid OTP");
        const { token } = await res.json();
        const payload = decodeJwt(token);
        if (!payload) throw new Error("Bad token");
        const s = payloadToSession(token, payload);
        setSession(s);
        setOtpState("authenticated");
        router.push(roleHome(s.user.role as UserRole));
      } catch {
        setOtpState("error");
      }
    },
    [router]
  );

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setSession(null);
    setOtpState("idle");
    router.push("/login");
  }, [router]);

  return (
    <SessionContext.Provider
      value={{ session, isLoading, otpState, sendOtp, verifyOtp, signOut }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionContext must be used inside SessionProvider");
  return ctx;
}
