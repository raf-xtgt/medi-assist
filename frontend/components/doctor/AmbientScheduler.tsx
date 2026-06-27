"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarClock,
  ChevronDown,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Stethoscope,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  reason: string;
  time: string;
  durationMin: number;
  status: "upcoming" | "in-progress" | "completed" | "cancelled" | "rescheduled";
  /** AI-generated triage summary from the patient's pre-visit chat */
  triageSummary?: string;
  /** Backend patient GUID */
  patientGuid?: string;
  /** Backend appointment GUID */
  appointmentGuid?: string;
  /** Sequential appointment number e.g. "1034" */
  runningNo?: string;
  /** ISO datetime string for appointment start */
  scheduledStart?: string;
  /** ISO datetime string for appointment end */
  scheduledEnd?: string;
}


interface AmbientSchedulerProps {
  appointments: Appointment[];
  onSelectAppointment: (appt: Appointment) => void;
  activeAppointmentId?: string | null;
  onStatusChange: (id: string, status: Appointment["status"]) => void;
  /** Show skeleton placeholder rows while the API fetch is in progress */
  isLoading?: boolean;
}

const statusConfig: Record<
  Appointment["status"],
  { label: string; className: string; dot: string }
> = {
  upcoming:    { label: "Upcoming",     className: "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] border-[var(--color-brand-teal)]/20",  dot: "bg-[var(--color-brand-teal)]" },
  "in-progress": { label: "In Progress", className: "bg-emerald-50 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500 animate-pulse" },
  completed:   { label: "Completed",    className: "bg-slate-100 text-slate-500 border-slate-200",        dot: "bg-slate-400" },
  cancelled:   { label: "Cancelled",    className: "bg-red-50 text-red-600 border-red-200",               dot: "bg-red-500" },
  rescheduled: { label: "Rescheduled",  className: "bg-amber-50 text-amber-700 border-amber-200",         dot: "bg-amber-500" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function AmbientScheduler({
  appointments,
  onSelectAppointment,
  activeAppointmentId,
  onStatusChange,
  isLoading = false,
}: AmbientSchedulerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const remaining = appointments.filter(
    (a) => a.status === "upcoming" || a.status === "in-progress"
  ).length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarClock size={15} className="text-[var(--color-brand-teal)]" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Today&apos;s Schedule
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">{dateLabel}</span>
          {remaining > 0 && (
            <Badge className="border-0 bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] text-[10px] px-1.5 py-0">
              {remaining} left
            </Badge>
          )}
        </div>
      </div>

      {/* Timeline slots */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="px-3 py-2 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-2 py-2.5">
                <div className="flex w-12 shrink-0 flex-col gap-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-2.5 w-6" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-2.5 w-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        <ul role="list" className="divide-y divide-border/40 px-2 py-1">
          {appointments.map((appt) => {
            const config = statusConfig[appt.status];
            const isActive = appt.id === activeAppointmentId;
            const isHovered = appt.id === hoveredId;
            const isClickable =
              appt.status === "upcoming" ||
              appt.status === "in-progress" ||
              appt.status === "completed";

            return (
              <li
                key={appt.id}
                className={cn(
                  "group relative flex items-start gap-3 rounded-lg px-2 py-2.5 transition-all",
                  isActive
                    ? "bg-[var(--color-brand-teal-light)] ring-1 ring-[var(--color-brand-teal)]/30"
                    : isHovered && isClickable
                    ? "bg-muted/50"
                    : "hover:bg-muted/30",
                  !isClickable && "opacity-60"
                )}
                onMouseEnter={() => setHoveredId(appt.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Time block */}
                <div className="flex w-12 shrink-0 flex-col items-center">
                  <span className="text-xs font-semibold tabular-nums text-foreground">
                    {appt.time}
                  </span>
                  <span className="mt-0.5 text-[10px] text-muted-foreground">
                    {appt.durationMin > 0 ? `${appt.durationMin}m` : "—"}
                  </span>
                  {appt.runningNo && (
                    <span className="mt-0.5 text-[9px] font-medium tabular-nums text-[var(--color-brand-teal)]/70">
                      #{appt.runningNo}
                    </span>
                  )}
                </div>

                {/* Left accent bar */}
                <div
                  className={cn(
                    "mt-1 h-full w-0.5 shrink-0 self-stretch rounded-full",
                    appt.status === "in-progress"
                      ? "bg-emerald-500"
                      : appt.status === "upcoming"
                      ? "bg-[var(--color-brand-teal)]"
                      : appt.status === "cancelled"
                      ? "bg-red-400"
                      : appt.status === "rescheduled"
                      ? "bg-amber-400"
                      : "bg-slate-300"
                  )}
                  aria-hidden="true"
                />

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => isClickable && onSelectAppointment(appt)}
                      disabled={!isClickable}
                      className={cn(
                        "truncate text-sm font-medium text-foreground text-left",
                        isClickable
                          ? "cursor-pointer hover:text-[var(--color-brand-teal)]"
                          : "cursor-default"
                      )}
                    >
                      {appt.patientName}
                    </button>

                    {/* Action menu */}
                    {appt.status !== "completed" && appt.status !== "cancelled" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Appointment options"
                          >
                            <MoreHorizontal size={13} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 text-xs">
                          <DropdownMenuItem
                            onClick={() => onStatusChange(appt.id, "rescheduled")}
                            className="gap-2 text-xs"
                          >
                            <RefreshCw size={12} />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onStatusChange(appt.id, "cancelled")}
                            className="gap-2 text-xs text-destructive focus:text-destructive"
                          >
                            <X size={12} />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <p className="truncate text-[11px] text-muted-foreground">
                    {appt.patientAge}y &middot; {appt.reason}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full shrink-0", config.dot)} />
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0 border h-4", config.className)}
                    >
                      {config.label}
                    </Badge>
                  </div>
                </div>

                {/* Stethoscope if active */}
                {isActive && (
                  <Stethoscope
                    size={14}
                    className="shrink-0 text-[var(--color-brand-teal)] mt-1"
                    aria-label="Currently active"
                  />
                )}
              </li>
            );
          })}
        </ul>
        )}
      </ScrollArea>

      {/* Footer summary */}
      <div className="border-t border-border/60 px-4 py-2.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {appointments.filter((a) => a.status === "completed").length} of{" "}
            {appointments.length} completed
          </span>
          <ChevronDown size={12} />
        </div>
      </div>
    </div>
  );
}
