"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AmbientScheduler, type Appointment } from "@/components/doctor/AmbientScheduler";
import { AmbientSessionPanel, type SessionData } from "@/components/doctor/AmbientSessionPanel";
import { AmbientBrief, type AIBriefData } from "@/components/doctor/AmbientBrief";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bot, CalendarClock, History, LayoutGrid, Loader2, Stethoscope, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TESTING_DOCTOR_GUID, TESTING_PATIENT_GUID } from "@/lib/api/model/testing-guid.model";
import { useAmbientRecording } from "@/hooks/useAmbientRecording";
import { useSessionEvents, type SessionEvent } from "@/hooks/useSessionEvents";
import { toast } from "sonner";
import { appointmentService } from "@/lib/api/services/appointment-service";
import { doctorService } from "@/lib/api/services/doctor-service";
import type { PatientHistoryResponse } from "@/lib/api/model/patient-history.model";
import { PatientHistoryTimelineSheet } from "./PatientHistoryTimelineSheet";

/* ── Fallback mock data (used when API is unreachable) ───── */
const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: "1", patientName: "Maria Santos",   patientAge: 34, reason: "Follow-up consultation",  time: "09:00", durationMin: 20, status: "completed" },
  { id: "2", patientName: "James Okafor",   patientAge: 67, reason: "Blood pressure review",   time: "09:30", durationMin: 15, status: "upcoming" },
  { id: "3", patientName: "Lin Wei",        patientAge: 28, reason: "Annual health check",     time: "10:00", durationMin: 30, status: "upcoming" },
  { id: "4", patientName: "Rachel Novak",   patientAge: 52, reason: "Diabetes management",     time: "10:45", durationMin: 20, status: "upcoming" },
  { id: "5", patientName: "Anthony Bello",  patientAge: 41, reason: "Back pain assessment",    time: "11:15", durationMin: 20, status: "upcoming" },
  { id: "6", patientName: "Priya Nair",     patientAge: 29, reason: "Respiratory infection",   time: "11:45", durationMin: 15, status: "upcoming" },
  { id: "7", patientName: "Carlos Mendes",  patientAge: 58, reason: "Cardiac follow-up",       time: "14:00", durationMin: 30, status: "upcoming" },
  { id: "8", patientName: "Sofia Hassan",   patientAge: 36, reason: "Post-op check",           time: "14:45", durationMin: 15, status: "rescheduled" },
];

const EMPTY_SESSION_DATA: SessionData = {
  vitals: { bp: "", hr: "", temp: "", spo2: "", rr: "", weight: "" },
  prescriptions: [],
  chiefComplaint: "",
  clinicalNotes: "",
};

