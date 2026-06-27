"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePatientSession } from "@/hooks/usePatientSession";
import { UnifiedBookingTriage } from "@/components/patient/UnifiedBookingTriage";

const upcomingAppointments = [
  {
    id:      "1",
    doctor:  "Dr. Priya Nair",
    type:    "General Check-up",
    date:    "Tomorrow",
    time:    "10:00 AM",
    status:  "confirmed",
  },
  {
    id:      "2",
    doctor:  "Dr. Marcus Oliveira",
    type:    "Blood Test Results",
    date:    "Mon, Jul 7",
    time:    "2:30 PM",
    status:  "pending",
  },
];

export default function PatientHomePage() {
  const router = useRouter();
  const {
    patientGuid,
    patientName,
    patientPhone,
    isLoading,
    saveSession,
  } = usePatientSession();

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
  if (!patientGuid) {
    router.replace("/patient/landing");
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
        <Card className="mb-6 shadow-none border-0 bg-[var(--color-brand-teal)] text-white overflow-hidden">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-white/80">Next appointment</p>
            <p className="mt-1 text-xl font-bold">Tomorrow, 10:00 AM</p>
            <p className="mt-0.5 text-sm text-white/80">Dr. Priya Nair · General Check-up</p>
            <Button
              className="mt-4 h-10 w-full bg-white text-[var(--color-brand-teal)] hover:bg-white/90 font-medium"
              asChild
            >
              <Link href="/patient/appointments">
                View details
                <ArrowRight size={14} data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>

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
        <section aria-labelledby="appointments-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="appointments-heading"
              className="text-sm font-semibold text-foreground"
            >
              Upcoming
            </h2>
            <Link
              href="/patient/appointments"
              className="text-xs font-medium text-[var(--color-brand-teal)] hover:underline"
            >
              See all
            </Link>
          </div>
          <ul role="list" className="flex flex-col gap-3">
            {upcomingAppointments.map((appt) => (
              <li key={appt.id}>
                <Card className="shadow-none border-border/60">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className="flex shrink-0 size-10 items-center justify-center rounded-lg bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]"
                      aria-hidden="true"
                    >
                      <CalendarCheck size={18} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{appt.doctor}</p>
                      <p className="text-xs text-muted-foreground">{appt.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {appt.date} · {appt.time}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs capitalize ${
                        appt.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {appt.status}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

