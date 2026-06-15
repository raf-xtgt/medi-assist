import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { AvailabilityEngine } from "@/components/admin/AvailabilityEngine";

export const metadata: Metadata = { title: "Availability Engine" };

export default function AvailabilityPage() {
  return (
    <PageShell maxWidth="full">
      <AvailabilityEngine />
    </PageShell>
  );
}
