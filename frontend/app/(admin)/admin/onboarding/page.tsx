import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { PatientOnboardingForm } from "@/components/admin/PatientOnboardingForm";

export const metadata: Metadata = { title: "Patient Onboarding" };

export default function OnboardingPage() {
  return (
    <PageShell maxWidth="full">
      <PatientOnboardingForm />
    </PageShell>
  );
}
