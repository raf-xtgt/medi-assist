"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  appointmentService,
  type PatientAppointmentByPatientItem,
} from "@/lib/api/services/appointment-service";

const SPECIALTY_MAX_LENGTH = 20;

function truncateSpecialty(specialty?: string): { display: string; isTruncated: boolean } {
  if (!specialty) return { display: "", isTruncated: false };
  if (specialty.length <= SPECIALTY_MAX_LENGTH) return { display: specialty, isTruncated: false };
  return { display: specialty.slice(0, SPECIALTY_MAX_LENGTH) + "…", isTruncated: true };
}

interface HealthSummaryCardProps {
  patientGuid: string;
}

function formatAppointmentDate(dateStr?: string): string {
  if (!dateStr) return "No date";
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

export function HealthSummaryCard({ patientGuid }: HealthSummaryCardProps) {
  const [appointment, setAppointment] =
    useState<PatientAppointmentByPatientItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchLatest() {
      try {
        const data = await appointmentService.getLatestPatientAppointment({
          patient_guid: patientGuid,
        });
        if (!cancelled) setAppointment(data);
      } catch {
        // No appointment found or network error — leave as null
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchLatest();
    return () => { cancelled = true; };
  }, [patientGuid]);

  if (isLoading) {
    return (
      <Card className="mb-6 shadow-none border-0 bg-[var(--color-brand-teal)] text-white overflow-hidden animate-pulse">
        <CardContent className="p-5">
          <div className="h-4 w-32 bg-white/20 rounded mb-2" />
          <div className="h-6 w-48 bg-white/20 rounded mb-1" />
          <div className="h-4 w-56 bg-white/20 rounded mb-4" />
          <div className="h-10 w-full bg-white/20 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!appointment) {
    return (
      <Card className="mb-6 shadow-none border-0 bg-[var(--color-brand-teal)] text-white overflow-hidden">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-white/80">No appointments yet</p>
          <p className="mt-1 text-xl font-bold">Book your first visit</p>
          <Button
            className="mt-4 h-10 w-full bg-white text-[var(--color-brand-teal)] hover:bg-white/90 font-medium"
            asChild
          >
            <Link href="/patient/book">
              Book now
              <ArrowRight size={14} data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const dateLabel = formatAppointmentDate(appointment.appointment_start_time);
  const timeLabel = formatTime(appointment.appointment_start_time);
  const { display: specialtyDisplay, isTruncated: specialtyTruncated } = truncateSpecialty(appointment.doctor_specialty);

  return (
    <Card className="mb-6 shadow-none border-0 bg-[var(--color-brand-teal)] text-white overflow-hidden">
      <CardContent className="p-5">
        <p className="text-sm font-medium text-white/80">Latest appointment</p>
        <p className="mt-1 text-xl font-bold">
          {dateLabel}
          {timeLabel ? `, ${timeLabel}` : ""}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          <p className="text-sm text-white/80">
            {appointment.doctor_name ?? "Doctor"}
            {appointment.doctor_specialty
              ? ` · ${expanded ? appointment.doctor_specialty : specialtyDisplay}`
              : ""}
          </p>
          {specialtyTruncated && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex items-center justify-center size-5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label={expanded ? "Collapse details" : "Expand details"}
            >
              {expanded ? (
                <ChevronUp size={12} aria-hidden="true" />
              ) : (
                <ChevronDown size={12} aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {expanded && appointment.doctor_image_url && (
          <div className="mt-3 flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border-2 border-white/40">
              <Image
                src={appointment.doctor_image_url}
                alt={appointment.doctor_name ?? "Doctor"}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs text-white/70">
              {appointment.doctor_name}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
