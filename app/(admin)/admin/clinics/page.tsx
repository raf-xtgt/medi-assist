import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Clinics" };

export default function AdminClinicsPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Clinic Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure and monitor all tenant clinics.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="shadow-none border-border/60">
            <CardHeader>
              <CardTitle className="text-base">
                <Skeleton className="h-4 w-36" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
