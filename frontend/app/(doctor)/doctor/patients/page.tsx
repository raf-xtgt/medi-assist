"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DoctorPatientViewListing } from "@/components/doctor/doctor-patient-view/DoctorPatientViewListing";
import { DoctorPatientViewReport } from "@/components/doctor/doctor-patient-view/DoctorPatientViewReport";
import type { DoctorPatientListItem } from "@/lib/api/model/doctor.model";

export default function DoctorPatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatientListItem | null>(null);

  if (selectedPatient) {
    return (
      <PageShell>
        <DoctorPatientViewReport
          patient={selectedPatient}
          onBack={() => setSelectedPatient(null)}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your assigned patient panel.</p>
      </div>
      <DoctorPatientViewListing onSelectPatient={setSelectedPatient} />
    </PageShell>
  );
}
