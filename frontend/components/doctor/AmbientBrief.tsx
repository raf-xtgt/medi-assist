"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  CircleDot,
  ClipboardCheck,
  Eye,
  FileSearch,
  FlaskConical,
  Heart,
  Lightbulb,
  ListChecks,
  ShieldAlert,
  Stethoscope,
  Thermometer,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PrescriptionRow, SessionData } from "./AmbientSessionPanel";
import type { Appointment } from "./AmbientScheduler";

/* ── Types ──────────────────────────────────────────────── */
export interface AIBriefData {
  clinicalInsights: ClinicalInsight[];
  patientInstructions: PatientInstruction[];
  prescriptionVerification: PrescriptionVerification[];
  clinicalAudit?: ClinicalAudit;
}

interface ClinicalInsight {
  category: "diagnosis" | "finding" | "risk" | "lab" | "vitals";
  text: string;
  severity?: "low" | "medium" | "high";
}

interface PatientInstruction {
  icon: "medication" | "activity" | "diet" | "followup" | "warning";
  instruction: string;
}

interface PrescriptionVerification {
  rxIndex: number;
  medicine: string;
  typedDosage: string;
  aiExtracted: string;
  flag?: string;
  status: "match" | "warning" | "mismatch";
}

export interface ClinicalAudit {
  formDiscrepancies: string[];
  patientComprehensionRating: string;
}

interface AmbientBriefProps {
  sessionState: "idle" | "live" | "processing" | "complete";
  brief: AIBriefData | null;
  appointment: Appointment | null;
  sessionData: SessionData;
}

/* ── Icon map for patient instructions ─────────────────── */
const instructionIconMap: Record<PatientInstruction["icon"], React.ElementType> = {
  medication: ClipboardCheck,
  activity:   Heart,
  diet:       Stethoscope,
  followup:   Eye,
  warning:    AlertTriangle,
};

const insightIconMap: Record<ClinicalInsight["category"], React.ElementType> = {
  diagnosis: Stethoscope,
  finding:   Lightbulb,
  risk:      ShieldAlert,
  lab:       FlaskConical,
  vitals:    Thermometer,
};

const severityConfig = {
  low:    { cls: "bg-slate-100 text-slate-600 border-slate-200",    label: "Low" },
  medium: { cls: "bg-amber-50 text-amber-700 border-amber-200",     label: "Moderate" },
  high:   { cls: "bg-red-50 text-red-600 border-red-200",           label: "High" },
};

