"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  CalendarCheck,
  ClipboardList,
  Clock,
  Stethoscope,
  Users,
  RefreshCw,
  ServerCrash,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { useSession } from "@/hooks/useSession";
import { dashboardService, doctorService } from "@/lib/api/services";
import type { DoctorDashboardResponse } from "@/lib/api/model/dashboard.model";
import { TESTING_DOCTOR_GUID } from "@/lib/api/model/testing-guid.model";

const statusBadge: Record<string, string> = {
  "in-progress": "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] border-[var(--color-brand-teal)]/20",
  in_progress:   "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] border-[var(--color-brand-teal)]/20",
  waiting:       "bg-amber-50 text-amber-700 border-amber-200",
  scheduled:     "bg-slate-100 text-slate-600 border-slate-200",
  upcoming:      "bg-slate-100 text-slate-600 border-slate-200",
  done:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed:     "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const iconMap: Record<string, any> = {
  note_completed: ClipboardList,
  clinical_report: Activity,
  prescription: Stethoscope,
};

const accentFeedMap: Record<string, "blue" | "teal" | "success" | "warning" | "danger"> = {
  note_completed: "teal",
  clinical_report: "blue",
  prescription: "success",
};

export default function DoctorDashboardPage() {
  const { user } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DoctorDashboardResponse | null>(null);
  const [doctorName, setDoctorName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorGuid = TESTING_DOCTOR_GUID;
      const [data, doctor] = await Promise.all([
        dashboardService.getDoctorDashboard(doctorGuid),
        doctorService.getByGuid(doctorGuid),
      ]);
      setDashboardData(data);
      setDoctorName(doctor.name || null);
    } catch (err: any) {
      console.error("Doctor dashboard fetch error:", err);
      setError(err?.message || "Failed to load clinical overview statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (loading && !dashboardData) {
    return (
      <PageShell>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-80 mt-1" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-none border-border/60">
              <CardContent className="p-5 flex flex-col gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 shadow-none border-border/60">
            <CardHeader className="pb-3"><Skeleton className="h-6 w-36" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card className="shadow-none border-border/60">
            <CardHeader className="pb-3"><Skeleton className="h-6 w-28" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center p-12 min-h-[400px] border border-dashed rounded-lg border-border/60 bg-muted/10 gap-4">
          <ServerCrash size={48} className="text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">Clinical Overview Unavailable</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
          </div>
          <Button onClick={loadData} variant="outline" size="sm" className="gap-1.5 mt-2">
            <RefreshCw size={14} /> Retry Load
          </Button>
        </div>
      </PageShell>
    );
  }

  const kpis = dashboardData!.kpis;
  const queue = dashboardData!.queue;
  const recentActivities = dashboardData!.recent_activities;

  const stats = [
    {
      title: "Patients Today",
      value: kpis.patients_today.toString(),
      subtitle: `${kpis.patients_remaining} remaining`,
      icon: Users,
      accent: "teal" as const,
      trend: { value: 6, label: "vs yesterday" },
    },
    {
      title: "Appointments",
      value: kpis.total_appointments.toString(),
      subtitle: kpis.next_appointment_time ? `Next at ${kpis.next_appointment_time}` : "No upcoming slots",
      icon: CalendarCheck,
      accent: "blue" as const,
      trend: { value: 2, label: "booked this week" },
    },
    {
      title: "Pending Notes",
      value: kpis.pending_notes.toString(),
      subtitle: "Due today",
      icon: ClipboardList,
      accent: "warning" as const,
      trend: { value: -3, label: "from yesterday" },
    },
    {
      title: "Avg. Consult",
      value: `${kpis.avg_consult_duration_minutes} min`,
      subtitle: "Target: 12 min",
      icon: Clock,
      accent: "teal" as const,
      trend: { value: -7, label: "improvement" },
    },
  ];

  const feedItems = recentActivities.map((act) => ({
    id: act.id,
    icon: iconMap[act.activity_type] || ClipboardList,
    message: act.message,
    timestamp: new Date(act.timestamp),
    accent: accentFeedMap[act.activity_type] || "blue",
  }));

  return (
    <PageShell>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, Dr. {doctorName || user?.name || "Doctor"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your clinical overview for today.
          </p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          Refresh
        </Button>
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
            {queue.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No patients in queue for today.
              </div>
            ) : (
              <ul role="list" className="divide-y divide-border/40">
                {queue.map((patient) => {
                  const normalizedStatus = patient.appointment_status.toLowerCase().replace("_", "-");
                  const badgeClass = statusBadge[normalizedStatus] || "bg-slate-100 text-slate-600 border-slate-200";

                  return (
                    <li
                      key={patient.appointment_guid}
                      className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <Avatar className="size-9 shrink-0">
                        <AvatarFallback className="bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] text-xs font-medium">
                          {getInitials(patient.patient_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{patient.patient_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {patient.age}y · {patient.reason}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-xs capitalize ${badgeClass}`}
                      >
                        {patient.appointment_status.replace("-", " ").replace("_", " ")}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Activity */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            {feedItems.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No recent clinical updates.
              </div>
            ) : (
              <ActivityFeed items={feedItems} />
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