/* ── AI brief generator from real LLM report data ────────── */
function generateBriefFromReport(
  appointment: Appointment,
  data: SessionData,
  report: Record<string, unknown>,
  followUpMsg?: string
): AIBriefData {
  // Supports two schemas:
  // 1. Nested (from SSE pg_notify payload): { clinical_insights: {...}, patient_instructions: {...}, clinical_audit: {...} }
  // 2. Flat (from app_mda_clinical_report table): { summary, key_observations, red_flags, lifestyle_and_diet, care_plan_steps, form_discrepancies, patient_comprehension_rating }

  const isFlat = "summary" in report && !("clinical_insights" in report);

  let summary = "";
  let keyObservations: string[] = [];
  let redFlags: string[] = [];
  let lifestyleAndDiet: string[] = [];
  let carePlanSteps: string[] = [];
  let formDiscrepancies: string[] = [];
  let patientComprehensionRating = "";

  if (isFlat) {
    // Flat schema (from clinical_report table record)
    summary = (report.summary as string) || "";
    keyObservations = (report.key_observations as string[]) || [];
    redFlags = (report.red_flags as string[]) || [];
    lifestyleAndDiet = (report.lifestyle_and_diet as string[]) || [];
    carePlanSteps = (report.care_plan_steps as string[]) || [];
    formDiscrepancies = (report.form_discrepancies as string[]) || [];
    patientComprehensionRating = (report.patient_comprehension_rating as string) || "";
  } else {
    // Nested schema (from SSE payload / LLM output)
    const llmClinicalInsights = report.clinical_insights as Record<string, unknown> | undefined;
    const llmPatientInstructions = report.patient_instructions as Record<string, unknown> | undefined;
    const llmClinicalAudit = report.clinical_audit as Record<string, unknown> | undefined;

    if (llmClinicalInsights) {
      summary = (llmClinicalInsights.summary as string) || "";
      keyObservations = (llmClinicalInsights.key_observations as string[]) || [];
      redFlags = (llmClinicalInsights.red_flags as string[]) || [];
    }
    if (llmPatientInstructions) {
      lifestyleAndDiet = (llmPatientInstructions.lifestyle_and_diet as string[]) || [];
      carePlanSteps = (llmPatientInstructions.care_plan_steps as string[]) || [];
    }
    if (llmClinicalAudit) {
      formDiscrepancies = (llmClinicalAudit.form_discrepancies as string[]) || [];
      patientComprehensionRating = (llmClinicalAudit.patient_comprehension_rating as string) || "";
    }
  }

  // ── Build clinicalInsights ──
  const clinicalInsights: AIBriefData["clinicalInsights"] = [];

  if (summary) {
    clinicalInsights.push({
      category: "diagnosis",
      text: summary,
      severity: "low",
    });
  }

  keyObservations.forEach((obs) => {
    clinicalInsights.push({
      category: "finding",
      text: obs,
      severity: "medium",
    });
  });

  if (redFlags.length > 0) {
    redFlags.forEach((flag) => {
      clinicalInsights.push({ category: "risk", text: flag, severity: "high" });
    });
  } else {
    clinicalInsights.push({
      category: "risk",
      text: "No acute red flags identified during the consultation.",
      severity: "low",
    });
  }

  // ── Build patientInstructions ──
  const patientInstructions: AIBriefData["patientInstructions"] = [];

  lifestyleAndDiet.forEach((item) => {
    patientInstructions.push({ icon: "diet", instruction: item });
  });

  carePlanSteps.forEach((step) => {
    patientInstructions.push({ icon: "medication", instruction: step });
  });

  if (followUpMsg) {
    patientInstructions.push({ icon: "followup", instruction: followUpMsg });
  }

  // ── Build clinicalAudit ──
  const clinicalAudit: AIBriefData["clinicalAudit"] = {
    formDiscrepancies,
    patientComprehensionRating,
  };

  // Prescription verification — not part of LLM report
  const prescriptionVerification: AIBriefData["prescriptionVerification"] = [];

  return {
    clinicalInsights,
    patientInstructions,
    prescriptionVerification,
    clinicalAudit,
  };
}

/* ── Fallback AI brief generator (simulated) ─────────────── */
function generateBrief(appointment: Appointment, data: SessionData): AIBriefData {
  const verifications = data.prescriptions.map((rx, i) => {
    const hasFlag = rx.dosage && rx.remarks && rx.remarks.toLowerCase().includes("alcohol");
    return {
      rxIndex: i,
      medicine: rx.medicine,
      typedDosage: `${rx.dosage} ${rx.frequency} × ${rx.duration}`,
      aiExtracted: rx.medicine
        ? `${rx.medicine} ${rx.dosage || "dose not specified"} — patient mentioned taking ${rx.frequency || "unclear frequency"}`
        : "Not mentioned in conversation",
      status: (hasFlag ? "warning" : rx.medicine ? "match" : "mismatch") as
        | "match"
        | "warning"
        | "mismatch",
      flag: hasFlag
        ? "Potential interaction noted: patient mentioned regular alcohol consumption."
        : undefined,
    };
  });

  return {
    clinicalInsights: [
      {
        category: "diagnosis",
        text: `Primary presentation: ${data.chiefComplaint || appointment.reason}. Patient appears stable and cooperative during examination.`,
        severity: "low",
      },
      {
        category: "vitals",
        text: data.vitals.bp
          ? `Blood pressure recorded at ${data.vitals.bp}. ${parseFloat(data.vitals.bp) > 140 ? "Elevated — consider medication adjustment." : "Within acceptable range."}`
          : "Vitals capture incomplete — recommend documenting before closing note.",
        severity: data.vitals.bp && parseFloat(data.vitals.bp) > 140 ? "high" : "low",
      },
      {
        category: "finding",
        text: `Patient voiced concerns regarding ${appointment.reason.toLowerCase()}. Follow-up recommended in 2 weeks.`,
        severity: "medium",
      },
      {
        category: "risk",
        text: "No acute red flags identified during the consultation. Routine monitoring advised.",
        severity: "low",
      },
      {
        category: "lab",
        text: "Consider HbA1c and lipid panel at next scheduled visit based on discussed risk factors.",
        severity: "medium",
      },
    ],
    patientInstructions: [
      {
        icon: "medication",
        instruction: data.prescriptions.length > 0
          ? `Take your medications as prescribed: ${data.prescriptions.map((r) => r.medicine || "unnamed medicine").join(", ")}. Do not stop without consulting your doctor.`
          : "No new medications prescribed today. Continue existing treatment plan.",
      },
      {
        icon: "activity",
        instruction: "Engage in at least 30 minutes of light physical activity (walking, swimming) five days a week unless advised otherwise.",
      },
      {
        icon: "diet",
        instruction: "Reduce sodium and processed sugar intake. Eat balanced meals with plenty of vegetables and whole grains.",
      },
      {
        icon: "followup",
        instruction: `Return in 2 weeks for a follow-up review. If symptoms worsen — especially ${appointment.reason.toLowerCase()} — seek immediate care.`,
      },
      {
        icon: "warning",
        instruction: "Seek emergency care if you experience chest pain, difficulty breathing, sudden dizziness, or severe headache.",
      },
    ],
    prescriptionVerification: verifications,
  };
}

