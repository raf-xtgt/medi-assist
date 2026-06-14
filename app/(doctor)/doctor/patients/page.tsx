import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Patients" };

export default function DoctorPatientsPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your assigned patient panel.</p>
      </div>
      <Card className="shadow-none border-border/60">
        <CardHeader>
          <CardTitle className="text-base">All Patients</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageShell>
  );
}
