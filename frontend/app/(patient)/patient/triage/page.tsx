import type { Metadata } from "next";
import { TriageChat } from "@/components/patient/TriageChat";

export const metadata: Metadata = {
  title: "Health Assistant | medi-assist",
  description: "Describe your symptoms and our AI will guide you to the right care.",
};

export default function PatientTriagePage() {
  return <TriageChat />;
}
