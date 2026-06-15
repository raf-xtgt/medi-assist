import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { RelationalDirectory } from "@/components/admin/RelationalDirectory";

export const metadata: Metadata = { title: "Relational Directory" };

export default function DirectoryPage() {
  return (
    <PageShell maxWidth="full">
      <RelationalDirectory />
    </PageShell>
  );
}
