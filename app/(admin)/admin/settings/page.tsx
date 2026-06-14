import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Settings" };

export default function AdminSettingsPage() {
  return (
    <PageShell maxWidth="lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global platform configuration and preferences.
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {["General", "Security", "Notifications", "Integrations"].map((section) => (
          <Card key={section} className="shadow-none border-border/60">
            <CardHeader>
              <CardTitle className="text-base">{section}</CardTitle>
              <CardDescription>Manage {section.toLowerCase()} settings.</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 text-sm text-muted-foreground">
              {section} configuration coming soon.
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
