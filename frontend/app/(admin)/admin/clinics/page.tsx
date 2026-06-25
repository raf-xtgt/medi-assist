import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ClinicListing } from "@/components/admin/clinic-management/ClinicListing";

export const metadata: Metadata = { title: "Clinics" };

export default function AdminClinicsPage() {
  return (
    <PageShell>
      <ClinicListing />
    </PageShell>
  );
}
