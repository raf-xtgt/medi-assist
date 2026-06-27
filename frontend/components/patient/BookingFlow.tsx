"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Phone,
  Star,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { doctorAvailabilityService } from "@/lib/api/services/doctor-availability-service";
import type { DoctorCalendarResponse } from "@/lib/api/model/doctor-availability.model";

/* ─── Directory data (hardcoded for "Browse All Doctors" flow) ─── */
const doctors = [
  {
    id: "priya-nair",
    name: "Dr. Priya Nair",
    specialty: "General Practice",
    tags: ["GP", "Preventive Care"],
    rating: 4.9,
    reviews: 218,
    photo: "/doctors/dr-priya-nair.png",
  },
  {
    id: "marcus-oliveira",
    name: "Dr. Marcus Oliveira",
    specialty: "Internal Medicine",
    tags: ["Internal Med", "Diabetes"],
    rating: 4.8,
    reviews: 174,
    photo: "/doctors/dr-marcus-oliveira.png",
  },
  {
    id: "sofia-chen",
    name: "Dr. Sofia Chen",
    specialty: "Dermatology",
    tags: ["Dermatology", "Skin Care"],
    rating: 4.9,
    reviews: 302,
    photo: "/doctors/dr-sofia-chen.png",
  },
  {
    id: "james-okafor",
    name: "Dr. James Okafor",
    specialty: "Cardiology",
    tags: ["Cardiology", "Heart Health"],
    rating: 4.7,
    reviews: 140,
    photo: "/doctors/dr-james-okafor.png",
  },
  {
    id: "aisha-rahman",
    name: "Dr. Aisha Rahman",
    specialty: "Paediatrics",
    tags: ["Paediatrics", "Child Health"],
    rating: 4.9,
    reviews: 265,
    photo: "/doctors/dr-aisha-rahman.png",
  },
];

