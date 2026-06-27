"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Zap, CalendarCheck, User, Phone, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnifiedBookingTriage } from "@/components/patient/UnifiedBookingTriage";
import { patientLeadService } from "@/lib/api/services/patient-lead-service";
import { usePatientSession } from "@/hooks/usePatientSession";

export function PatientLanding() {
  const router = useRouter();
  const { patientGuid: cachedPatientGuid, isLoading: sessionLoading, saveSession } = usePatientSession();

  const [gateCompleted, setGateCompleted] = useState(false);
  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [leadGuid, setLeadGuid] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ── Returning patient → redirect to home ────────────── */
  if (!sessionLoading && cachedPatientGuid) {
    router.replace("/patient/home");
    return null;
  }

  /* ── Loading session check → brief blank state ───────── */
  if (sessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--patient-landing-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="relative size-10">
            <span className="absolute inset-0 rounded-full border-4 border-[var(--color-brand-teal)]/20" />
            <span
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-brand-teal)]"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    );
  }

  /* ── Save session & navigate after triage booking ────── */
  const handlePatientBookingComplete = async (patientGuid: string) => {
    await saveSession({
      patientGuid,
      patientName: userName,
      patientPhone: userMobile,
    });
    router.push("/patient/home");
  };

  const handleGateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userMobile.trim()) return;

    setSubmitting(true);
    try {
      const lead = await patientLeadService.create({
        name: userName.trim(),
        phone: userMobile.trim(),
        lead_status: "new",
        status: "active",
      });
      setLeadGuid(lead.guid);
    } catch {
      // Non-blocking — continue even if lead creation fails
      console.error("Failed to create patient lead");
    }
    setSubmitting(false);
    setGateCompleted(true);
  };

  // After gate is completed, show the unified component
  if (gateCompleted) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--patient-landing-bg)]">
        {/* Minimal header */}
        <header className="flex h-14 items-center justify-between px-5">
          <Logo size="sm" href="/" />
          <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <User size={10} aria-hidden="true" />
            {userName}
          </div>
        </header>

        {/* Hero copy (compact) */}
        <div className="flex-1 flex flex-col px-5 pt-4 pb-4">
          <div className="mb-2 text-center">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground text-balance">
              Get the care you need,{" "}
              <span className="text-[var(--color-brand-teal)]">right now.</span>
            </h1>
          </div>

          {/* Unified Search + Triage/Booking component */}
          <UnifiedBookingTriage
            userName={userName}
            userMobile={userMobile}
            leadGuid={leadGuid ?? undefined}
            onPatientBookingComplete={handlePatientBookingComplete}
          />

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

  // Gate view — collect name + mobile before anything else
  return (
    <div className="flex min-h-screen flex-col bg-[var(--patient-landing-bg)]">
      {/* Minimal header */}
      <header className="flex h-14 items-center justify-between px-5">
        <Logo size="sm" href="/" />
        <span className="text-xs text-muted-foreground font-medium">No login required</span>
      </header>

      {/* Hero + Gate */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-8">
        <div className="w-full max-w-sm">
          {/* Hero text */}
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-brand-teal-light)] px-3 py-1 text-xs font-semibold text-[var(--color-brand-teal)] mb-4">
              <Zap size={11} aria-hidden="true" />
              Instant access
            </span>
            <h1 className="text-[2rem] font-bold leading-tight tracking-tight text-foreground text-balance">
              Get the care you need,{" "}
              <span className="text-[var(--color-brand-teal)]">right now.</span>
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
              Book an appointment, describe your symptoms, or browse doctors
              — no account, no password.
            </p>
          </div>

          {/* Identity form */}
          <div className="rounded-3xl bg-card border border-border shadow-sm px-6 py-7">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--color-brand-teal-light)]">
              <Sparkles size={22} className="text-[var(--color-brand-teal)]" strokeWidth={1.8} aria-hidden="true" />
            </div>

            <h2 className="text-lg font-bold text-foreground text-center mb-1">Let&apos;s get started</h2>
            <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
              Enter your details so we can confirm bookings and keep you updated.
            </p>

            <form onSubmit={handleGateSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="landing-name" className="text-sm font-medium mb-1.5 block">
                  Full Name
                </Label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="landing-name"
                    placeholder="Your full name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="pl-9 h-11 rounded-xl"
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="landing-mobile" className="text-sm font-medium mb-1.5 block">
                  Mobile Number
                </Label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="landing-mobile"
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={userMobile}
                    onChange={(e) => setUserMobile(e.target.value)}
                    required
                    className="pl-9 h-11 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={!userName.trim() || !userMobile.trim() || submitting}
                className="h-12 w-full rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white font-semibold mt-1 disabled:opacity-40"
              >
                {submitting ? "Setting up…" : "Get Started"}
              </Button>
            </form>
          </div>

          {/* Trust strip */}
          <div className="mt-6 grid grid-cols-3 gap-2">
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
    </div>
  );
}
