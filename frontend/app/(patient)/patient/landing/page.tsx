import type { Metadata } from "next";
import { PatientLanding } from "@/components/patient/PatientLanding";

export const metadata: Metadata = {
  title: "Get Care | medi-assist",
  description: "Book an appointment or ask a health question — no login required.",
};

export default function PatientLandingPage() {
  return <PatientLanding />;
}
