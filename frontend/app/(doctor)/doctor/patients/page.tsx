"use client";

import { useState } from "react";
import { PageShell } from "@/components/layout/PageShell";
import { DoctorPatientViewListing } from "@/components/doctor/doctor-patient-view/DoctorPatientViewListing";
import { DoctorPatientViewAppointmentSessionListing } from "@/components/doctor/doctor-patient-view/DoctorPatientViewAppointmentSessionListing";
import { DoctorPatientViewReport } from "@/components/doctor/doctor-patient-view/DoctorPatientViewReport";
import type { DoctorPatientListItem } from "@/lib/api/model/doctor.model";
import type { PatientAppointmentListingItem } from "@/lib/api/model/appointment.model";

type View = "listing" | "appointments" | "report";

export default function DoctorPatientsPage() {
  const [view, setView] = useState<View>("listing");
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatientListItem | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointmentListingItem | null>(null);

  function handleSelectPatient(patient: DoctorPatientListItem) {
    setSelectedPatient(patient);
    setView("appointments");
  }

  function handleSelectAppointment(appointment: PatientAppointmentListingItem) {
    setSelectedAppointment(appointment);
    setView("report");
  }

  function handleBackToListing() {
    setSelectedPatient(null);
    setSelectedAppointment(null);
    setView("listing");
  }

  function handleBackToAppointments() {
    setSelectedAppointment(null);
    setView("appointments");
  }

  return (
    <PageShell>
      {view === "listing" && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your assigned patient panel.</p>
          </div>
          <DoctorPatientViewListing onSelectPatient={handleSelectPatient} />
        </>
      )}

      {view === "appointments" && selectedPatient && (
        <DoctorPatientViewAppointmentSessionListing
          patient={selectedPatient}
          onBack={handleBackToListing}
          onSelectAppointment={handleSelectAppointment}
        />
      )}

      {view === "report" && selectedPatient && selectedAppointment && (
        <DoctorPatientViewReport
          patient={selectedPatient}
          onBack={handleBackToAppointments}
        />
      )}
    </PageShell>
  );
}
