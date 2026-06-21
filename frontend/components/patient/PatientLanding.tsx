"use client";

import { Shield, Zap, CalendarCheck } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { UnifiedBookingTriage } from "@/components/patient/UnifiedBookingTriage";

export function PatientLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--patient-landing-bg)]">
      {/* Minimal header */}
      <header className="flex h-14 items-center justify-between px-5">
        <Logo size="sm" href="/" />
        <span className="text-xs text-muted-foreground font-medium">No login required</span>
      </header>

      {/* Hero copy */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-4">
        <div className="mb-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-teal-light)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-teal)] mb-4">
            <Zap size={11} aria-hidden="true" />
            Instant access
          </span>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-foreground text-balance">
            Get the care you need,{" "}
            <span className="text-[var(--color-brand-teal)]">right now.</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty max-w-md mx-auto">
            Search for a doctor, describe your symptoms, or browse availability
            — no account, no password.
          </p>
        </div>

        {/* Unified Search + Triage/Booking component */}
        <UnifiedBookingTriage />

        {/* Trust strip */}
        <div className="mt-auto pt-8 pb-2 grid grid-cols-3 gap-2 max-w-md mx-auto w-full">
          {[
            { icon: Shield, label: "HIPAA compliant" },
            { icon: Zap, label: "No login needed" },
            { icon: CalendarCheck, label: "< 1 min to book" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-card border border-border/60 px-2 py-3"
            >
              <Icon size={15} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
              <span className="text-center text-[11px] font-medium text-muted-foreground leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
