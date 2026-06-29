"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users2,
  RefreshCw,
  ServerCrash,
} from "lucide-react";
import { OpsKpiCard } from "@/components/admin/OpsKpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/useSession";
import { clinicHdrService, dashboardService } from "@/lib/api/services";
import type { AdminDashboardResponse } from "@/lib/api/model/dashboard.model";
import { TESTING_CLINIC_USER_GUID } from "@/lib/api/model/testing-guid.model";

const statusConfig: Record<string, { label: string; cls: string }> = {
  done:          { label: "Done",        cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "in-progress":  { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-200"       },
  scheduled:     { label: "Scheduled",   cls: "bg-slate-50 text-slate-700 border-slate-200"     },
  postponed:     { label: "Postponed",   cls: "bg-amber-50 text-amber-700 border-amber-200"     },
  canceled:      { label: "Canceled",    cls: "bg-red-50 text-red-700 border-red-200"           },
};

export function OperationalDashboard() {
  const { user } = useSession();
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userGuid = user?.id || TESTING_CLINIC_USER_GUID;
      let clinicGuid = "";
      
      try {
        const clinics = await clinicHdrService.getByCriteria({ user_guid: userGuid });
        if (clinics && clinics.length > 0) {
          clinicGuid = clinics[0].guid;
        } else {
          const allClinics = await clinicHdrService.getAll();
          if (allClinics && allClinics.length > 0) {
            clinicGuid = allClinics[0].guid;
          }
        }
      } catch {
        const allClinics = await clinicHdrService.getAll();
        if (allClinics && allClinics.length > 0) {
          clinicGuid = allClinics[0].guid;
        }
      }

      if (!clinicGuid) {
        throw new Error("No clinics configured. Please onboard a clinic first.");
      }

      const data = await dashboardService.getAdminDashboard(clinicGuid);
      setDashboardData(data);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err?.message || "Failed to load dashboard statistics.");
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
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
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
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="shadow-none border-border/60">
            <CardHeader className="pb-3"><Skeleton className="h-5 w-28" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 shadow-none border-border/60">
            <CardHeader className="pb-3"><Skeleton className="h-5 w-36" /></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] border border-dashed rounded-lg border-border/60 bg-muted/10 gap-4">
        <ServerCrash size={48} className="text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-bold text-foreground">Operational Stats Unavailable</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{error}</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" className="gap-1.5 mt-2">
          <RefreshCw size={14} /> Retry Load
        </Button>
      </div>
    );
  }

  const kpis = dashboardData!.kpis;
  const providerLoads = dashboardData!.provider_loads;
  const appointments = dashboardData!.appointments;

  const filtered = filter === "all"
    ? appointments
    : appointments.filter((a) => {
        const statusKey = a.appointment_status.toLowerCase().replace("_", "-");
        return statusKey === filter;
      });

  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Operational Health</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time appointment grid — today, {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button onClick={loadData} disabled={loading} variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <OpsKpiCard
          label="Total Appointments"
          value={kpis.total_appointments}
          sublabel="Scheduled capacity today"
          icon={CalendarCheck}
          accent="blue"
          delta={{ value: 6, label: "vs yesterday" }}
        />
        <OpsKpiCard
          label="Remaining"
          value={kpis.remaining_appointments}
          sublabel="Upcoming slots for the day"
          icon={Clock}
          accent="neutral"
        />
        <OpsKpiCard
          label="Completed"
          value={kpis.completed_appointments}
          sublabel={`${kpis.completion_rate}% completion rate`}
          icon={CheckCircle2}
          accent="success"
          delta={{ value: 3, label: "vs avg" }}
        />
        <OpsKpiCard
          label="Postponed / Canceled"
          value={kpis.canceled_or_postponed_appointments}
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
            {providerLoads.map((doc) => (
              <div key={doc.doctor_guid} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground">{doc.doctor_name}</span>
                    <span className="text-[10px] text-muted-foreground">{doc.specialty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground tabular-nums">
                    <span>
                      <span className="font-semibold text-foreground">{doc.completed_appointments}</span>/{doc.total_appointments}
                    </span>
                    <span className={`font-semibold ${doc.utilization_percentage >= 70 ? "text-amber-600" : "text-emerald-600"}`}>
                      {doc.utilization_percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${doc.utilization_percentage >= 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                    style={{ width: `${doc.utilization_percentage}%` }}
                    role="progressbar"
                    aria-valuenow={doc.utilization_percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${doc.doctor_name} utilization`}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border/40 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <TrendingUp size={11} aria-hidden="true" className="text-emerald-500" />
              <span>Avg utilization: <strong className="text-foreground">{kpis.average_utilization_rate}%</strong></span>
              <span className="ml-auto flex items-center gap-1">
                <Users2 size={10} aria-hidden="true" />{providerLoads.length} active providers
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
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No appointments found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((appt) => {
                      const normalizedStatus = appt.appointment_status.toLowerCase().replace("_", "-");
                      const config = statusConfig[normalizedStatus] || { label: appt.appointment_status, cls: "bg-slate-50 text-slate-700" };

                      return (
                        <tr
                          key={appt.appointment_guid}
                          className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-mono font-semibold text-foreground">{appt.time}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{appt.patient_name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">{appt.doctor_name}</td>
                          <td className="px-4 py-2.5 text-muted-foreground hidden lg:table-cell">{appt.visit_type}</td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize font-medium ${config.cls}`}
                            >
                              {config.label}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
