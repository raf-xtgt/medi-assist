"use client";

import { useRouter } from "next/navigation";
import { CalendarCheck, MessageCircle, Shield, Zap } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

export function PatientLanding() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--patient-landing-bg)]">
      {/* Minimal header */}
      <header className="flex h-14 items-center justify-between px-5">
        <Logo size="sm" href="/" />
        <span className="text-xs text-muted-foreground font-medium">No login required</span>
      </header>

      {/* Hero copy */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-4">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-teal-light)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-teal)] mb-4">
            <Zap size={11} aria-hidden="true" />
            Instant access
          </span>
          <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-foreground text-balance">
            Get the care you need,{" "}
            <span className="text-[var(--color-brand-teal)]">right now.</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
            Book an appointment in under a minute or chat with our AI health
            assistant — no account, no password.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="flex flex-col gap-4">
          {/* CTA A — Book Appointment */}
          <button
            onClick={() => router.push("/patient/book")}
            className="group relative flex w-full flex-col items-start overflow-hidden rounded-2xl bg-[var(--color-brand-teal)] px-6 py-6 text-left transition-all active:scale-[0.98] hover:bg-[var(--color-brand-teal-dark)]"
            aria-label="Book an appointment"
          >
            {/* Background decoration */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-4 flex size-20 items-center justify-center rounded-full bg-white/10"
            >
              <CalendarCheck size={36} className="text-white/60" strokeWidth={1.5} />
            </span>

            <span className="relative z-10">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/70 mb-2">
                Path A
              </span>
              <span className="block text-2xl font-bold text-white leading-tight">
                Book Appointment
              </span>
              <span className="mt-1.5 block text-sm text-white/80 leading-relaxed">
                Browse doctors and pick an available slot in seconds.
              </span>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white">
                Choose a doctor
                <CalendarCheck size={14} aria-hidden="true" />
              </span>
            </span>
          </button>

          {/* CTA B — Ask / Triage */}
          <button
            onClick={() => router.push("/patient/triage")}
            className="group relative flex w-full flex-col items-start overflow-hidden rounded-2xl border-2 border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-light)] px-6 py-6 text-left transition-all active:scale-[0.98] hover:bg-[var(--color-brand-blue-light)]"
            aria-label="Ask a health question or start AI triage"
          >
            {/* Background decoration */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-4 flex size-20 items-center justify-center rounded-full bg-[var(--color-brand-blue)]/10"
            >
              <MessageCircle size={36} className="text-[var(--color-brand-blue)]/40" strokeWidth={1.5} />
            </span>

            <span className="relative z-10">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-blue)]/60 mb-2">
                Path B
              </span>
              <span className="block text-2xl font-bold text-[var(--color-brand-blue)] leading-tight">
                Ask a Question
              </span>
              <span className="mt-1.5 block text-sm text-[var(--color-brand-blue)]/80 leading-relaxed">
                Describe your symptoms. Our AI triages and connects you to the right doctor.
              </span>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-blue)] px-4 py-2 text-sm font-semibold text-white">
                Start chat
                <MessageCircle size={14} aria-hidden="true" />
              </span>
            </span>
          </button>
        </div>

        {/* Trust strip */}
        <div className="mt-auto pt-8 flex items-center justify-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield size={13} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
            HIPAA compliant
          </div>
          <div className="h-3 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Zap size={13} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
            No account needed
          </div>
          <div className="h-3 w-px bg-border" aria-hidden="true" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarCheck size={13} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
            &lt; 1 min to book
          </div>
        </div>
      </div>
    </div>
  );
}
