import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { OperationalDashboard } from "@/components/admin/OperationalDashboard";

export const metadata: Metadata = { title: "Operational Dashboard" };

export default function AdminDashboardPage() {
  return (
    <PageShell maxWidth="full">
      <OperationalDashboard />
    </PageShell>
  );
}
