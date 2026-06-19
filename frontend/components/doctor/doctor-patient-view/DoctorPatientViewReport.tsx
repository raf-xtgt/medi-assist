"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { doctorService } from "@/lib/api/services";
import type { DoctorPatientListItem, PatientReport, PatientAppointmentDetail } from "@/lib/api/model/doctor.model";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Heart,
  MessageSquare,
  Pill,
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
                      <div className="rounded-md bg-muted/30 p-3 text-sm text-foreground">
                        <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground mb-1">
                          Chief Complaint / Notes
                        </p>
                        <p>{selectedAppointment.appointment_note}</p>
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
                {/* Insights from transcript metadata */}
                {selectedAppointment.appointment_session_transcript_metadata ? (
                  <div className="space-y-3">
                    {(() => {
                      const meta = selectedAppointment.appointment_session_transcript_metadata as Record<string, unknown>;
                      const clinicalSummary = meta?.clinical_summary as Record<string, string> | undefined;

                      if (!clinicalSummary) return null;

                      return (
                        <>
                          {clinicalSummary.chief_complaint && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                                Chief Complaint
                              </p>
                              <p className="text-sm text-foreground">{clinicalSummary.chief_complaint}</p>
                            </div>
                          )}
                          {clinicalSummary.diagnosis && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                                Diagnosis
                              </p>
                              <p className="text-sm text-foreground">{clinicalSummary.diagnosis}</p>
                            </div>
                          )}
                          {clinicalSummary.treatment_plan && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                                Treatment Plan
                              </p>
                              <p className="text-sm text-foreground">{clinicalSummary.treatment_plan}</p>
                            </div>
                          )}
                          {clinicalSummary.follow_up_instructions && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                                  Follow-up Instructions
                                </p>
                                <p className="text-sm text-foreground">{clinicalSummary.follow_up_instructions}</p>
                              </div>
                            </>
                          )}
                          {clinicalSummary.patient_friendly_summary && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                                  Patient SMS
                                </p>
                                <div className="rounded-md bg-muted/40 p-2.5 text-xs text-foreground italic">
                                  &ldquo;{clinicalSummary.patient_friendly_summary}&rdquo;
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      );
                    })()}
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
