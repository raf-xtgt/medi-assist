"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { appointmentService } from "@/lib/api/services";
import type { PatientAppointmentListingItem } from "@/lib/api/model/appointment.model";
import type { DoctorPatientListItem } from "@/lib/api/model/doctor.model";
import { ArrowLeft, Calendar, ChevronRight, Clock, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

/* Hardcoded doctor GUID for now */
const DOCTOR_GUID = "06f97db0-15dc-41cf-acab-bc278b38f00a";

interface DoctorPatientViewAppointmentSessionListingProps {
  patient: DoctorPatientListItem;
  onBack: () => void;
  onSelectAppointment: (appointment: PatientAppointmentListingItem) => void;
}

export function DoctorPatientViewAppointmentSessionListing({
  patient,
  onBack,
  onSelectAppointment,
}: DoctorPatientViewAppointmentSessionListingProps) {
  const [appointments, setAppointments] = useState<PatientAppointmentListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const data = await appointmentService.getAppointmentList({
          doctor_guid: DOCTOR_GUID,
          patient_guid: patient.patient_guid,
        });
        setAppointments(data);
      } catch (err) {
        console.error("Failed to load appointments:", err);
        setError("Failed to load appointments. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [patient.patient_guid]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Card className="shadow-none border-border/60">
          <CardContent className="flex flex-col gap-3 pt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9" aria-label="Back to patients">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Patient Records <span className="text-muted-foreground">▷</span> Appointment Sessions
          </h1>
          <p className="text-sm text-muted-foreground">Your assigned patient panel.</p>
        </div>
      </div>

      {/* Patient info card */}
      <Card className="shadow-none border-border/60">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)] text-xs font-bold text-[var(--color-brand-teal)]">
            {patient.patient_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{patient.patient_name}</p>
            <p className="text-xs text-muted-foreground">
              {[patient.patient_phone, patient.patient_email, patient.patient_address]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <Card className="shadow-none border-border/60">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!error && appointments.length === 0 && (
        <Card className="shadow-none border-border/60">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)]">
              <Calendar size={20} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">No appointments found</p>
            <p className="text-xs text-muted-foreground">
              Appointment sessions with this patient will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Appointment list */}
      {!error && appointments.length > 0 && (
        <div className="flex flex-col gap-2">
          {appointments.map((appt, idx) => {
            const startDate = appt.appointment_start_time
              ? new Date(appt.appointment_start_time)
              : null;
            const formattedDate = startDate
              ? startDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
              : "Unknown date";
            const formattedTime = startDate
              ? startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
              : "";

            return (
              <button
                key={appt.appointment_guid ?? idx}
                type="button"
                onClick={() => onSelectAppointment(appt)}
                className={cn(
                  "flex items-center gap-4 rounded-lg border border-border/60 bg-card p-4 w-full text-left",
                  "transition-colors hover:bg-muted/40 cursor-pointer"
                )}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-teal-light)]">
                  <Calendar size={16} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Appointment Session - {formattedDate}
                  </p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    {formattedTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} aria-hidden="true" />
                        {formattedTime}
                      </span>
                    )}
                    {appt.appointment_running_no && (
                      <span className="flex items-center gap-1">
                        <Hash size={11} aria-hidden="true" />
                        {appt.appointment_running_no}
                      </span>
                    )}
                  </div>
                </div>

                {appt.appointment_status && (
                  <Badge
                    className={cn(
                      "shrink-0 text-[11px] border-0",
                      appt.appointment_status.toUpperCase() === "CONFIRMED"
                        ? "bg-blue-50 text-blue-700"
                        : appt.appointment_status.toUpperCase() === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {appt.appointment_status}
                  </Badge>
                )}

                <ChevronRight size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
