"use client";

import { useState, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Palmtree,
  Plus,
  Clock,
  Trash2,
  Calendar,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 07:00 – 18:00

type ShiftType = "morning" | "afternoon" | "full" | "vacation" | "buffer";

interface ShiftBlock {
  id:      string;
  day:     number;
  startH:  number;
  endH:    number;
  type:    ShiftType;
  doctor:  string;
}

const SHIFT_COLORS: Record<ShiftType, string> = {
  morning:   "bg-blue-100 border-blue-300 text-blue-800",
  afternoon: "bg-teal-100 border-teal-300 text-teal-800",
  full:      "bg-violet-100 border-violet-300 text-violet-800",
  vacation:  "bg-amber-100 border-amber-300 text-amber-800",
  buffer:    "bg-slate-100 border-slate-300 text-slate-600",
};

const DOCTORS = ["Dr. Marcus Tan", "Dr. Priya Nair", "Dr. Aisha Kamara", "Dr. David Wu"];

const INITIAL_SHIFTS: ShiftBlock[] = [
  { id: "s1", day: 0, startH: 7,  endH: 12, type: "morning",   doctor: "Dr. Marcus Tan"   },
  { id: "s2", day: 0, startH: 13, endH: 18, type: "afternoon", doctor: "Dr. Priya Nair"   },
  { id: "s3", day: 1, startH: 7,  endH: 18, type: "full",      doctor: "Dr. Aisha Kamara" },
  { id: "s4", day: 2, startH: 7,  endH: 12, type: "morning",   doctor: "Dr. Marcus Tan"   },
  { id: "s5", day: 3, startH: 9,  endH: 14, type: "buffer",    doctor: "Dr. David Wu"     },
  { id: "s6", day: 4, startH: 7,  endH: 18, type: "vacation",  doctor: "Dr. Priya Nair"   },
  { id: "s7", day: 5, startH: 7,  endH: 12, type: "morning",   doctor: "Dr. David Wu"     },
];

// Week offset — in a real app this would compute actual dates
function getWeekLabel(offset: number) {
  const base = new Date();
  base.setDate(base.getDate() - base.getDay() + 1 + offset * 7);
  const end = new Date(base);
  end.setDate(base.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(base)} – ${fmt(end)}`;
}

interface ShiftPopoverFormProps {
  day:      number;
  hour:     number;
  onAdd:    (shift: Omit<ShiftBlock, "id">) => void;
  onClose:  () => void;
}

function ShiftPopoverForm({ day, hour, onAdd, onClose }: ShiftPopoverFormProps) {
  const [type,   setType]   = useState<ShiftType>("morning");
  const [doctor, setDoctor] = useState(DOCTORS[0]);
  const [startH, setStartH] = useState(hour);
  const [endH,   setEndH]   = useState(Math.min(hour + 4, 18));

  return (
    <div className="flex flex-col gap-3 w-64">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Add Shift Block</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
          <X size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">Doctor</label>
        <select
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          className="h-8 rounded-md border border-input bg-background text-sm px-2 focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {DOCTORS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-muted-foreground font-medium">Start</label>
          <select
            value={startH}
            onChange={(e) => setStartH(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-background text-sm px-2 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {HOURS.map((h) => <option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs text-muted-foreground font-medium">End</label>
          <select
            value={endH}
            onChange={(e) => setEndH(Number(e.target.value))}
            className="h-8 rounded-md border border-input bg-background text-sm px-2 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {HOURS.filter((h) => h > startH).map((h) => <option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground font-medium">Type</label>
        <div className="flex flex-wrap gap-1">
          {(["morning","afternoon","full","vacation","buffer"] as ShiftType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium capitalize border transition-colors",
                type === t
                  ? SHIFT_COLORS[t] + " ring-1 ring-offset-1 ring-current"
                  : "border-border text-muted-foreground hover:bg-muted"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Button
        size="sm"
        className="w-full h-8 text-xs mt-1"
        onClick={() => { onAdd({ day, startH, endH, type, doctor }); onClose(); }}
      >
        Add Block
      </Button>
    </div>
  );
}

export function AvailabilityEngine() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [shifts, setShifts]         = useState<ShiftBlock[]>(INITIAL_SHIFTS);
  const [bufferToggle, setBuffer]   = useState(false);
  const [popoverCell, setPopoverCell] = useState<{ day: number; hour: number } | null>(null);

  // Drag state
  const dragging   = useRef<string | null>(null);
  const dragTarget = useRef<{ day: number; hour: number } | null>(null);

  function addShift(shift: Omit<ShiftBlock, "id">) {
    setShifts((prev) => [...prev, { ...shift, id: `s${Date.now()}` }]);
  }

  function removeShift(id: string) {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  }

  function handleDragStart(id: string) {
    dragging.current = id;
  }

  function handleDrop(day: number, hour: number) {
    if (!dragging.current) return;
    const shift = shifts.find((s) => s.id === dragging.current);
    if (!shift) return;
    const duration = shift.endH - shift.startH;
    const newEnd = Math.min(hour + duration, 19);
    setShifts((prev) =>
      prev.map((s) =>
        s.id === dragging.current
          ? { ...s, day, startH: hour, endH: newEnd }
          : s
      )
    );
    dragging.current = null;
  }

  const HOUR_HEIGHT = 44; // px per hour slot

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Availability Engine</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Drag shift blocks to rearrange. Click cells to add new blocks.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-muted-foreground" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Time buffers</span>
            <Switch
              checked={bufferToggle}
              onCheckedChange={setBuffer}
              aria-label="Toggle time-slot buffers"
            />
          </div>
          <div className="flex items-center gap-1 border rounded-md overflow-hidden">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
              <ChevronLeft size={14} />
            </Button>
            <span className="text-xs px-2 font-medium text-foreground whitespace-nowrap">{getWeekLabel(weekOffset)}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(["morning","afternoon","full","vacation","buffer"] as ShiftType[]).map((t) => (
          <span key={t} className={cn("flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border capitalize", SHIFT_COLORS[t])}>
            {t === "vacation" && <Palmtree size={10} aria-hidden="true" />}
            {t === "buffer"   && <Clock    size={10} aria-hidden="true" />}
            {t}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <Card className="shadow-none border-border/60 overflow-hidden">
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="grid" style={{ gridTemplateColumns: "56px repeat(7, 1fr)" }}>
            <div /> {/* time axis header */}
            {DAYS.map((d) => (
              <div key={d} className="text-center pb-2 border-b border-border/60">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{d}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[520px]">
          <div className="relative" style={{ display: "grid", gridTemplateColumns: "56px repeat(7, 1fr)" }}>
            {/* Time axis */}
            <div className="flex flex-col">
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ height: HOUR_HEIGHT }}
                  className="flex items-start justify-end pr-2 pt-1 border-b border-border/30"
                >
                  <span className="text-[10px] text-muted-foreground font-mono">{String(h).padStart(2,"0")}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((_, dayIdx) => (
              <div
                key={dayIdx}
                className="relative border-l border-border/30"
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const relY = e.clientY - rect.top;
                  const hour = HOURS[Math.floor(relY / HOUR_HEIGHT)] ?? HOURS[0];
                  handleDrop(dayIdx, hour);
                }}
              >
                {/* Hour cells */}
                {HOURS.map((h) => (
                  <Popover
                    key={h}
                    open={popoverCell?.day === dayIdx && popoverCell?.hour === h}
                    onOpenChange={(open) => {
                      if (!open) setPopoverCell(null);
                    }}
                  >
                    <PopoverTrigger asChild>
                      <div
                        style={{ height: HOUR_HEIGHT }}
                        className="group border-b border-border/20 hover:bg-muted/30 cursor-pointer transition-colors relative"
                        onClick={() => setPopoverCell({ day: dayIdx, hour: h })}
                        role="button"
                        tabIndex={0}
                        aria-label={`Add shift on ${DAYS[dayIdx]} at ${h}:00`}
                        onKeyDown={(e) => e.key === "Enter" && setPopoverCell({ day: dayIdx, hour: h })}
                      >
                        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus size={12} className="text-muted-foreground" aria-hidden="true" />
                        </span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent side="right" align="start" className="w-auto p-4">
                      <ShiftPopoverForm
                        day={dayIdx}
                        hour={h}
                        onAdd={addShift}
                        onClose={() => setPopoverCell(null)}
                      />
                    </PopoverContent>
                  </Popover>
                ))}

                {/* Shift blocks overlay */}
                {shifts
                  .filter((s) => s.day === dayIdx && (!bufferToggle || s.type !== "buffer"))
                  .map((shift) => {
                    const topOffset = (shift.startH - HOURS[0]) * HOUR_HEIGHT;
                    const height    = (shift.endH - shift.startH) * HOUR_HEIGHT;
                    return (
                      <div
                        key={shift.id}
                        draggable
                        onDragStart={() => handleDragStart(shift.id)}
                        style={{ top: topOffset, height: Math.max(height - 4, 20), left: 2, right: 2 }}
                        className={cn(
                          "absolute rounded border text-[10px] font-medium px-1.5 py-0.5 overflow-hidden cursor-grab active:cursor-grabbing z-10 flex flex-col justify-between group transition-shadow hover:shadow-md",
                          SHIFT_COLORS[shift.type]
                        )}
                        role="button"
                        aria-label={`${shift.type} shift — ${shift.doctor}`}
                      >
                        <div className="flex items-center gap-0.5 truncate">
                          <GripVertical size={10} className="shrink-0 opacity-50" aria-hidden="true" />
                          <span className="truncate">{shift.doctor.split(" ").pop()}</span>
                        </div>
                        {height >= 48 && (
                          <span className="opacity-70 text-[9px]">{String(shift.startH).padStart(2,"0")}–{String(shift.endH).padStart(2,"0")}</span>
                        )}
                        <button
                          className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 transition-opacity"
                          onClick={(e) => { e.stopPropagation(); removeShift(shift.id); }}
                          aria-label="Remove shift"
                        >
                          <Trash2 size={9} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vacation range quick set */}
      <Card className="shadow-none border-border/60 border-amber-200 bg-amber-50/30">
        <CardContent className="py-3 px-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Palmtree size={15} className="text-amber-600 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-amber-900">Vacation / Leave Range</p>
              <p className="text-[11px] text-amber-700">Mark a full date range as vacation for a provider.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-8 rounded-md border border-amber-300 bg-white text-xs px-2 focus:outline-none focus:ring-1 focus:ring-amber-400">
              {DOCTORS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <input type="date" className="h-8 rounded-md border border-amber-300 bg-white text-xs px-2 focus:outline-none focus:ring-1 focus:ring-amber-400" />
            <span className="text-xs text-amber-700">to</span>
            <input type="date" className="h-8 rounded-md border border-amber-300 bg-white text-xs px-2 focus:outline-none focus:ring-1 focus:ring-amber-400" />
            <Button size="sm" className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white">
              <Calendar size={12} className="mr-1" aria-hidden="true" />
              Set Leave
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
