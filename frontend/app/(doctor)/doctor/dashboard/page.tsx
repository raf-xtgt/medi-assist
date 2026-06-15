import type { Metadata } from "next";
import {
  Activity,
  CalendarCheck,
  ClipboardList,
  Clock,
  Stethoscope,
  Users,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed, type ActivityItem } from "@/components/dashboard/ActivityFeed";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const stats = [
  {
    title:    "Patients Today",
    value:    "24",
    subtitle: "8 remaining",
    icon:     Users,
    accent:   "teal" as const,
    trend:    { value: 6, label: "vs yesterday" },
  },
  {
    title:    "Appointments",
    value:    "31",
    subtitle: "Next at 14:30",
    icon:     CalendarCheck,
    accent:   "blue" as const,
    trend:    { value: 2, label: "booked this week" },
  },
  {
    title:    "Pending Notes",
    value:    "5",
    subtitle: "Due today",
    icon:     ClipboardList,
    accent:   "warning" as const,
    trend:    { value: -3, label: "from yesterday" },
  },
  {
    title:    "Avg. Consult",
    value:    "14 min",
    subtitle: "Target: 12 min",
    icon:     Clock,
    accent:   "teal" as const,
    trend:    { value: -7, label: "improvement" },
  },
];

const queue = [
  { name: "Maria Santos",    age: 34, reason: "Follow-up",          status: "in-progress" },
  { name: "James Okafor",    age: 67, reason: "Blood pressure",     status: "waiting" },
  { name: "Lin Wei",         age: 28, reason: "Annual check",       status: "waiting" },
  { name: "Rachel Novak",    age: 52, reason: "Diabetes review",    status: "waiting" },
  { name: "Anthony Bello",   age: 41, reason: "Back pain",          status: "scheduled" },
];

const statusBadge: Record<string, string> = {
  "in-progress": "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] border-[var(--color-brand-teal)]/20",
  waiting:       "bg-amber-50 text-amber-700 border-amber-200",
  scheduled:     "bg-slate-100 text-slate-600 border-slate-200",
};

const activityItems: ActivityItem[] = [
  {
    id:        "1",
    icon:      ClipboardList,
    message:   "Note completed for Maria Santos",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    accent:    "teal",
  },
  {
    id:        "2",
    icon:      Activity,
    message:   "Lab results received: James Okafor",
    timestamp: new Date(Date.now() - 1000 * 60 * 22),
    accent:    "blue",
  },
  {
    id:        "3",
    icon:      Stethoscope,
    message:   "Referral approved: Lin Wei → Cardiology",
    timestamp: new Date(Date.now() - 1000 * 60 * 55),
    accent:    "success",
  },
];

export default function DoctorDashboardPage() {
  return (
    <PageShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Good morning, Doctor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s your clinical overview for today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* Queue + activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Patient queue */}
        <Card className="lg:col-span-2 shadow-none border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Patient Queue</CardTitle>
              <Badge className="bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] border-0 text-xs">
                {queue.length} patients
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ul role="list" className="divide-y divide-border/40">
              {queue.map((patient) => (
                <li
                  key={patient.name}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors"
                >
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] text-xs font-medium">
                      {getInitials(patient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {patient.age}y · {patient.reason}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs capitalize ${statusBadge[patient.status]}`}
                  >
                    {patient.status.replace("-", " ")}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activityItems} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
