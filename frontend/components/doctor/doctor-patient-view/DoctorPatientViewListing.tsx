"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { doctorService } from "@/lib/api/services";
import type { DoctorPatientListItem } from "@/lib/api/model/doctor.model";
import { Mail, Phone, MapPin, CalendarCheck, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TESTING_DOCTOR_GUID, TESTING_CLINIC_HDR_GUID } from "@/lib/api/model/testing-guid.model";

/* Testing GUIDs */
const DOCTOR_GUID = TESTING_DOCTOR_GUID;
const CLINIC_HDR_GUID = TESTING_CLINIC_HDR_GUID;

interface DoctorPatientViewListingProps {
  onSelectPatient: (patient: DoctorPatientListItem) => void;
}

export function DoctorPatientViewListing({ onSelectPatient }: DoctorPatientViewListingProps) {
  const [patients, setPatients] = useState<DoctorPatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await doctorService.getPatientList({
          doctor_guid: DOCTOR_GUID,
          clinic_hdr_guid: CLINIC_HDR_GUID,
        });
        setPatients(data);
      } catch (err) {
        console.error("Failed to load patient list:", err);
        setError("Failed to load patients. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-none border-border/60">
        <CardHeader>
          <CardTitle className="text-base">All Patients</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-none border-border/60">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (patients.length === 0) {
    return (
      <Card className="shadow-none border-border/60">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)]">
            <Users size={20} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-foreground">No patients found</p>
          <p className="text-xs text-muted-foreground">
            Patients linked to your practice will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-border/60">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">All Patients</CardTitle>
        <Badge variant="secondary" className="text-xs font-medium">
          {patients.length} patient{patients.length !== 1 ? "s" : ""}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {patients.map((patient) => (
          <button
            key={patient.patient_guid}
            type="button"
            onClick={() => onSelectPatient(patient)}
            className={cn(
              "flex items-center gap-4 rounded-lg border border-border/60 bg-card p-3 w-full text-left",
              "transition-colors hover:bg-muted/40 cursor-pointer"
            )}
          >
            {/* Avatar */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)] text-xs font-bold text-[var(--color-brand-teal)]">
              {patient.patient_name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {patient.patient_name}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                {patient.patient_phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={11} aria-hidden="true" />
                    {patient.patient_phone}
                  </span>
                )}
                {patient.patient_email && (
                  <span className="flex items-center gap-1">
                    <Mail size={11} aria-hidden="true" />
                    {patient.patient_email}
                  </span>
                )}
                {patient.patient_address && (
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin size={11} aria-hidden="true" />
                    {patient.patient_address}
                  </span>
                )}
              </div>
            </div>

            {/* Completed appointments badge */}
            <Badge
              className={cn(
                "shrink-0 gap-1 text-[11px] border-0",
                patient.total_completed_appointments > 0
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <CalendarCheck size={11} aria-hidden="true" />
              {patient.total_completed_appointments}
            </Badge>

            <ChevronRight size={14} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
