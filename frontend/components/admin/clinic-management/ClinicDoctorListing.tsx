"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clinicHdrService } from "@/lib/api/services/clinic-hdr-service";
import type { DoctorResponse } from "@/lib/api/model/doctor.model";
import { ClinicDoctorView } from "./ClinicDoctorView";

interface ClinicDoctorListingProps {
  clinicGuid: string;
}

export function ClinicDoctorListing({ clinicGuid }: ClinicDoctorListingProps) {
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDoctorView, setShowDoctorView] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorResponse | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await clinicHdrService.getClinicDoctors({ clinic_guid: clinicGuid });
      setDoctors(data);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [clinicGuid]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleAddDoctor = () => {
    setSelectedDoctor(null);
    setShowDoctorView(true);
  };

  const handleSelectDoctor = (doctor: DoctorResponse) => {
    setSelectedDoctor(doctor);
    setShowDoctorView(true);
  };

  const handleDoctorSaved = () => {
    setShowDoctorView(false);
    setSelectedDoctor(null);
    fetchDoctors();
  };

  const handleCloseDoctorView = () => {
    setShowDoctorView(false);
    setSelectedDoctor(null);
  };

  if (showDoctorView) {
    return (
      <ClinicDoctorView
        clinicGuid={clinicGuid}
        doctor={selectedDoctor}
        onSaved={handleDoctorSaved}
        onClose={handleCloseDoctorView}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {loading ? "Loading…" : `${doctors.length} doctor${doctors.length !== 1 ? "s" : ""}`}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleAddDoctor}
          aria-label="Add doctor"
        >
          <Plus size={16} aria-hidden="true" />
        </Button>
      </div>

      {/* Doctor list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={20} className="animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-sm text-muted-foreground gap-2">
          <User size={24} className="opacity-40" aria-hidden="true" />
          <span>No doctors added yet.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {doctors.map((doctor) => (
            <button
              key={doctor.guid}
              type="button"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left w-full cursor-pointer"
              onClick={() => handleSelectDoctor(doctor)}
            >
              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-muted text-muted-foreground shrink-0">
                <User size={16} aria-hidden="true" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {doctor.name || "Unnamed Doctor"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {doctor.specialty || doctor.email || "No details"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
