"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorAvailabilityService } from "@/lib/api/services/doctor-availability-service";
import type { DoctorAvailabilityResponse } from "@/lib/api/model/doctor-availability.model";

/* ─── Constants ─────────────────────────────────────────────── */
const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

const SLOT_DURATIONS = [15, 20, 30, 45, 60];

/** Generate time options from 00:00 to 23:30 in 30-min steps */
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      options.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

/** Format "09:00" → "9:00 AM" */
function formatTime(t: string): string {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

/* ─── Types ─────────────────────────────────────────────────── */
interface DaySchedule {
  active: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
  /** The existing DB guid for this row, if loaded from backend */
  existingGuid?: string;
}

interface DoctorAvailabilityEditorProps {
  doctorGuid: string;
  disabled?: boolean;
  /** Called when schedule is saved successfully */
  onSaved?: () => void;
}

/* ─── Component ─────────────────────────────────────────────── */
export function DoctorAvailabilityEditor({
  doctorGuid,
  disabled = false,
  onSaved,
}: DoctorAvailabilityEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default hours for the "Apply to all weekdays" action
  const [defaultStart, setDefaultStart] = useState("09:00");
  const [defaultEnd, setDefaultEnd] = useState("17:00");
  const [defaultSlot, setDefaultSlot] = useState(30);

  // Per-day schedules
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const initial: Record<string, DaySchedule> = {};
    for (const day of DAYS_OF_WEEK) {
      initial[day] = {
        active: false,
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
      };
    }
    return initial;
  });

  // Load existing availability from backend
  const loadExisting = useCallback(async () => {
    setLoading(true);
    try {
      const rows: DoctorAvailabilityResponse[] =
        await doctorAvailabilityService.getByDoctorGuid(doctorGuid);

      if (rows.length > 0) {
        setSchedule((prev) => {
          const updated = { ...prev };
          for (const row of rows) {
            if (row.day_of_week && row.day_of_week in updated) {
              updated[row.day_of_week] = {
                active: row.status === "active",
                startTime: row.start_time?.slice(0, 5) ?? "09:00",
                endTime: row.end_time?.slice(0, 5) ?? "17:00",
                slotDuration: row.slot_duration_minutes ?? 30,
                existingGuid: row.guid,
              };
            }
          }
          return updated;
        });
      }
    } catch {
      // Silently fail — fresh schedule will be used
    } finally {
      setLoading(false);
    }
  }, [doctorGuid]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  // Update a single day's field
  const updateDay = (day: string, field: keyof DaySchedule, value: unknown) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // Apply defaults to Mon–Fri
  const applyToWeekdays = () => {
    setSchedule((prev) => {
      const updated = { ...prev };
      for (const day of ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]) {
        updated[day] = {
          ...updated[day],
          active: true,
          startTime: defaultStart,
          endTime: defaultEnd,
          slotDuration: defaultSlot,
        };
      }
      return updated;
    });
  };

  // Save all availability
  const handleSave = async () => {
    setSaving(true);
    try {
      const toCreate: Array<{
        doctor_guid: string;
        day_of_week: string;
        start_time: string;
        end_time: string;
        slot_duration_minutes: number;
        status: string;
      }> = [];

      const toUpdate: Array<{
        guid: string;
        day_of_week: string;
        start_time: string;
        end_time: string;
        slot_duration_minutes: number;
        status: string;
      }> = [];

      for (const day of DAYS_OF_WEEK) {
        const s = schedule[day];
        const payload = {
          day_of_week: day,
          start_time: s.active ? s.startTime : "09:00",
          end_time: s.active ? s.endTime : "17:00",
          slot_duration_minutes: s.active ? s.slotDuration : 30,
          status: s.active ? "active" : "inactive",
        };

        if (s.existingGuid) {
          toUpdate.push({ guid: s.existingGuid, ...payload });
        } else {
          toCreate.push({ doctor_guid: doctorGuid, ...payload });
        }
      }

      // Execute bulk ops
      if (toCreate.length > 0) {
        await doctorAvailabilityService.multiCreate(toCreate);
      }
      if (toUpdate.length > 0) {
        await doctorAvailabilityService.multiUpdate(toUpdate);
      }

      toast.success("Schedule saved successfully.");
      // Reload to get guids for newly created rows
      await loadExisting();
      onSaved?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save schedule.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin text-muted-foreground" aria-hidden="true" />
        <span className="ml-2 text-sm text-muted-foreground">Loading schedule…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-muted-foreground" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-foreground">Weekly Schedule</h4>
      </div>

      {/* Default hours + apply action */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs font-medium text-muted-foreground mb-2">Quick Setup</p>
        <div className="flex items-end gap-2 flex-wrap">
          {/* Default start */}
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] text-muted-foreground">Start</Label>
            <Select value={defaultStart} onValueChange={setDefaultStart} disabled={disabled}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {formatTime(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default end */}
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] text-muted-foreground">End</Label>
            <Select value={defaultEnd} onValueChange={setDefaultEnd} disabled={disabled}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">
                    {formatTime(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Default slot duration */}
          <div className="flex flex-col gap-1">
            <Label className="text-[11px] text-muted-foreground">Slot</Label>
            <Select
              value={String(defaultSlot)}
              onValueChange={(v) => setDefaultSlot(Number(v))}
              disabled={disabled}
            >
              <SelectTrigger className="w-[72px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SLOT_DURATIONS.map((d) => (
                  <SelectItem key={d} value={String(d)} className="text-xs">
                    {d} min
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={applyToWeekdays}
            disabled={disabled}
          >
            Apply to Mon–Fri
          </Button>
        </div>
      </div>

      {/* Day-by-day grid */}
      <div className="flex flex-col gap-1.5">
        {DAYS_OF_WEEK.map((day) => {
          const s = schedule[day];
          return (
            <div
              key={day}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
                s.active
                  ? "border-border bg-card"
                  : "border-transparent bg-muted/20"
              }`}
            >
              {/* Day label + toggle */}
              <div className="flex items-center gap-2 w-[72px] shrink-0">
                <Switch
                  checked={s.active}
                  onCheckedChange={(v) => updateDay(day, "active", v)}
                  disabled={disabled}
                  aria-label={`Toggle ${day}`}
                />
                <span
                  className={`text-xs font-medium ${
                    s.active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {DAY_SHORT[day]}
                </span>
              </div>

              {/* Time selects — only show when active */}
              {s.active ? (
                <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                  <Select
                    value={s.startTime}
                    onValueChange={(v) => updateDay(day, "startTime", v)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-[105px] h-7 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {formatTime(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-[10px] text-muted-foreground">→</span>

                  <Select
                    value={s.endTime}
                    onValueChange={(v) => updateDay(day, "endTime", v)}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-[105px] h-7 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t} className="text-xs">
                          {formatTime(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={String(s.slotDuration)}
                    onValueChange={(v) => updateDay(day, "slotDuration", Number(v))}
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-[68px] h-7 text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SLOT_DURATIONS.map((d) => (
                        <SelectItem key={d} value={String(d)} className="text-xs">
                          {d} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground/50 italic">
                  Not available
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 px-1">
        <Info size={13} className="text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          This sets the doctor&apos;s recurring weekly schedule. Patients will see available
          appointment slots based on these hours.
        </p>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={disabled || saving}
        className="w-full"
        size="sm"
      >
        {saving ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" aria-hidden="true" />
            Saving schedule…
          </>
        ) : (
          "Save Schedule"
        )}
      </Button>
    </div>
  );
}
