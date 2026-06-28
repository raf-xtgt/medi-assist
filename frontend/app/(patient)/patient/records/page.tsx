"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  Pill,
  ClipboardList,
  HeartPulse,
  Thermometer,
  Wind,
  Activity,
  Weight,
  Stethoscope,
  Lightbulb,
  ListChecks,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePatientSession } from "@/hooks/usePatientSession";
import { patientService } from "@/lib/api/services/patient-service";
import type { PatientHistoryResponse, AppointmentHistoryRecord } from "@/lib/api/model/patient-history.model";

const statusStyle: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  active: "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] border-[var(--color-brand-teal)]/20",
  scheduled: "bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)] border-[var(--color-brand-blue)]/20",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function VitalRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Icon size={13} className="shrink-0 text-[var(--color-brand-teal)]" aria-hidden="true" />
      <span className="font-medium text-foreground">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function RecordCard({ record }: { record: AppointmentHistoryRecord }) {
  const note = record.appointment_note;
  const report = record.clinical_report;
  const prescriptions = record.prescriptions ?? [];
  const lifestyleAndDiet = report?.lifestyle_and_diet ?? [];
  const carePlanSteps = report?.care_plan_steps ?? [];

  return (
    <Card className="shadow-none border-border/60 overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)]"
              aria-hidden="true"
            >
              <FileText size={18} strokeWidth={1.8} />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Appointment #{record.running_no ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(record.scheduled_start)}
              </p>
            </div>
          </div>
          {record.appointment_status && (
            <Badge
              variant="outline"
              className={`shrink-0 text-xs capitalize ${statusStyle[record.appointment_status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
            >
              {record.appointment_status}
            </Badge>
          )}
        </div>

        {/* Appointment note — main complaint + vitals */}
        {note && (
          <div className="space-y-2 rounded-xl bg-muted/40 p-3">
            {note.main_complaint && (
              <div className="flex items-start gap-2">
                <Stethoscope size={14} className="mt-0.5 shrink-0 text-[var(--color-brand-teal)]" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-foreground">Chief Complaint</p>
                  <p className="text-xs text-muted-foreground">{note.main_complaint}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
              <VitalRow icon={HeartPulse} label="BP" value={note.blood_pressure} />
              <VitalRow icon={Activity} label="HR" value={note.heart_rate != null ? `${note.heart_rate} bpm` : null} />
              <VitalRow icon={Thermometer} label="Temp" value={note.temperature != null ? `${note.temperature}°C` : null} />
              <VitalRow icon={Wind} label="RR" value={note.respiratory_rate != null ? `${note.respiratory_rate}/min` : null} />
              <VitalRow icon={HeartPulse} label="SpO₂" value={note.oxygen_saturation != null ? `${note.oxygen_saturation}%` : null} />
              <VitalRow icon={Weight} label="Weight" value={note.weight != null ? `${note.weight} kg` : null} />
            </div>

            {note.additional_remarks && (
              <p className="text-xs text-muted-foreground pt-1 italic">
                Remarks: {note.additional_remarks}
              </p>
            )}
          </div>
        )}

        {/* Prescriptions */}
        {prescriptions.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Pill size={13} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
              Prescriptions
            </p>
            <ul className="space-y-1 pl-5">
              {prescriptions.map((rx, idx) => (
                <li key={rx.guid ?? idx} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{rx.medicine_name ?? "—"}</span>
                  {(rx.dosage || rx.frequency || rx.duration) && (
                    <span>
                      {" — "}
                      {[rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lifestyle & Diet */}
        {lifestyleAndDiet.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Lightbulb size={13} className="text-amber-500" aria-hidden="true" />
              Lifestyle &amp; Diet
            </p>
            <ul className="space-y-1 pl-5 list-disc">
              {lifestyleAndDiet.map((item, idx) => (
                <li key={idx} className="text-xs text-muted-foreground">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Care Plan Steps */}
        {carePlanSteps.length > 0 && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ListChecks size={13} className="text-[var(--color-brand-blue)]" aria-hidden="true" />
              Care Plan
            </p>
            <ol className="space-y-1 pl-5 list-decimal">
              {carePlanSteps.map((step, idx) => (
                <li key={idx} className="text-xs text-muted-foreground">{step}</li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PatientRecordsPage() {
  const { patientGuid, isLoading: sessionLoading } = usePatientSession();
  const [history, setHistory] = useState<PatientHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionLoading) return;
    if (!patientGuid) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchHistory() {
      setLoading(true);
      setError(null);
      try {
        const data = await patientService.getHistory({ patient_guid: patientGuid! });
        if (!cancelled) setHistory(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load records");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHistory();
    return () => { cancelled = true; };
  }, [patientGuid, sessionLoading]);

  const timeline = history?.history_timeline ?? [];

  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Health Records</h1>
          <p className="text-sm text-muted-foreground">
            {history?.patient_name
              ? `${history.patient_name}'s medical history`
              : "Your personal medical history."}
          </p>
        </div>

        {/* Triage Summary */}
        {history?.patient_triage_summary && (
          <div className="mb-5 rounded-xl border border-border/60 bg-muted/40 p-4">
            <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
              <ClipboardList size={13} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
              Triage Summary
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {history.patient_triage_summary}
            </p>
          </div>
        )}

        {/* Loading */}
        {(loading || sessionLoading) && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-muted-foreground" aria-hidden="true" />
            <span className="ml-2 text-sm text-muted-foreground">Loading records…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <p className="text-sm text-red-600 text-center py-12">{error}</p>
        )}

        {/* No session */}
        {!loading && !sessionLoading && !patientGuid && (
          <p className="text-sm text-muted-foreground text-center py-12">
            No patient session found. Please book an appointment first.
          </p>
        )}

        {/* Empty state */}
        {!loading && !error && patientGuid && timeline.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">
            No health records yet.
          </p>
        )}

        {/* Timeline */}
        {!loading && !error && timeline.length > 0 && (
          <ul role="list" className="flex flex-col gap-4">
            {timeline.map((record) => (
              <li key={record.appointment_guid}>
                <RecordCard record={record} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
