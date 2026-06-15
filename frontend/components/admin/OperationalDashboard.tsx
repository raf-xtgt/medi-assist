"use client";

import { useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users2,
  RefreshCw,
} from "lucide-react";
import { OpsKpiCard } from "@/components/admin/OpsKpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const APPOINTMENTS = [
  { id: "A001", patient: "Eleanor Voss",      doctor: "Dr. Marcus Tan",     time: "09:00",  status: "done",       type: "GP Consult"         },
  { id: "A002", patient: "James O'Brien",     doctor: "Dr. Priya Nair",     time: "09:30",  status: "done",       type: "Cardiology Review"  },
  { id: "A003", patient: "Sofia Ramirez",     doctor: "Dr. Marcus Tan",     time: "10:00",  status: "in-progress",type: "Follow-up"          },
  { id: "A004", patient: "Liam Chen",         doctor: "Dr. Aisha Kamara",   time: "10:30",  status: "scheduled",  type: "Dermatology"        },
  { id: "A005", patient: "Amara Okafor",      doctor: "Dr. David Wu",       time: "11:00",  status: "scheduled",  type: "Endocrinology"      },
  { id: "A006", patient: "Victor Petrov",     doctor: "Dr. Priya Nair",     time: "11:30",  status: "postponed",  type: "Cardiology Review"  },
  { id: "A007", patient: "Hannah Schmidt",    doctor: "Dr. Marcus Tan",     time: "13:00",  status: "scheduled",  type: "GP Consult"         },
  { id: "A008", patient: "Carlos Mendez",     doctor: "Dr. Aisha Kamara",   time: "13:30",  status: "canceled",   type: "Dermatology"        },
  { id: "A009", patient: "Yuki Tanaka",       doctor: "Dr. David Wu",       time: "14:00",  status: "scheduled",  type: "Endocrinology"      },
  { id: "A010", patient: "Nadia Al-Farsi",    doctor: "Dr. Priya Nair",     time: "14:30",  status: "scheduled",  type: "Cardiology Review"  },
];

const statusConfig: Record<string, { label: string; cls: string }> = {
  done:        { label: "Done",        cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "in-progress":{ label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200"       },
  scheduled:   { label: "Scheduled",   cls: "bg-slate-50 text-slate-700 border-slate-200"     },
  postponed:   { label: "Postponed",   cls: "bg-amber-50 text-amber-700 border-amber-200"     },
  canceled:    { label: "Canceled",    cls: "bg-red-50 text-red-700 border-red-200"           },
};

const doctorLoad = [
  { name: "Dr. Marcus Tan",   specialty: "General Practice", scheduled: 8, done: 3, utilization: 78 },
  { name: "Dr. Priya Nair",   specialty: "Cardiology",       scheduled: 6, done: 2, utilization: 65 },
  { name: "Dr. Aisha Kamara", specialty: "Dermatology",      scheduled: 5, done: 1, utilization: 55 },
  { name: "Dr. David Wu",     specialty: "Endocrinology",    scheduled: 4, done: 0, utilization: 40 },
];

export function OperationalDashboard() {
  const [filter, setFilter] = useState<string>("all");

  const total     = APPOINTMENTS.length;
  const done      = APPOINTMENTS.filter((a) => a.status === "done").length;
  const remaining = APPOINTMENTS.filter((a) => a.status === "scheduled" || a.status === "in-progress").length;
  const freed     = APPOINTMENTS.filter((a) => a.status === "postponed" || a.status === "canceled").length;

  const filtered = filter === "all"
    ? APPOINTMENTS
    : APPOINTMENTS.filter((a) => a.status === filter);

  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Operational Health</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time appointment grid — today, {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <RefreshCw size={12} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <OpsKpiCard
          label="Total Appointments"
          value={total}
          sublabel="Scheduled capacity today"
          icon={CalendarCheck}
          accent="blue"
          delta={{ value: 6, label: "vs yesterday" }}
        />
        <OpsKpiCard
          label="Remaining"
          value={remaining}
          sublabel="Upcoming slots for the day"
          icon={Clock}
          accent="neutral"
        />
        <OpsKpiCard
          label="Completed"
          value={done}
          sublabel={`${Math.round((done / total) * 100)}% completion rate`}
          icon={CheckCircle2}
          accent="success"
          delta={{ value: 3, label: "vs avg" }}
        />
        <OpsKpiCard
          label="Postponed / Canceled"
          value={freed}
          sublabel="Freed slots available"
          icon={AlertTriangle}
          accent="warning"
          delta={{ value: -12, label: "vs last week" }}
        />
      </div>

      {/* Doctor load + Appointment list */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Doctor utilization */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Provider Load</CardTitle>
            <Activity size={14} className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {doctorLoad.map((doc) => (
              <div key={doc.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">{doc.name}</span>
                    <span className="text-[10px] text-muted-foreground">{doc.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground tabular-nums">
                    <span><span className="font-semibold text-foreground">{doc.done}</span>/{doc.scheduled}</span>
                    <span className={`font-semibold ${doc.utilization >= 70 ? "text-amber-600" : "text-emerald-600"}`}>{doc.utilization}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${doc.utilization >= 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                    style={{ width: `${doc.utilization}%` }}
                    role="progressbar"
                    aria-valuenow={doc.utilization}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${doc.name} utilization`}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <TrendingUp size={11} aria-hidden="true" className="text-emerald-500" />
              <span>Avg utilization: <strong className="text-foreground">59.5%</strong></span>
              <span className="ml-auto flex items-center gap-1">
                <Users2 size={10} aria-hidden="true" />4 active providers
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Appointment table */}
        <Card className="lg:col-span-2 shadow-none border-border/60">
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Appointment Schedule</CardTitle>
            <div className="flex items-center gap-1" role="group" aria-label="Filter appointments">
              {["all", "scheduled", "in-progress", "done", "postponed", "canceled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize transition-colors ${
                    filter === s
                      ? "bg-[var(--color-brand-blue)] text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  aria-pressed={filter === s}
                >
                  {s === "all" ? "All" : statusConfig[s]?.label || s}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-2">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Time</th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground">Patient</th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground hidden md:table-cell">Doctor</th>
                    <th className="px-4 py-2 text-left font-semibold text-muted-foreground hidden lg:table-cell">Type</th>
                    <th className="px-4 py-2 text-right font-semibold text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((appt) => (
                    <tr
                      key={appt.id}
                      className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{appt.time}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{appt.patient}</td>
                      <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{appt.doctor}</td>
                      <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">{appt.type}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize font-medium ${statusConfig[appt.status]?.cls}`}
                        >
                          {statusConfig[appt.status]?.label || appt.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
