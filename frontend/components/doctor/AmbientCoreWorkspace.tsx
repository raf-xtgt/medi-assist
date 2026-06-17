"use client";

import { useState, useCallback, useRef } from "react";
import { AmbientScheduler, type Appointment } from "@/components/doctor/AmbientScheduler";
import { AmbientSessionPanel, type SessionData } from "@/components/doctor/AmbientSessionPanel";
import { AmbientBrief, type AIBriefData } from "@/components/doctor/AmbientBrief";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, CalendarClock, LayoutGrid, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAmbientRecording } from "@/hooks/useAmbientRecording";

/* ── Mock seed data ──────────────────────────────────────── */
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

/* ── AI brief generator (simulated) ─────────────────────── */
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

/* ── Hardcoded GUIDs for MVP ──────────────────────────────── */
const HARDCODED_APPOINTMENT_GUID = "4e247042-f8f2-4cd5-b026-74fa99409eb7";
const HARDCODED_DOCTOR_GUID = "06f97db0-15dc-41cf-acab-bc278b38f00a";

/* ── Main Component ─────────────────────────────────────── */
export function AmbientCoreWorkspace() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [sessionState, setSessionState] = useState<"idle" | "live" | "processing" | "complete">("idle");
  const [sessionData, setSessionData] = useState<SessionData>(EMPTY_SESSION_DATA);
  const [brief, setBrief] = useState<AIBriefData | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    startRecording,
    stopRecording,
    pollTranscript,
    isRecording,
    sessionGuid,
    chunkCount,
    error: recordingError,
  } = useAmbientRecording({
    appointmentGuid: HARDCODED_APPOINTMENT_GUID,
    doctorGuid: HARDCODED_DOCTOR_GUID,
  });

  const handleSelectAppointment = useCallback(
    (appt: Appointment) => {
      if (sessionState === "live") return; // don't switch while recording
      setActiveAppointment(appt);
      setSessionState("idle");
      setSessionData(EMPTY_SESSION_DATA);
      setBrief(null);
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

      // Stop recording + trigger backend transcription
      await stopRecording();

      // Start polling for transcript
      const currentSessionGuid = sessionGuid;
      if (currentSessionGuid) {
        pollIntervalRef.current = setInterval(async () => {
          try {
            const status = await pollTranscript(currentSessionGuid);
            if (status.transcription_status === "completed") {
              // Transcription done
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              setTranscript(status.transcript);

              // Generate brief (still using simulated AI brief for now)
              const generatedBrief = generateBrief(activeAppointment, data);
              setBrief(generatedBrief);
              setSessionState("complete");
              setAppointments((prev) =>
                prev.map((a) => (a.id === activeAppointment.id ? { ...a, status: "completed" } : a))
              );
              setActiveAppointment((prev) => (prev ? { ...prev, status: "completed" } : null));
            } else if (status.transcription_status === "failed") {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
              console.error("Transcription failed");
              // Still show brief with what we have
              const generatedBrief = generateBrief(activeAppointment, data);
              setBrief(generatedBrief);
              setSessionState("complete");
              setAppointments((prev) =>
                prev.map((a) => (a.id === activeAppointment.id ? { ...a, status: "completed" } : a))
              );
              setActiveAppointment((prev) => (prev ? { ...prev, status: "completed" } : null));
            }
          } catch (err) {
            console.error("Polling error:", err);
          }
        }, 5000); // Poll every 5 seconds
      } else {
        // No session guid — fallback to simulated brief
        setTimeout(() => {
          const generatedBrief = generateBrief(activeAppointment, data);
          setBrief(generatedBrief);
          setSessionState("complete");
          setAppointments((prev) =>
            prev.map((a) => (a.id === activeAppointment.id ? { ...a, status: "completed" } : a))
          );
          setActiveAppointment((prev) => (prev ? { ...prev, status: "completed" } : null));
        }, 2800);
      }
    },
    [activeAppointment, stopRecording, sessionGuid, pollTranscript]
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
                AI Processing
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
            "flex w-[220px] shrink-0 flex-col border-r border-border/60 bg-background",
            "transition-all"
          )}
        >
          <AmbientScheduler
            appointments={appointments}
            onSelectAppointment={handleSelectAppointment}
            activeAppointmentId={activeAppointment?.id ?? null}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Column 2 — Session Panel */}
        <div className="flex flex-1 min-w-0 flex-col border-r border-border/60 bg-background">
          <AmbientSessionPanel
            appointment={activeAppointment}
            sessionState={sessionState}
            onStart={handleStartSession}
            onEnd={handleEndSession}
            sessionData={sessionData}
            onSessionDataChange={setSessionData}
          />
        </div>

        {/* Column 3 — AI Brief */}
        <div className="flex w-[340px] shrink-0 flex-col bg-background">
          <AmbientBrief
            sessionState={sessionState}
            brief={brief}
            appointment={activeAppointment}
            sessionData={sessionData}
          />
        </div>
      </div>
    </div>
  );
}