/* ─── Calendar utils ────────────────────────────────────────── */
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/** Format "HH:MM" (24h) → "H:MM AM/PM" */
function formatTime24to12(t: string): string {
  const [hStr, mStr] = t.split(":");
  let h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${h}:${mStr} ${suffix}`;
}

/** Get ISO date string for a given year/month/day */
function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

type View = "directory" | "calendar" | "success";

interface SelectedSlot {
  date: string;
  time: string;
}

interface BookingFlowProps {
  preselectedDoctorId?: string;
  /** Real doctor data from backend (overrides hardcoded doctor display when preselectedDoctorId is a real GUID) */
  preselectedDoctorInfo?: {
    name: string;
    specialty?: string;
    image_url?: string;
  };
  onConfirmed?: (info: { name: string; mobile: string; doctor: string; slot: SelectedSlot }) => void;
  /** Custom back handler for when embedded in unified view */
  onBack?: () => void;
  /** Pre-fill name in the confirmation sheet */
  prefillName?: string;
  /** Pre-fill mobile in the confirmation sheet */
  prefillMobile?: string;
}

export function BookingFlow({ preselectedDoctorId, preselectedDoctorInfo, onConfirmed, onBack, prefillName, prefillMobile }: BookingFlowProps) {
  const router = useRouter();
  const [view, setView] = useState<View>(preselectedDoctorId ? "calendar" : "directory");
  const [selectedDoctor, setSelectedDoctor] = useState(
    preselectedDoctorId ? doctors.find((d) => d.id === preselectedDoctorId) ?? doctors[0] : doctors[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState(prefillName ?? "");
  const [mobile, setMobile] = useState(prefillMobile ?? "");
  const [submitting, setSubmitting] = useState(false);

  // Calendar state
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calSelectedDay, setCalSelectedDay] = useState<number | null>(null);

  // Real calendar data from backend
  const [calendarData, setCalendarData] = useState<DoctorCalendarResponse | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  // The doctor GUID to use for calendar fetch
  const activeDoctorGuid = preselectedDoctorId ?? selectedDoctor.id;

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);
  const monthLabel = new Date(calYear, calMonth).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  /* ── Fetch calendar data for current month ──────────────── */
  const fetchCalendar = useCallback(async () => {
    if (!activeDoctorGuid) return;

    setCalendarLoading(true);
    try {
      const startDate = toISODate(calYear, calMonth, 1);
      const endDate = toISODate(calYear, calMonth, getDaysInMonth(calYear, calMonth));

      const data = await doctorAvailabilityService.getCalendar({
        doctor_guid: activeDoctorGuid,
        start_date: startDate,
        end_date: endDate,
      });
      setCalendarData(data);
    } catch {
      setCalendarData(null);
    } finally {
      setCalendarLoading(false);
    }
  }, [activeDoctorGuid, calYear, calMonth]);

  useEffect(() => {
    if (view === "calendar") {
      fetchCalendar();
    }
  }, [view, fetchCalendar]);

  // Derive which days have slots from real backend data
  const availableDates = calendarData?.available_dates ?? {};
  const slotDays = new Set(
    Object.entries(availableDates)
      .filter(([, times]) => times.length > 0)
      .map(([dateStr]) => new Date(dateStr).getDate())
  );

  // Get time slots for the selected day from real data
  const selectedDateStr = calSelectedDay ? toISODate(calYear, calMonth, calSelectedDay) : null;
  const timeSlotsForDay: string[] = selectedDateStr ? (availableDates[selectedDateStr] ?? []) : [];

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setCalSelectedDay(null);
    setSelectedSlot(null);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setCalSelectedDay(null);
    setSelectedSlot(null);
  }

  function handleBookSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !selectedSlot) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSheetOpen(false);
      const doctorName = preselectedDoctorInfo?.name ?? selectedDoctor.name;
      if (onConfirmed) {
        onConfirmed({ name, mobile, doctor: doctorName, slot: selectedSlot });
      } else {
        setView("success");
      }
    }, 1200);
  }

  /* ── Directory view ──────────────────────────────────────── */
  if (view === "directory") {
    return (
      <div className="px-4 py-5">
        <div className="mx-auto max-w-md">
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => onBack ? onBack() : router.push("/patient/landing")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Choose a Doctor</h1>
              <p className="text-xs text-muted-foreground">Tap any card to see availability</p>
            </div>
          </div>

          <ul role="list" className="flex flex-col gap-3">
            {doctors.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => { setSelectedDoctor(doc); setView("calendar"); }}
                  className="group w-full text-left rounded-2xl border border-border/60 bg-card p-4 transition-all hover:border-[var(--color-brand-teal)] hover:shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={doc.photo}
                        alt={`${doc.name} photo`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm leading-tight">{doc.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.specialty}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {doc.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] border-0"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Star size={11} className="fill-amber-400 text-amber-400" aria-hidden="true" />
                        {doc.rating}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{doc.reviews} reviews</span>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  /* ── Calendar view ───────────────────────────────────────── */
  if (view === "calendar") {
    return (
      <div className="px-4 py-5">
        <div className="mx-auto max-w-md">
          {/* Back + doctor info */}
          <div className="mb-5 flex items-center gap-3">
            <button
              onClick={() => { setView("directory"); setCalSelectedDay(null); setSelectedSlot(null); setCalendarData(null); }}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Back to doctors"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {preselectedDoctorInfo?.image_url ? (
                  <Image
                    src={preselectedDoctorInfo.image_url}
                    alt={`${preselectedDoctorInfo.name} photo`}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                ) : (
                  <Image
                    src={selectedDoctor.photo}
                    alt={`${selectedDoctor.name} photo`}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {preselectedDoctorInfo?.name ?? selectedDoctor.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {preselectedDoctorInfo?.specialty ?? selectedDoctor.specialty}
                </p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-none mb-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span className="text-sm font-semibold text-foreground">{monthLabel}</span>
              <button
                onClick={nextMonth}
                className="flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Loading state */}
            {calendarLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-muted-foreground" aria-hidden="true" />
                <span className="ml-2 text-sm text-muted-foreground">Loading availability…</span>
              </div>
            ) : (
              <>
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                    <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasSlot = slotDays.has(day);
                    const isPast = new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                    const isSelected = calSelectedDay === day;

                    return (
                      <button
                        key={day}
                        disabled={!hasSlot || isPast}
                        onClick={() => { setCalSelectedDay(day); setSelectedSlot(null); }}
                        className={cn(
                          "relative mx-auto flex size-9 items-center justify-center rounded-full text-sm transition-colors",
                          isPast && "text-muted-foreground/40 cursor-not-allowed",
                          !isPast && !hasSlot && "text-muted-foreground/60 cursor-not-allowed",
                          hasSlot && !isPast && !isSelected && "font-semibold text-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-light)]",
                          isSelected && "bg-[var(--color-brand-teal)] text-white font-bold",
                        )}
                        aria-pressed={isSelected}
                        aria-label={`${monthLabel} ${day}${hasSlot ? ", has available slots" : ""}`}
                      >
                        {day}
                        {hasSlot && !isPast && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full",
                              isSelected ? "bg-white" : "bg-[var(--color-brand-teal)]"
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Time slots */}
          {calSelectedDay && !calendarLoading && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                Available times
              </p>
              {timeSlotsForDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots for this day.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlotsForDay.map((timeStr) => {
                    const displayDate = selectedDateStr ?? "";
                    const isSelected = selectedSlot?.time === timeStr && selectedSlot?.date === displayDate;
                    return (
                      <button
                        key={timeStr}
                        onClick={() => setSelectedSlot({ date: displayDate, time: timeStr })}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all",
                          isSelected
                            ? "border-[var(--color-brand-teal)] bg-[var(--color-brand-teal)] text-white"
                            : "border-border bg-card text-foreground hover:border-[var(--color-brand-teal)] hover:text-[var(--color-brand-teal)]"
                        )}
                        aria-pressed={isSelected}
                      >
                        <Clock size={11} aria-hidden="true" />
                        {formatTime24to12(timeStr)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Confirm CTA */}
          <Button
            disabled={!selectedSlot}
            onClick={() => setSheetOpen(true)}
            className="w-full h-12 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white font-semibold text-sm disabled:opacity-40"
          >
            {selectedSlot
              ? `Confirm — ${selectedSlot.date} at ${formatTime24to12(selectedSlot.time)}`
              : "Select a time slot"}
          </Button>
        </div>

        {/* Bottom sheet — capture name + mobile */}
        {sheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSheetOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 rounded-t-3xl bg-background px-5 pt-5 pb-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" aria-hidden="true" />
              <button
                onClick={() => setSheetOpen(false)}
                className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X size={16} aria-hidden="true" />
              </button>

              <h2 className="text-lg font-bold text-foreground mb-1">Confirm Your Booking</h2>
              <p className="text-sm text-muted-foreground mb-5">
                {preselectedDoctorInfo?.name ?? selectedDoctor.name} · {selectedSlot?.date} at {selectedSlot ? formatTime24to12(selectedSlot.time) : ""}
              </p>

              <form onSubmit={handleBookSubmit} className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="book-name" className="text-sm font-medium mb-1.5 block">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="book-name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="book-mobile" className="text-sm font-medium mb-1.5 block">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                      id="book-mobile"
                      type="tel"
                      placeholder="+1 555 000 0000"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      className="pl-9 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !name.trim() || !mobile.trim()}
                  className="h-12 w-full rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white font-semibold mt-1"
                >
                  {submitting ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Success view ────────────────────────────────────────── */
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-5 text-center">
      <div className="mx-auto max-w-sm">
        <div className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)]">
          <CheckCircle2
            size={52}
            className="text-[var(--color-brand-teal)]"
            strokeWidth={1.6}
            aria-hidden="true"
          />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Appointment Booked!</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          Your appointment with{" "}
          <span className="font-semibold text-foreground">
            {preselectedDoctorInfo?.name ?? selectedDoctor.name}
          </span>
          {" "}is confirmed.
        </p>
        {selectedSlot && (
          <div className="mt-4 rounded-2xl border border-border bg-card px-5 py-4 text-left mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                {preselectedDoctorInfo?.image_url ? (
                  <Image
                    src={preselectedDoctorInfo.image_url}
                    alt={preselectedDoctorInfo.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                ) : (
                  <Image
                    src={selectedDoctor.photo}
                    alt={selectedDoctor.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {preselectedDoctorInfo?.name ?? selectedDoctor.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {preselectedDoctorInfo?.specialty ?? selectedDoctor.specialty}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarCheck size={14} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
              <span>{selectedSlot.date}</span>
              <Clock size={14} className="text-[var(--color-brand-teal)] ml-2" aria-hidden="true" />
              <span>{formatTime24to12(selectedSlot.time)}</span>
            </div>
          </div>
        )}
        <p className="text-xs text-muted-foreground mb-6">
          We&apos;ll send a confirmation SMS to your mobile number.
        </p>
        <Button
          onClick={() => onBack ? onBack() : router.push("/patient/landing")}
          className="w-full h-12 rounded-xl bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white font-semibold"
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}
