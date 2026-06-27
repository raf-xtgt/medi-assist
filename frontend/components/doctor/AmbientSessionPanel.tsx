"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { appointmentNoteService, prescriptionService } from "@/lib/api/services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  CheckCircle,
  ExternalLink,
  Loader2,
  Mic,
  MicOff,
  PlayCircle,
  Plus,
  Save,
  Stethoscope,
  StopCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TESTING_PATIENT_GUID, TESTING_APPOINTMENT_GUID } from "@/lib/api/model/testing-guid.model";
import { useRouter } from "next/navigation";
import type { Appointment } from "./AmbientScheduler";
import { TriageSummaryBanner } from "./TriageSummaryBanner";

/* ── Types ──────────────────────────────────────────────── */
export interface VitalEntry {
  bp: string;
  hr: string;
  temp: string;
  spo2: string;
  rr: string;
  weight: string;
}

export interface PrescriptionRow {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  remarks: string;
}

export interface SessionData {
  vitals: VitalEntry;
  prescriptions: PrescriptionRow[];
  chiefComplaint: string;
  clinicalNotes: string;
}

interface AmbientSessionPanelProps {
  appointment: Appointment | null;
  sessionState: "idle" | "live" | "processing" | "complete";
  onStart: () => void;
  onEnd: (data: SessionData) => void;
  sessionData: SessionData;
  onSessionDataChange: (data: SessionData) => void;
}