/* ── Testing GUIDs for MVP ──────────────────────────────── */
const HARDCODED_DOCTOR_GUID = TESTING_DOCTOR_GUID;

/* ── Main Component ─────────────────────────────────────── */
export function AmbientCoreWorkspace() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(INITIAL_APPOINTMENTS[1]);
  const [sessionState, setSessionState] = useState<"idle" | "live" | "processing" | "complete">("idle");
  const [sessionData, setSessionData] = useState<SessionData>(EMPTY_SESSION_DATA);
  const [brief, setBrief] = useState<AIBriefData | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [followUpMsg, setFollowUpMsg] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);

  const [patientHistory, setPatientHistory] = useState<PatientHistoryResponse | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false);
  const [isScheduleCollapsed, setIsScheduleCollapsed] = useState(false);

  const handleOpenHistory = useCallback(() => {
    setIsHistorySheetOpen(true);
    setIsScheduleCollapsed(true);
  }, []);

  const handleCloseHistory = useCallback((open: boolean) => {
    setIsHistorySheetOpen(open);
    if (!open) {
      setIsScheduleCollapsed(false);
    }
  }, []);

  // Load patient history timeline when active appointment changes
  useEffect(() => {
    const patientGuid = activeAppointment?.patientGuid || TESTING_PATIENT_GUID;
    let cancelled = false;
    async function loadHistory() {
      setIsLoadingHistory(true);
      try {
        const res = await doctorService.getPatientHistory({
          doctor_guid: HARDCODED_DOCTOR_GUID,
          patient_guid: patientGuid,
        });
        if (!cancelled) setPatientHistory(res);
      } catch (err) {
        if (!cancelled) console.warn("Failed to load patient history:", err);
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, [activeAppointment?.patientGuid]);

  // ── Load real appointments from the backend on mount ─────────────────────
  useEffect(() => {
    let cancelled = false;

    /** Normalise backend appointment_status → frontend Appointment status union */
    function normaliseStatus(raw?: string): Appointment["status"] {
      if (!raw) return "upcoming";
      const s = raw.toLowerCase();
      if (s === "in_progress" || s === "in-progress" || s === "active") return "in-progress";
      if (s === "completed" || s === "done")                              return "completed";
      if (s === "cancelled" || s === "canceled")                          return "cancelled";
      if (s === "rescheduled")                                            return "rescheduled";
      return "upcoming"; // 'scheduled', 'pending', unknown → upcoming
    }

    /** Format an ISO datetime string to "HH:MM" in local time */
    function toTimeLabel(iso?: string): string {
      if (!iso) return "--:--";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "--:--";
      return d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }

    /** Compute duration in minutes between two ISO strings */
    function toDurationMin(start?: string, end?: string): number {
      if (!start || !end) return 0;
      const diff = new Date(end).getTime() - new Date(start).getTime();
      if (isNaN(diff) || diff <= 0) return 0;
      return Math.round(diff / 60000);
    }

    async function loadAppointments() {
      setIsLoadingAppointments(true);
      try {
        const items = await appointmentService.getByDoctor({
          doctor_guid: HARDCODED_DOCTOR_GUID,
        });
        if (cancelled) return;
        if (items.length === 0) {
          // Backend returned nothing — keep mock fallback
          setIsLoadingAppointments(false);
          return;
        }
        // Map DoctorAppointmentListItem → Appointment (one row per appointment)
        const mapped: Appointment[] = items.map((item) => ({
          id: item.appointment_guid ?? item.patient_guid, // appointment_guid is unique per row
          patientName: item.patient_name ?? "Unknown Patient",
          patientAge: 0,           // not in getByDoctor response
          reason: "Appointment",   // not in getByDoctor response
          time: toTimeLabel(item.scheduled_start),
          durationMin: toDurationMin(item.scheduled_start, item.scheduled_end),
          status: normaliseStatus(item.appointment_status),
          triageSummary: item.patient_triage_summary ?? undefined,
          patientGuid: item.patient_guid,
          appointmentGuid: item.appointment_guid,
          runningNo: item.running_no ?? undefined,
          scheduledStart: item.scheduled_start ?? undefined,
          scheduledEnd: item.scheduled_end ?? undefined,
        }));
        setAppointments(mapped);
        if (mapped.length > 0) {
          const target = mapped.find((a) => a.patientGuid === TESTING_PATIENT_GUID || a.patientName?.includes("James")) || mapped[0];
          setActiveAppointment(target);
        }
      } catch (err) {
        if (cancelled) return;
        console.warn("[AmbientCoreWorkspace] getByDoctor failed — using mock data:", err);
        // Keep INITIAL_APPOINTMENTS (already the default state)
      } finally {
        if (!cancelled) setIsLoadingAppointments(false);
      }
    }
    loadAppointments();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Track which session GUID belongs to which appointment ID
  const sessionToAppointmentRef = useRef<Map<string, string>>(new Map());
  const lastProcessedEventRef = useRef<SessionEvent | null>(null);

  const {
    startRecording,
    stopRecording,
    isRecording,
    sessionGuid,
    chunkCount,
    error: recordingError,
  } = useAmbientRecording({
    appointmentGuid: activeAppointment?.appointmentGuid ?? "",
    doctorGuid: HARDCODED_DOCTOR_GUID,
  });

  // ── SSE: Subscribe to real-time events for this doctor ─────────────────
  const {
    latestEvent,
    isConnected: sseConnected,
    getEventsForSession,
  } = useSessionEvents({
    doctorGuid: HARDCODED_DOCTOR_GUID,
    enabled: true,
    useProxy: true, // Route through Next.js proxy to avoid CORS issues
  });

  // ── React to SSE events ─────────────────────────────────────────────────
  useEffect(() => {
    if (!latestEvent) return;
    // Skip if we already processed this exact event object
    if (latestEvent === lastProcessedEventRef.current) return;
    lastProcessedEventRef.current = latestEvent;

    console.log("[SSE Event Received]", latestEvent.event, latestEvent);

    const eventSessionGuid = latestEvent.session_guid;
    const mappedAppointmentId = sessionToAppointmentRef.current.get(eventSessionGuid);

    switch (latestEvent.event) {
      case "transcription_complete": {
        setPipelineStep("Transcript ready");
        toast.success("Transcript Ready", {
          description: `Transcription completed for session ${eventSessionGuid.slice(0, 8)}...`,
        });
        if (latestEvent.transcript) {
          setTranscript(latestEvent.transcript);
        }
        break;
      }
      case "report_generated": {
        setPipelineStep("Report generated");
        toast.success("AI Report Generated", {
          description: "Clinical insights and treatment plan are ready.",
        });
        if (latestEvent.report && mappedAppointmentId) {
          // Use a functional update to avoid depending on activeAppointment
          setActiveAppointment((current) => {
            if (current && mappedAppointmentId === current.id) {
              const generatedBrief = generateBriefFromReport(
                current,
                sessionData,
                latestEvent.report!,
                undefined
              );
              setBrief(generatedBrief);
            }
            return current;
          });
        }
        break;
      }
      case "followup_queued": {
        setPipelineStep("Follow-up queued");
        toast.success("Follow-Up Message Queued", {
          description: "Patient follow-up notification has been created.",
        });
        if (latestEvent.follow_up_msg) {
          setFollowUpMsg(latestEvent.follow_up_msg);
        }

        // Pipeline complete — mark session as done
        setSessionState("complete");
        if (mappedAppointmentId) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === mappedAppointmentId ? { ...a, status: "completed" } : a))
          );
          setActiveAppointment((prev) => {
            if (prev?.id === mappedAppointmentId) {
              return { ...prev, status: "completed" };
            }
            return prev;
          });
        }

        // Update brief with follow-up message if we have a report
        if (latestEvent.follow_up_msg && mappedAppointmentId) {
          const sessionEvents = getEventsForSession(eventSessionGuid);
          const reportEvent = sessionEvents.find((e) => e.event === "report_generated");
          if (reportEvent?.report) {
            setActiveAppointment((current) => {
              if (current && mappedAppointmentId === current.id) {
                const updatedBrief = generateBriefFromReport(
                  current,
                  sessionData,
                  reportEvent.report!,
                  latestEvent.follow_up_msg!
                );
                setBrief(updatedBrief);
              }
              return current;
            });
          }
        }
        break;
      }
      case "pipeline_failed": {
        setPipelineStep("Pipeline failed");
        toast.error("Pipeline Failed", {
          description: latestEvent.error || "An error occurred during processing.",
        });
        console.error("[SSE] Pipeline failed:", latestEvent.error);
        // Fallback to simulated brief
        setActiveAppointment((current) => {
          if (current && mappedAppointmentId === current.id) {
            const generatedBrief = generateBrief(current, sessionData);
            setBrief(generatedBrief);
          }
          return current;
        });
        setSessionState("complete");
        if (mappedAppointmentId) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === mappedAppointmentId ? { ...a, status: "completed" } : a))
          );
          setActiveAppointment((prev) => {
            if (prev?.id === mappedAppointmentId) {
              return { ...prev, status: "completed" };
            }
            return prev;
          });
        }
        break;
      }
    }
    // Only depend on latestEvent — use refs/functional updates for everything else
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestEvent]);

  const handleSelectAppointment = useCallback(
    (appt: Appointment) => {
      if (sessionState === "live") return; // don't switch while recording
      setActiveAppointment(appt);
      setSessionState("idle");
      setSessionData(EMPTY_SESSION_DATA);
      setBrief(null);
      setTranscript(null);
      setFollowUpMsg(null);
      setPipelineStep(null);
    },
    [sessionState]
  );

  const handleStatusChange = useCallback(
    (id: string, status: Appointment["status"]) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      if (activeAppointment?.id === id) {
        setActiveAppointment((prev) => (prev ? { ...prev, status } : null));
      }
    },
    [activeAppointment]
  );

  const handleStartSession = useCallback(async () => {
    if (!activeAppointment) return;

    // Start real audio recording + backend session
    const sGuid = await startRecording();
    if (!sGuid) {
      console.error("Failed to start recording session");
      return;
    }

    // Map this session GUID to the current appointment ID
    sessionToAppointmentRef.current.set(sGuid, activeAppointment.id);

    setSessionState("live");
    setAppointments((prev) =>
      prev.map((a) => (a.id === activeAppointment.id ? { ...a, status: "in-progress" } : a))
    );
    setActiveAppointment((prev) => (prev ? { ...prev, status: "in-progress" } : null));
  }, [activeAppointment, startRecording]);

  const handleEndSession = useCallback(
    async (data: SessionData) => {
      if (!activeAppointment) return;
      setSessionState("processing");
      setPipelineStep("Processing started...");

      // Mark the appointment as completed in the backend
      if (activeAppointment.appointmentGuid) {
        try {
          await appointmentService.update(activeAppointment.appointmentGuid, {
            appointment_status: "completed",
          });
        } catch (err) {
          console.error("Failed to update appointment status:", err);
        }
      }

      // Stop recording + trigger backend pipeline (transcription → report → follow-up)
      await stopRecording();

      // The SSE stream will push updates as each pipeline step completes.
      // No polling needed — the useEffect above handles incoming events.
    },
    [activeAppointment, stopRecording]
  );

  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const totalCount = appointments.length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Top status bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-background px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-[var(--color-brand-teal-light)]">
            <LayoutGrid size={13} className="text-[var(--color-brand-teal)]" />
          </div>
          <h1 className="text-sm font-bold tracking-tight text-foreground">
            The Ambient Core
          </h1>
          <Badge className="border-0 bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] text-[10px] px-1.5 py-0 font-medium">
            Active Workspace
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Stethoscope size={11} />
            Dr. Aiden Clarke
          </span>
          <Separator orientation="vertical" className="h-3" />
          <span className="flex items-center gap-1">
            <CalendarClock size={11} />
            {completedCount}/{totalCount} seen today
          </span>
          {/* Patient History Trigger Button */}
          <Separator orientation="vertical" className="h-3" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenHistory}
            className="gap-1.5 border-[var(--color-brand-teal)]/40 text-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-light)] h-6 text-[11px] font-semibold px-2 shadow-sm"
          >
            <History size={12} />
            <span>Timeline ({patientHistory?.history_timeline?.length ?? 0})</span>
          </Button>

          {/* SSE connection indicator */}
          <Separator orientation="vertical" className="h-3" />
          <span className={cn(
            "flex items-center gap-1 font-medium",
            sseConnected ? "text-emerald-600" : "text-muted-foreground"
          )}>
            {sseConnected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {sseConnected ? "Live" : "Offline"}
          </span>
          {sessionState === "live" && (
            <>
              <Separator orientation="vertical" className="h-3" />
              <span className="flex items-center gap-1 text-emerald-600 font-semibold animate-pulse">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Session Live {chunkCount > 0 && `· ${chunkCount} chunks`}
              </span>
            </>
          )}
          {sessionState === "processing" && (
            <>
              <Separator orientation="vertical" className="h-3" />
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <Bot size={11} />
                {pipelineStep || "AI Processing"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Three-column workspace ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Column 1 — Schedule */}
        <div
          className={cn(
            "flex shrink-0 flex-col border-r border-border/60 bg-background transition-all duration-200",
            isScheduleCollapsed ? "w-[56px]" : "w-[220px]"
          )}
        >
          <AmbientScheduler
            appointments={appointments}
            onSelectAppointment={handleSelectAppointment}
            activeAppointmentId={activeAppointment?.id ?? null}
            onStatusChange={handleStatusChange}
            isLoading={isLoadingAppointments}
            isCollapsed={isScheduleCollapsed}
            onToggleCollapse={() => setIsScheduleCollapsed((prev) => !prev)}
          />
        </div>

        {/* Column 2 — Docked Patient History Timeline */}
        <PatientHistoryTimelineSheet
          open={isHistorySheetOpen}
          onOpenChange={handleCloseHistory}
          history={patientHistory}
          isLoading={isLoadingHistory}
          onCiteNote={(text) => {
            setSessionData((prev) => ({
              ...prev,
              clinicalNotes: prev.clinicalNotes
                ? `${prev.clinicalNotes}\n\n[Cited from History]: ${text}`
                : `[Cited from History]: ${text}`,
            }));
            toast.success("Cited to Clinical Notes");
          }}
          onReprescribe={(rx) => {
            setSessionData((prev) => ({
              ...prev,
              prescriptions: [
                ...prev.prescriptions,
                {
                  id: crypto.randomUUID(),
                  medicine: rx.medicine_name || "",
                  dosage: rx.dosage || "",
                  frequency: rx.frequency || "",
                  duration: rx.duration || "",
                  remarks: "Re-prescribed from history",
                },
              ],
            }));
            toast.success(`Re-prescribed ${rx.medicine_name || "medication"}`);
          }}
        />

        {/* Column 3 — Session Panel */}
        <div className={cn("flex flex-1 min-w-0 flex-col bg-background", brief !== null && "border-r border-border/60")}>
          <AmbientSessionPanel
            appointment={activeAppointment}
            sessionState={sessionState}
            onStart={handleStartSession}
            onEnd={handleEndSession}
            sessionData={sessionData}
            onSessionDataChange={setSessionData}
            onOpenHistory={handleOpenHistory}
            historyCount={patientHistory?.history_timeline?.length ?? 0}
            isBriefHidden={brief === null}
          />
        </div>

        {/* Column 4 — AI Brief */}
        {brief !== null && (
          <div className="flex w-[340px] shrink-0 flex-col bg-background overflow-hidden animate-in slide-in-from-right duration-300 shadow-sm">
            <AmbientBrief
              sessionState={sessionState === "processing" ? "complete" : sessionState}
              brief={brief}
              appointment={activeAppointment}
              sessionData={sessionData}
            />
          </div>
        )}
      </div>
    </div>
  );
}
