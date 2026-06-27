"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  appointmentService,
  type PatientAppointmentByPatientItem,
} from "@/lib/api/services/appointment-service";

interface UpcomingAppointmentsProps {
  patientGuid: string;
}

const SPECIALTY_MAX_LENGTH = 20;

function truncateSpecialty(specialty?: string): { display: string; isTruncated: boolean } {
  if (!specialty) return { display: "", isTruncated: false };
  if (specialty.length <= SPECIALTY_MAX_LENGTH) return { display: specialty, isTruncated: false };
  return { display: specialty.slice(0, SPECIALTY_MAX_LENGTH) + "…", isTruncated: true };
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr?: string): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function statusBadgeClasses(status?: string): string {
  switch (status?.toLowerCase()) {
    case "confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "completed":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export function UpcomingAppointments({ patientGuid }: UpcomingAppointmentsProps) {
  const [appointments, setAppointments] = useState<PatientAppointmentByPatientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchAppointments() {
      try {
        const data = await appointmentService.getByPatient({
          patient_guid: patientGuid,
        });
        if (!cancelled) setAppointments(data);
      } catch {
        // Network error — leave empty
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAppointments();
    return () => { cancelled = true; };
  }, [patientGuid]);

  if (isLoading) {
    return (
      <section aria-labelledby="appointments-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="appointments-heading"
            className="text-sm font-semibold text-foreground"
          >
            Upcoming
          </h2>
        </div>
        <ul role="list" className="flex flex-col gap-3">
          {[1, 2].map((i) => (
            <li key={i}>
              <Card className="shadow-none border-border/60 animate-pulse">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="size-10 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (appointments.length === 0) {
    return (
      <section aria-labelledby="appointments-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="appointments-heading"
            className="text-sm font-semibold text-foreground"
          >
            Upcoming
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">No appointments yet.</p>
      </section>
    );
  }

  return (
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
        {appointments.map((appt) => (
          <AppointmentCard key={appt.appointment_guid ?? appt.appointment_running_no} appt={appt} />
        ))}
      </ul>
    </section>
  );
}

function AppointmentCard({ appt }: { appt: PatientAppointmentByPatientItem }) {
  const [expanded, setExpanded] = useState(false);
  const { display: specialtyDisplay, isTruncated: specialtyTruncated } = truncateSpecialty(appt.doctor_specialty);

  return (
    <Card className="shadow-none border-border/60">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div
            className="flex shrink-0 size-10 items-center justify-center rounded-lg bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]"
            aria-hidden="true"
          >
            <CalendarCheck size={18} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {appt.doctor_name ?? "Doctor"}
            </p>
            {appt.doctor_specialty && (
              <div className="flex items-center gap-1">
                <p className="text-xs text-muted-foreground">
                  {expanded ? appt.doctor_specialty : specialtyDisplay}
                </p>
                {specialtyTruncated && (
                  <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="inline-flex items-center justify-center size-4 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    aria-label={expanded ? "Collapse details" : "Expand details"}
                  >
                    {expanded ? (
                      <ChevronUp size={10} aria-hidden="true" />
                    ) : (
                      <ChevronDown size={10} aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDate(appt.appointment_start_time)}
              {appt.appointment_start_time ? ` · ${formatTime(appt.appointment_start_time)}` : ""}
            </p>
          </div>
          {appt.appointment_status && (
            <Badge
              variant="outline"
              className={`shrink-0 text-xs capitalize ${statusBadgeClasses(appt.appointment_status)}`}
            >
              {appt.appointment_status}
            </Badge>
          )}
        </div>

        {expanded && appt.doctor_image_url && (
          <div className="mt-3 flex items-center gap-3 pl-14">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border">
              <Image
                src={appt.doctor_image_url}
                alt={appt.doctor_name ?? "Doctor"}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {appt.doctor_name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
