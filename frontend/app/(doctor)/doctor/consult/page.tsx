import type { Metadata } from "next";
import { AmbientCoreWorkspace } from "@/components/doctor/AmbientCoreWorkspace";

export const metadata: Metadata = { title: "The Ambient Core" };

export default function DoctorConsultPage() {
  return <AmbientCoreWorkspace />;
}
