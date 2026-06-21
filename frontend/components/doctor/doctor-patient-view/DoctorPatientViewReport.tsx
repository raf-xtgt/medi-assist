"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { doctorService } from "@/lib/api/services";
import { clinicalReportService, type ClinicalReportResponse } from "@/lib/api/services/clinical-report-service";
import type { DoctorPatientListItem, PatientReport, PatientAppointmentDetail } from "@/lib/api/model/doctor.model";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Eye,
  FileSearch,
  FileText,
  Heart,
  Lightbulb,
  MessageSquare,
  Pill,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DoctorPatientViewReportProps {
  patient: DoctorPatientListItem;
  onBack: () => void;
}

export function DoctorPatientViewReport({ patient, onBack }: DoctorPatientViewReportProps) {
  const [report, setReport] = useState<PatientReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<PatientAppointmentDetail | null>(null);
  const [clinicalReport, setClinicalReport] = useState<ClinicalReportResponse | null>(null);
  const [clinicalReportLoading, setClinicalReportLoading] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        const data = await doctorService.getPatientReport({
          patient_guid: patient.patient_guid,
        });
        setReport(data);
        if (data.appointment_detail_list.length > 0) {
          setSelectedAppointment(data.appointment_detail_list[0]);
        }
      } catch (err) {
        console.error("Failed to load patient report:", err);
        setError("Failed to load patient report. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, [patient.patient_guid]);

  // Fetch clinical report when selected appointment changes
  useEffect(() => {
    async function fetchClinicalReport() {
      if (!selectedAppointment?.appointment_session_guid) {
        setClinicalReport(null);
        return;
      }
      setClinicalReportLoading(true);
      try {
        const reports = await clinicalReportService.getBySession(selectedAppointment.appointment_session_guid);
        setClinicalReport(reports.length > 0 ? reports[0] : null);
      } catch (err) {
        console.error("Failed to fetch clinical report:", err);
        setClinicalReport(null);
      } finally {
        setClinicalReportLoading(false);
      }
    }
    fetchClinicalReport();
  }, [selectedAppointment]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft size={14} />
          Back to Patients
        </Button>
        <Card className="shadow-none border-border/60">
          <CardContent className="py-8 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="size-9" aria-label="Back to patients">
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground">{patient.patient_name}</h2>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs gap-1">
          <Calendar size={11} aria-hidden="true" />
          {report?.total_appointment_sessions ?? 0} session{(report?.total_appointment_sessions ?? 0) !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Appointment selector (if multiple) */}
      {report && report.appointment_detail_list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {report.appointment_detail_list.map((appt, idx) => (
            <Button
              key={appt.appointment_guid ?? idx}
              variant={selectedAppointment === appt ? "default" : "outline"}
              size="sm"
              className={cn(
                "shrink-0 text-xs h-7",
                selectedAppointment === appt && "bg-[var(--color-brand-teal)] text-white hover:bg-[var(--color-brand-teal-dark)]"
              )}
              onClick={() => setSelectedAppointment(appt)}
            >
              {appt.appointment_start_time
                ? new Date(appt.appointment_start_time).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                : `Visit ${idx + 1}`}
            </Button>
          ))}
        </div>
      )}

      {/* Dual-pane layout */}
      {selectedAppointment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* LEFT PANE: What Happened */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-none border-border/60">
              <Tabs defaultValue="vitals" className="w-full">
                <CardHeader className="pb-0">
                  <TabsList className="h-8">
                    <TabsTrigger value="vitals" className="text-xs h-7 gap-1">
                      <Heart size={12} aria-hidden="true" />
                      Vitals &amp; Notes
                    </TabsTrigger>
                    <TabsTrigger value="transcript" className="text-xs h-7 gap-1">
                      <FileText size={12} aria-hidden="true" />
                      Transcript
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-4">
                  <TabsContent value="transcript" className="mt-0">
                    {selectedAppointment.appointment_session_transcript ? (
                      <div className="max-h-[400px] overflow-y-auto rounded-md bg-muted/30 p-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                        {selectedAppointment.appointment_session_transcript}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <FileText size={24} className="text-muted-foreground/50 mb-2" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">No transcript available</p>
                      </div>
                    )}

                    {selectedAppointment.appointment_session_transcript_status && (
                      <div className="mt-2">
                        <Badge variant="secondary" className="text-[10px]">
                          Transcription: {selectedAppointment.appointment_session_transcript_status}
                        </Badge>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="vitals" className="mt-0">
                    {selectedAppointment.appointment_note ? (
                      <div className="space-y-3">
                        {/* Chief Complaint */}
                        {selectedAppointment.appointment_note.main_complaint && (
                          <div className="rounded-md bg-muted/30 p-3">
                            <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">
                              Chief Complaint
                            </p>
                            <p className="text-sm text-foreground">{selectedAppointment.appointment_note.main_complaint}</p>
                          </div>
                        )}

                        {/* Vitals grid */}
                        <div className="grid grid-cols-3 gap-2">
                          {selectedAppointment.appointment_note.blood_pressure && (
                            <div className="rounded-md border border-border/60 p-2 text-center">
                              <p className="text-[10px] text-muted-foreground">BP</p>
                              <p className="text-sm font-semibold text-foreground">{selectedAppointment.appointment_note.blood_pressure}</p>
                            </div>
                          )}
                          {selectedAppointment.appointment_note.heart_rate != null && (
                            <div className="rounded-md border border-border/60 p-2 text-center">
                              <p className="text-[10px] text-muted-foreground">HR</p>
                              <p className="text-sm font-semibold text-foreground">{selectedAppointment.appointment_note.heart_rate} bpm</p>
                            </div>
                          )}
                          {selectedAppointment.appointment_note.temperature != null && (
                            <div className="rounded-md border border-border/60 p-2 text-center">
                              <p className="text-[10px] text-muted-foreground">Temp</p>
                              <p className="text-sm font-semibold text-foreground">{selectedAppointment.appointment_note.temperature}°C</p>
                            </div>
                          )}
                          {selectedAppointment.appointment_note.oxygen_saturation != null && (
                            <div className="rounded-md border border-border/60 p-2 text-center">
                              <p className="text-[10px] text-muted-foreground">SpO₂</p>
                              <p className="text-sm font-semibold text-foreground">{selectedAppointment.appointment_note.oxygen_saturation}%</p>
                            </div>
                          )}
                          {selectedAppointment.appointment_note.respiratory_rate != null && (
                            <div className="rounded-md border border-border/60 p-2 text-center">
                              <p className="text-[10px] text-muted-foreground">RR</p>
                              <p className="text-sm font-semibold text-foreground">{selectedAppointment.appointment_note.respiratory_rate} /min</p>
                            </div>
                          )}
                          {selectedAppointment.appointment_note.weight != null && (
                            <div className="rounded-md border border-border/60 p-2 text-center">
                              <p className="text-[10px] text-muted-foreground">Weight</p>
                              <p className="text-sm font-semibold text-foreground">{selectedAppointment.appointment_note.weight} kg</p>
                            </div>
                          )}
                        </div>

                        {/* Additional remarks */}
                        {selectedAppointment.appointment_note.additional_remarks && (
                          <div className="rounded-md bg-muted/30 p-3">
                            <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">
                              Additional Remarks
                            </p>
                            <p className="text-sm text-foreground">{selectedAppointment.appointment_note.additional_remarks}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <Stethoscope size={24} className="text-muted-foreground/50 mb-2" aria-hidden="true" />
                        <p className="text-sm text-muted-foreground">No vitals or notes recorded</p>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>

            {/* Prescription Card */}
            <Card className="shadow-none border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Pill size={14} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
                  Prescription
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAppointment.appointment_prescription_medicine_name ? (
                  <div className="rounded-md border border-border/60 p-3">
                    <div className="grid grid-cols-4 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">Medicine</p>
                        <p className="font-medium text-foreground">
                          {selectedAppointment.appointment_prescription_medicine_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Dosage</p>
                        <p className="font-medium text-foreground">
                          {selectedAppointment.appointment_prescription_dosage || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Frequency</p>
                        <p className="font-medium text-foreground">
                          {selectedAppointment.appointment_prescription_frequency || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Duration</p>
                        <p className="font-medium text-foreground">
                          {selectedAppointment.appointment_prescription_duration || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground py-2">No prescription for this visit.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANE: AI Post-Visit Brief */}
          <div className="space-y-4">
            <Card className="shadow-none border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
                  AI Post-Visit Brief
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {clinicalReportLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : clinicalReport ? (
                  <div className="space-y-4">
                    {/* Clinical Summary */}
                    {clinicalReport.summary && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Stethoscope size={12} className="text-[var(--color-brand-blue)]" aria-hidden="true" />
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Summary
                          </p>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{clinicalReport.summary}</p>
                      </div>
                    )}

                    {/* Key Observations */}
                    {clinicalReport.key_observations && clinicalReport.key_observations.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Lightbulb size={12} className="text-[var(--color-brand-blue)]" aria-hidden="true" />
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Key Observations
                          </p>
                        </div>
                        <ul className="space-y-1">
                          {clinicalReport.key_observations.map((obs, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--color-brand-blue)]" />
                              {obs}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Red Flags */}
                    {clinicalReport.red_flags && clinicalReport.red_flags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <ShieldAlert size={12} className="text-red-500" aria-hidden="true" />
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-red-600">
                            Red Flags
                          </p>
                        </div>
                        <div className="space-y-1">
                          {clinicalReport.red_flags.map((flag, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-2">
                              <AlertTriangle size={11} className="mt-0.5 shrink-0 text-red-500" aria-hidden="true" />
                              <p className="text-xs text-red-800">{flag}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Patient Instructions */}
                    {((clinicalReport.lifestyle_and_diet && clinicalReport.lifestyle_and_diet.length > 0) ||
                      (clinicalReport.care_plan_steps && clinicalReport.care_plan_steps.length > 0)) && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Heart size={12} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Patient Instructions
                          </p>
                        </div>
                        <ul className="space-y-1">
                          {clinicalReport.lifestyle_and_diet?.map((item, i) => (
                            <li key={`diet-${i}`} className="flex items-start gap-2 text-xs text-foreground">
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--color-brand-teal)]" />
                              {item}
                            </li>
                          ))}
                          {clinicalReport.care_plan_steps?.map((step, i) => (
                            <li key={`care-${i}`} className="flex items-start gap-2 text-xs text-foreground">
                              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[var(--color-brand-teal)]" />
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Separator />

                    {/* Clinical Audit */}
                    {(clinicalReport.form_discrepancies?.length || clinicalReport.patient_comprehension_rating) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <FileSearch size={12} className="text-[var(--color-brand-blue)]" aria-hidden="true" />
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Clinical Audit
                          </p>
                        </div>

                        {clinicalReport.form_discrepancies && clinicalReport.form_discrepancies.length > 0 ? (
                          <div className="space-y-1">
                            {clinicalReport.form_discrepancies.map((d, i) => (
                              <div key={i} className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2">
                                <AlertTriangle size={11} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
                                <p className="text-xs text-amber-800">{d}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2">
                            <CheckCircle size={11} className="shrink-0 text-emerald-500" aria-hidden="true" />
                            <p className="text-xs text-emerald-700">No discrepancies found.</p>
                          </div>
                        )}

                        {clinicalReport.patient_comprehension_rating && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-1">
                              <Eye size={11} className="text-[var(--color-brand-blue)]" aria-hidden="true" />
                              <p className="text-[10px] font-medium text-muted-foreground">Comprehension</p>
                            </div>
                            <p className="text-xs text-foreground">{clinicalReport.patient_comprehension_rating}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Generated by badge */}
                    {clinicalReport.generated_by && (
                      <div className="pt-1">
                        <Badge variant="secondary" className="text-[10px]">
                          Generated by {clinicalReport.generated_by}
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <MessageSquare size={20} className="text-muted-foreground/50 mb-2" aria-hidden="true" />
                    <p className="text-xs text-muted-foreground">
                      AI brief will appear here after transcript processing.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="shadow-none border-border/60">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <Calendar size={24} className="text-muted-foreground/50" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">No appointment records found for this patient.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
