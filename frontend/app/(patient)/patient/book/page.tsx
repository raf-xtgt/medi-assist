import type { Metadata } from "next";
import { BookingFlow } from "@/components/patient/BookingFlow";

export const metadata: Metadata = {
  title: "Book Appointment | medi-assist",
  description: "Browse doctors and book an available appointment slot.",
};

export default function PatientBookPage() {
  return <BookingFlow />;
}
