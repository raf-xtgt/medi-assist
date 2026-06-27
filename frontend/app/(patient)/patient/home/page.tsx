"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { usePatientSession } from "@/hooks/usePatientSession";
import { UnifiedBookingTriage } from "@/components/patient/UnifiedBookingTriage";
import { HealthSummaryCard } from "@/components/patient/HealthSummaryCard";
import { UpcomingAppointments } from "@/components/patient/UpcomingAppointments";

export default function PatientHomePage() {
  const router = useRouter();
  const {
    patientGuid,
    patientName,
    patientPhone,
    isLoading,
    saveSession,
  } = usePatientSession();

  const shouldRedirectLanding = !isLoading && !patientGuid;

  useEffect(() => {
    if (shouldRedirectLanding) {
      router.replace("/patient/landing");
    }
  }, [shouldRedirectLanding, router]);

  /* ── Loading session → brief spinner ──────────────────── */
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="relative size-10">
          <span className="absolute inset-0 rounded-full border-4 border-[var(--color-brand-teal)]/20" />
          <span
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-brand-teal)]"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  /* ── No session → redirect to landing ────────────────── */
  if (shouldRedirectLanding) {
    return null;
  }

  /* ── Handle new booking from embedded UnifiedBookingTriage */
  const handleNewBooking = async (newPatientGuid: string) => {
    // Patient already in cache — just refresh with the new GUID if different
    await saveSession({
      patientGuid: newPatientGuid,
      patientName: patientName ?? "",
      patientPhone: patientPhone ?? "",
    });
    // Soft refresh to update page state
    router.refresh();
  };

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        {/* Greeting */}
        <div className="mb-6 flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)]"
            aria-hidden="true"
          >
            <Heart size={22} className="text-[var(--color-brand-teal)]" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Hello, {patientName || "there"}
            </h1>
            <p className="text-sm text-muted-foreground">How are you feeling today?</p>
          </div>
        </div>

        {/* Health summary card */}
        <HealthSummaryCard patientGuid={patientGuid!} />

        {/* Quick actions — UnifiedBookingTriage idle view */}
        <section aria-labelledby="quick-actions-heading" className="mb-6">
          <h2
            id="quick-actions-heading"
            className="mb-3 text-sm font-semibold text-foreground"
          >
            Quick Actions
          </h2>
          <UnifiedBookingTriage
            userName={patientName ?? ""}
            userMobile={patientPhone ?? ""}
            onPatientBookingComplete={handleNewBooking}
          />
        </section>

        {/* Upcoming appointments */}
        <UpcomingAppointments patientGuid={patientGuid!} />
      </div>
    </div>
  );
}