/* ── Wave Visualizer ────────────────────────────────────── */
function WaveVisualizer({ isLive }: { isLive: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    timeRef.current += 0.04;
    const t = timeRef.current;

    const waves = [
      { amp: 18, freq: 0.022, speed: 1.1, color: "rgba(13, 148, 136, 0.7)", width: 2 },
      { amp: 10, freq: 0.035, speed: 1.6, color: "rgba(13, 148, 136, 0.45)", width: 1.5 },
      { amp: 24, freq: 0.014, speed: 0.7, color: "rgba(29, 111, 164, 0.35)", width: 1.5 },
      { amp: 6,  freq: 0.055, speed: 2.0, color: "rgba(13, 148, 136, 0.25)", width: 1 },
    ];

    waves.forEach(({ amp, freq, speed, color, width }) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineJoin = "round";

      for (let x = 0; x <= W; x += 1) {
        const y =
          H / 2 +
          amp * Math.sin(x * freq + t * speed) +
          (amp / 2) * Math.sin(x * freq * 1.7 + t * speed * 1.3);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Pulse dot
    const pulse = 0.5 + 0.5 * Math.sin(t * 3);
    ctx.beginPath();
    ctx.arc(W - 24, H / 2, 4 + pulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(13, 148, 136, ${0.5 + 0.5 * pulse})`;
    ctx.fill();

    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    if (isLive) {
      animFrameRef.current = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isLive, draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-label="Audio wave visualizer"
      aria-hidden="true"
    />
  );
}

/* ── Blank prescription row ─────────────────────────────── */
function newRow(): PrescriptionRow {
  return {
    id: crypto.randomUUID(),
    medicine: "",
    dosage: "",
    frequency: "",
    duration: "",
    remarks: "",
  };
}

/* ── Main Component ─────────────────────────────────────── */
export function AmbientSessionPanel({
  appointment,
  sessionState,
  onStart,
  onEnd,
  sessionData,
  onSessionDataChange,
}: AmbientSessionPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();

  const isLive = sessionState === "live";
  const isProcessing = sessionState === "processing";
  const isComplete = sessionState === "complete";
  const isIdle = sessionState === "idle";

  async function handleSave() {
    if (!appointment) return;
    setIsSaving(true);
    setSaveSuccess(false);

    // Testing GUIDs
    const patient_guid = TESTING_PATIENT_GUID;
    const appointment_guid = TESTING_APPOINTMENT_GUID;

    try {
      // Save appointment note (vitals + chief complaint + clinical notes)
      await appointmentNoteService.create({
        appointment_guid,
        patient_guid,
        main_complaint: sessionData.chiefComplaint,
        blood_pressure: sessionData.vitals.bp || undefined,
        heart_rate: sessionData.vitals.hr ? parseInt(sessionData.vitals.hr) : undefined,
        temperature: sessionData.vitals.temp ? parseFloat(sessionData.vitals.temp) : undefined,
        respiratory_rate: sessionData.vitals.rr ? parseInt(sessionData.vitals.rr) : undefined,
        oxygen_saturation: sessionData.vitals.spo2 ? parseFloat(sessionData.vitals.spo2) : undefined,
        weight: sessionData.vitals.weight ? parseFloat(sessionData.vitals.weight) : undefined,
        additional_remarks: sessionData.clinicalNotes || undefined,
        status: "active",
      });

      // Save prescriptions
      for (const rx of sessionData.prescriptions) {
        if (!rx.medicine) continue;
        await prescriptionService.create({
          appointment_guid,
          patient_guid,
          medicine_name: rx.medicine,
          dosage: rx.dosage || undefined,
          frequency: rx.frequency || undefined,
          duration: rx.duration || undefined,
          status: "active",
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save session data:", err);
    } finally {
      setIsSaving(false);
    }
  }

  function updateVitals(field: keyof VitalEntry, value: string) {
    onSessionDataChange({
      ...sessionData,
      vitals: { ...sessionData.vitals, [field]: value },
    });
  }

  function updatePrescription(id: string, field: keyof PrescriptionRow, value: string) {
    onSessionDataChange({
      ...sessionData,
      prescriptions: sessionData.prescriptions.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    });
  }

  function addRow() {
    onSessionDataChange({
      ...sessionData,
      prescriptions: [...sessionData.prescriptions, newRow()],
    });
  }

  function removeRow(id: string) {
    onSessionDataChange({
      ...sessionData,
      prescriptions: sessionData.prescriptions.filter((r) => r.id !== id),
    });
  }

  /* ── Empty state ────────────────────────────────────────── */
  if (!appointment) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)]">
          <Stethoscope size={22} className="text-[var(--color-brand-teal)]" />
        </div>
        <p className="text-sm font-medium text-foreground">No active appointment</p>
        <p className="max-w-[200px] text-xs text-muted-foreground">
          Select a patient from the schedule to begin an ambient session.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Patient header ── */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              isLive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]"
            )}
          >
            {appointment.patientName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {appointment.patientName}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {appointment.patientAge}y &middot; {appointment.reason} &middot; {appointment.time}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isLive && (
            <Badge className="border-0 bg-emerald-100 text-emerald-700 gap-1 text-[10px]">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              LIVE
            </Badge>
          )}
          {isProcessing && (
            <Badge className="border-0 bg-amber-50 text-amber-700 text-[10px]">
              Processing...
            </Badge>
          )}
          {isComplete && (
            <Badge className="border-0 bg-emerald-50 text-emerald-700 gap-1 text-[10px]">
              <CheckCircle size={10} />
              Complete
            </Badge>
          )}
        </div>
      </div>

      {/* ── Canvas visualizer ── */}
      <div
        className={cn(
          "relative h-[68px] shrink-0 border-b border-border/60 transition-all overflow-hidden",
          isLive ? "bg-slate-950" : "bg-slate-50 dark:bg-slate-900/40"
        )}
        aria-label={isLive ? "Live audio recording in progress" : "Audio stream inactive"}
      >
        {isLive ? (
          <>
            <WaveVisualizer isLive={true} />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <Mic size={11} className="text-[var(--color-brand-teal)]" />
              <span className="text-[10px] font-medium text-[var(--color-brand-teal)]">
                Ambient recording active
              </span>
            </div>
          </>
        ) : isProcessing ? (
          <div className="flex h-full items-center justify-center gap-2">
            <Activity size={14} className="animate-pulse text-amber-500" />
            <span className="text-xs text-amber-600 font-medium">
              AI pipeline processing session data...
            </span>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center gap-1.5 opacity-40">
            <MicOff size={13} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Stream inactive</span>
          </div>
        )}
      </div>

      {/* ── Processing skeleton ── */}
      {isProcessing && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Generating AI Brief
          </p>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className={cn("h-7", i % 3 === 0 ? "w-full" : i % 2 === 0 ? "w-3/4" : "w-1/2")} />
            </div>
          ))}
        </div>
      )}

      {/* ── Active / Idle form ── */}
      {!isProcessing && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {/* Triage Summary Banner — shown before/between sessions, hides when live */}
          <TriageSummaryBanner
            triageSummary={appointment.triageSummary}
            collapsed={isLive || isProcessing}
          />

          {/* Chief complaint */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Chief Complaint
            </Label>
            <Input
              placeholder="e.g. Persistent cough for 5 days..."
              value={sessionData.chiefComplaint}
              onChange={(e) =>
                onSessionDataChange({ ...sessionData, chiefComplaint: e.target.value })
              }
              disabled={isComplete}
              className="text-sm h-8"
            />
          </div>

          {/* Vitals */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Vitals Capture
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: "bp",     label: "BP",     placeholder: "120/80" },
                  { key: "hr",     label: "HR",     placeholder: "72 bpm" },
                  { key: "temp",   label: "Temp",   placeholder: "37.0°C" },
                  { key: "spo2",   label: "SpO₂",   placeholder: "98%" },
                  { key: "rr",     label: "RR",     placeholder: "16 /min" },
                  { key: "weight", label: "Weight", placeholder: "70 kg" },
                ] as { key: keyof VitalEntry; label: string; placeholder: string }[]
              ).map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">{label}</Label>
                  <Input
                    placeholder={placeholder}
                    value={sessionData.vitals[key]}
                    onChange={(e) => updateVitals(key, e.target.value)}
                    disabled={isComplete}
                    className="h-7 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Prescription table */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Prescription
              </p>
              {!isComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 text-[11px] text-[var(--color-brand-teal)] hover:text-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-light)] px-2"
                  onClick={addRow}
                >
                  <Plus size={11} />
                  Add Row
                </Button>
              )}
            </div>

            {sessionData.prescriptions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 py-4 text-center">
                <p className="text-xs text-muted-foreground">No prescriptions added yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessionData.prescriptions.map((row, idx) => (
                  <div
                    key={row.id}
                    className="relative rounded-lg border border-border/60 bg-card p-2.5 shadow-none"
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        Rx {idx + 1}
                      </span>
                      {!isComplete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-5 text-muted-foreground hover:text-destructive"
                          onClick={() => removeRow(row.id)}
                          aria-label="Remove prescription row"
                        >
                          <Trash2 size={11} />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="col-span-2">
                        <Label className="text-[10px] text-muted-foreground">Medicine Name</Label>
                        <Input
                          placeholder="e.g. Amoxicillin 500mg"
                          value={row.medicine}
                          onChange={(e) => updatePrescription(row.id, "medicine", e.target.value)}
                          disabled={isComplete}
                          className="mt-0.5 h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Dosage</Label>
                        <Input
                          placeholder="500mg"
                          value={row.dosage}
                          onChange={(e) => updatePrescription(row.id, "dosage", e.target.value)}
                          disabled={isComplete}
                          className="mt-0.5 h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Frequency</Label>
                        <Select
                          value={row.frequency}
                          onValueChange={(v) => updatePrescription(row.id, "frequency", v)}
                          disabled={isComplete}
                        >
                          <SelectTrigger className="mt-0.5 h-7 text-xs bg-background">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="od">Once daily (OD)</SelectItem>
                            <SelectItem value="bd">Twice daily (BD)</SelectItem>
                            <SelectItem value="tds">Three times (TDS)</SelectItem>
                            <SelectItem value="qds">Four times (QDS)</SelectItem>
                            <SelectItem value="prn">As needed (PRN)</SelectItem>
                            <SelectItem value="stat">Immediately (STAT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Duration</Label>
                        <Input
                          placeholder="7 days"
                          value={row.duration}
                          onChange={(e) => updatePrescription(row.id, "duration", e.target.value)}
                          disabled={isComplete}
                          className="mt-0.5 h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Remarks</Label>
                        <Input
                          placeholder="After meals"
                          value={row.remarks}
                          onChange={(e) => updatePrescription(row.id, "remarks", e.target.value)}
                          disabled={isComplete}
                          className="mt-0.5 h-7 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clinical notes */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Clinical Notes
            </Label>
            <Textarea
              placeholder="Additional observations, examination findings..."
              value={sessionData.clinicalNotes}
              onChange={(e) =>
                onSessionDataChange({ ...sessionData, clinicalNotes: e.target.value })
              }
              disabled={isComplete}
              className="min-h-[72px] text-xs resize-none"
            />
          </div>

          {/* Save button */}
          {!isComplete && (
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "w-full gap-2 h-9 text-sm font-semibold mt-2",
                saveSuccess
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-[var(--color-brand-blue)] text-white hover:bg-[var(--color-brand-blue-dark)]"
              )}
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle size={14} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Notes &amp; Prescriptions
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* ── Action footer ── */}
      <div className="shrink-0 border-t border-border/60 p-3">
        {isIdle && (
          <Button
            onClick={onStart}
            className="w-full gap-2 bg-[var(--color-brand-teal)] text-white hover:bg-[var(--color-brand-teal-dark)] h-9 text-sm font-semibold"
          >
            <PlayCircle size={16} />
            Start Appointment
          </Button>
        )}
        {isLive && (
          <Button
            onClick={() => onEnd(sessionData)}
            className="w-full gap-2 bg-[var(--color-danger)] text-white hover:bg-red-700 h-9 text-sm font-semibold"
          >
            <StopCircle size={16} />
            End Appointment
          </Button>
        )}
        {/* Session completion */}
        {isComplete && (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">
                Session complete — AI brief ready
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={() => router.push("/doctor/patients")}
            >
              View Archived Patient File
              <ExternalLink size={11} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
