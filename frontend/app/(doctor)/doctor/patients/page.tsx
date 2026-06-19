import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { DoctorPatientViewListing } from "@/components/doctor/doctor-patient-view/DoctorPatientViewListing";

export const metadata: Metadata = { title: "Patients" };

export default function DoctorPatientsPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your assigned patient panel.</p>
      </div>
      <DoctorPatientViewListing />
    </PageShell>
  );
}
