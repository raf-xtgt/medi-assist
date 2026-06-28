"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  History,
  Calendar,
  Pill,
  FileText,
  Stethoscope,
  Phone,
  User,
  CheckCircle2,
} from "lucide-react";
import type { PatientHistoryResponse } from "@/lib/api/model/patient-history.model";

interface PatientHistoryTimelineSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: PatientHistoryResponse | null;
  isLoading?: boolean;
}

export function PatientHistoryTimelineSheet({
  open,
  onOpenChange,
  history,
  isLoading = false,
}: PatientHistoryTimelineSheetProps) {
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "Unknown Date";
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[450px] sm:w-[540px] p-0 flex flex-col bg-background">
        <SheetHeader className="px-6 py-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]">
              <History size={16} />
            </div>
            <div>
              <SheetTitle className="text-base font-bold tracking-tight">
                Patient History Timeline
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Per-appointment clinical review & archived records
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-muted-foreground">
              <div className="size-6 rounded-full border-2 border-[var(--color-brand-teal)] border-t-transparent animate-spin" />
              <p className="text-xs">Loading medical history records...</p>
            </div>
          ) : !history ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No patient history records selected.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Patient Overview Header */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-[var(--color-brand-teal)]" />
                    <span className="font-semibold text-sm text-foreground">
                      {history.patient_name || "Patient Profile"}
                    </span>
                  </div>
                  {history.patient_phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      <Phone size={11} />
                      <span>{history.patient_phone}</span>
                    </div>
                  )}
                </div>

                {history.patient_triage_summary && (
                  <div className="rounded-lg bg-[var(--color-brand-teal-light)]/60 border border-[var(--color-brand-teal)]/20 p-3 text-xs text-foreground/90 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-[var(--color-brand-teal)]">
                      <Stethoscope size={12} />
                      <span>Pre-visit Triage Summary</span>
                    </div>
                    <p className="leading-relaxed">{history.patient_triage_summary}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="text-xs bg-muted/40 font-semibold px-2.5 py-0.5">
                  {history.history_timeline.length} Completed Visit{history.history_timeline.length !== 1 ? "s" : ""}
                </Badge>
                <Separator className="flex-1" />
              </div>

              {/* Timeline List */}
              {history.history_timeline.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  No previous completed appointments recorded.
                </div>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                  {history.history_timeline.map((record, idx) => (
                    <div key={record.appointment_guid || idx} className="relative group">
                      {/* Timeline Node Icon */}
                      <div className="absolute -left-6 top-1.5 size-5 rounded-full bg-[var(--color-brand-teal-light)] border-2 border-[var(--color-brand-teal)] flex items-center justify-center">
                        <CheckCircle2 size={10} className="text-[var(--color-brand-teal)]" />
                      </div>

                      {/* Record Card */}
                      <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm hover:shadow-md transition-shadow space-y-3">
                        <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                            <Calendar size={13} className="text-muted-foreground" />
                            <span>{formatDate(record.scheduled_start)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {record.running_no && (
                              <span className="text-[10px] font-mono bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                #{record.running_no}
                              </span>
                            )}
                            <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 border-0 text-[10px] uppercase font-bold px-1.5 py-0">
                              Completed
                            </Badge>
                          </div>
                        </div>

                        {/* Chief Complaint / Notes */}
                        {record.appointment_note?.main_complaint && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                              Chief Complaint
                            </span>
                            <p className="text-xs font-medium text-foreground bg-muted/30 p-2 rounded-md border border-border/40">
                              {record.appointment_note.main_complaint}
                            </p>
                          </div>
                        )}

                        {/* Prescriptions */}
                        {record.prescriptions && record.prescriptions.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              <Pill size={11} className="text-amber-600" />
                              <span>Prescriptions ({record.prescriptions.length})</span>
                            </div>
                            <div className="grid gap-1.5">
                              {record.prescriptions.map((rx, rIdx) => (
                                <div
                                  key={rx.guid || rIdx}
                                  className="flex items-center justify-between bg-amber-500/5 border border-amber-500/20 rounded-md px-2.5 py-1.5 text-xs"
                                >
                                  <span className="font-semibold text-foreground">
                                    {rx.medicine_name || "Unknown Rx"}
                                  </span>
                                  <span className="text-[11px] text-muted-foreground">
                                    {[rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(" · ")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Clinical Report Summary */}
                        {record.clinical_report?.summary && (
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              <FileText size={11} className="text-blue-600" />
                              <span>Clinical Summary</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed bg-blue-500/5 border border-blue-500/15 p-2.5 rounded-md">
                              {record.clinical_report.summary}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
