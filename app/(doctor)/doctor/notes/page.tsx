import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Clinical Notes" };

export default function DoctorNotesPage() {
  return (
    <PageShell maxWidth="lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Clinical Notes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-assisted SOAP notes — draft, review, and sign.
        </p>
      </div>
      <Card className="shadow-none border-border/60">
        <CardHeader>
          <CardTitle className="text-base">AI Note Assistant</CardTitle>
          <CardDescription>
            Dictate or type to generate structured clinical notes. Notes require
            physician review and signature before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Note editor coming soon — AI integration ready.
        </CardContent>
      </Card>
    </PageShell>
  );
}