const verificationConfig = {
  match:    { icon: CheckCircle,  cls: "text-emerald-500", label: "Match",    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  warning:  { icon: AlertTriangle, cls: "text-amber-500",  label: "Review",   badgeCls: "bg-amber-50 text-amber-700 border-amber-200" },
  mismatch: { icon: XCircle,      cls: "text-red-500",     label: "Mismatch", badgeCls: "bg-red-50 text-red-600 border-red-200" },
};

/* ── Idle / empty states ────────────────────────────────── */
function EmptyState({ state }: { state: AmbientBriefProps["sessionState"] }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          state === "live"
            ? "bg-emerald-100"
            : "bg-[var(--color-brand-blue-light)]"
        )}
      >
        <Bot
          size={20}
          className={state === "live" ? "text-emerald-600" : "text-[var(--color-brand-blue)]"}
        />
      </div>
      <p className="text-sm font-medium text-foreground">
        {state === "live" ? "Recording in progress" : "AI Brief"}
      </p>
      <p className="max-w-[220px] text-xs text-muted-foreground">
        {state === "live"
          ? "The AI is listening. End the appointment to generate your clinical brief."
          : "Complete a session to generate the AI post-visit brief with clinical insights and prescription verification."}
      </p>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export function AmbientBrief({
  sessionState,
  brief,
  appointment,
  sessionData,
}: AmbientBriefProps) {
  const isReady = sessionState === "complete" && brief;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-[var(--color-brand-blue)]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            AI Post-Visit Brief
          </span>
        </div>
        {isReady && (
          <Badge className="border-0 bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)] text-[10px] gap-1">
            <CircleDot size={9} />
            Ready
          </Badge>
        )}
      </div>

      {!isReady ? (
        <EmptyState state={sessionState} />
      ) : (
        <Tabs defaultValue="insights" className="flex flex-1 flex-col overflow-hidden">
          <TabsList className="mx-3 mt-2 mb-0 grid w-auto grid-cols-4 h-8 bg-muted/60 rounded-lg shrink-0">
            <TabsTrigger value="insights" className="text-[10px] h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Lightbulb size={10} className="mr-0.5" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="instructions" className="text-[10px] h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ListChecks size={10} className="mr-0.5" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-[10px] h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileSearch size={10} className="mr-0.5" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="verification" className="text-[10px] h-full rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ShieldAlert size={10} className="mr-0.5" />
              Rx
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Clinical Insights ── */}
          <TabsContent value="insights" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="px-4 py-3 space-y-2.5">
                {brief.clinicalInsights.map((insight, i) => {
                  const Icon = insightIconMap[insight.category];
                  const sev = insight.severity ? severityConfig[insight.severity] : null;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-card p-2.5 shadow-none"
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-blue-light)]">
                        <Icon size={12} className="text-[var(--color-brand-blue)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs text-foreground leading-relaxed">{insight.text}</p>
                          {sev && (
                            <Badge
                              variant="outline"
                              className={cn("shrink-0 text-[9px] px-1.5 py-0 h-4 capitalize", sev.cls)}
                            >
                              {sev.label}
                            </Badge>
                          )}
                        </div>
                        <span className="mt-1 inline-block text-[10px] capitalize text-muted-foreground">
                          {insight.category}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Tab 2: Patient Instructions / Care Plan ── */}
          <TabsContent value="instructions" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="px-4 py-3">
                <div className="mb-3 rounded-lg border border-[var(--color-brand-teal)]/20 bg-[var(--color-brand-teal-light)] p-2.5">
                  <p className="text-[11px] text-[var(--color-brand-teal)] font-medium">
                    Zero-jargon checklist for {appointment?.patientName}
                  </p>
                </div>
                <ul role="list" className="space-y-2">
                  {brief.patientInstructions.map((item, i) => {
                    const Icon = instructionIconMap[item.icon];
                    return (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-card p-2.5"
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)]">
                          <Icon size={12} className="text-[var(--color-brand-teal)]" />
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{item.instruction}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Tab 3: Clinical Audit ── */}
          <TabsContent value="audit" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="px-4 py-3 space-y-4">
                {brief.clinicalAudit ? (
                  <>
                    {/* Form Discrepancies */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <FileSearch size={12} className="text-[var(--color-brand-blue)]" />
                        <span className="text-[11px] font-semibold text-foreground">
                          Form vs. Conversation Discrepancies
                        </span>
                      </div>
                      {brief.clinicalAudit.formDiscrepancies.length > 0 ? (
                        <div className="space-y-1.5">
                          {brief.clinicalAudit.formDiscrepancies.map((discrepancy, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5"
                            >
                              <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-500" />
                              <p className="text-xs text-amber-800 leading-relaxed">{discrepancy}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                          <CheckCircle size={12} className="shrink-0 text-emerald-500" />
                          <p className="text-xs text-emerald-700">
                            No discrepancies found between verbal discussion and form data.
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Patient Comprehension */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Eye size={12} className="text-[var(--color-brand-blue)]" />
                        <span className="text-[11px] font-semibold text-foreground">
                          Patient Comprehension
                        </span>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-card p-3">
                        <p className="text-xs text-foreground leading-relaxed">
                          {brief.clinicalAudit.patientComprehensionRating || "Not assessed"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-center">
                    <FileSearch size={18} className="text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Clinical audit data not available for this session.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Tab 4: Prescription Verification ── */}
          <TabsContent value="verification" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="px-4 py-3 space-y-3">
                <div className="text-[11px] text-muted-foreground">
                  Comparing your typed prescriptions against AI-extracted conversation context.
                </div>

                {brief.prescriptionVerification.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border/60 py-6 text-center">
                    <p className="text-xs text-muted-foreground">No prescriptions to verify.</p>
                  </div>
                ) : (
                  brief.prescriptionVerification.map((rx) => {
                    const config = verificationConfig[rx.status];
                    const StatusIcon = config.icon;
                    return (
                      <div
                        key={rx.rxIndex}
                        className={cn(
                          "rounded-lg border bg-card overflow-hidden shadow-none",
                          rx.status === "warning"
                            ? "border-amber-200"
                            : rx.status === "mismatch"
                            ? "border-red-200"
                            : "border-border/50"
                        )}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-3 py-2 border-b border-inherit bg-muted/30">
                          <div className="flex items-center gap-1.5">
                            <StatusIcon size={13} className={config.cls} />
                            <span className="text-xs font-semibold text-foreground">
                              Rx {rx.rxIndex + 1} — {rx.medicine || "Unnamed"}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-[10px] px-1.5 py-0 h-4", config.badgeCls)}
                          >
                            {config.label}
                          </Badge>
                        </div>

                        {/* Split comparison */}
                        <div className="grid grid-cols-2 divide-x divide-border/50">
                          <div className="p-2.5 space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Typed
                            </p>
                            <p className="text-xs text-foreground">{rx.typedDosage || "—"}</p>
                          </div>
                          <div className="p-2.5 space-y-1">
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                              AI Extracted
                            </p>
                            <p className="text-xs text-foreground">{rx.aiExtracted || "—"}</p>
                          </div>
                        </div>

                        {/* Flag */}
                        {rx.flag && (
                          <>
                            <Separator />
                            <div className="flex items-start gap-2 px-3 py-2 bg-amber-50">
                              <AlertTriangle size={11} className="mt-0.5 shrink-0 text-amber-500" />
                              <p className="text-[11px] text-amber-700">{rx.flag}</p>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
