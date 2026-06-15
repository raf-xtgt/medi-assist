import type { Metadata } from "next";
import { DoctorShell } from "@/components/layout/DoctorShell";

export const metadata: Metadata = {
  title: { default: "Doctor", template: "%s | Doctor | medi-assist" },
};

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DoctorShell>{children}</DoctorShell>;
}
