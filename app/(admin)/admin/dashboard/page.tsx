import type { Metadata } from "next";
import {
  Activity,
  Building2,
  CalendarCheck,
  Clock,
  Stethoscope,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import type { ActivityItem } from "@/components/dashboard/ActivityFeed";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Dashboard" };

const stats = [
  {
    title:    "Total Users",
    value:    "3,241",
    subtitle: "Across all clinics",
    icon:     Users,
    accent:   "blue" as const,
    trend:    { value: 12, label: "this month" },
  },
  {
    title:    "Active Clinics",
    value:    "18",
    subtitle: "2 pending approval",
    icon:     Building2,
    accent:   "teal" as const,
    trend:    { value: 5, label: "this quarter" },
  },
  {
    title:    "Appointments Today",
    value:    "429",
    subtitle: "89% completion rate",
    icon:     CalendarCheck,
    accent:   "success" as const,
    trend:    { value: 3, label: "vs yesterday" },
  },
  {
    title:    "Avg. Wait Time",
    value:    "11 min",
    subtitle: "Target: 15 min",
    icon:     Clock,
    accent:   "warning" as const,
    trend:    { value: -8, label: "improvement" },
  },
];

const activityItems: ActivityItem[] = [
  {
    id:        "1",
    icon:      Users,
    message:   "New doctor account registered: Dr. Aisha Kamara",
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    accent:    "blue",
  },
  {
    id:        "2",
    icon:      Building2,
    message:   "Clinic 'Westside Health' updated billing settings",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
    accent:    "teal",
  },
  {
    id:        "3",
    icon:      Activity,
    message:   "System backup completed successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 42),
    accent:    "success",
  },
  {
    id:        "4",
    icon:      Stethoscope,
    message:   "Patient record merge request submitted",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    accent:    "warning",
  },
  {
    id:        "5",
    icon:      Users,
    message:   "Role updated for user: marcos.silva@clinic.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    accent:    "blue",
  },
];

const clinicHealth = [
  { name: "Riverside Medical",  patients: 842, status: "healthy" },
  { name: "Central City Clinic",patients: 614, status: "healthy" },
  { name: "Westside Health",    patients: 389, status: "warning" },
  { name: "Northgate Practice", patients: 201, status: "healthy" },
  { name: "Harbor Pediatrics",  patients: 178, status: "critical" },
];

const statusBadge: Record<string, string> = {
  healthy:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning:  "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminDashboardPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Operations Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time platform health across all tenants.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Main content row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Clinic health table */}
        <Card className="lg:col-span-2 shadow-none border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Clinic Health</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Clinic</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">Patients</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {clinicHealth.map((c) => (
                  <tr
                    key={c.name}
                    className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                      {c.patients.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${statusBadge[c.status]}`}
                      >
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activityItems} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
