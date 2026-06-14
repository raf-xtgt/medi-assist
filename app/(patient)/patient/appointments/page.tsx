import type { Metadata } from "next";
import { CalendarCheck, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Appointments" };

const appointments = [
  {
    id:     "1",
    doctor: "Dr. Priya Nair",
    type:   "General Check-up",
    date:   "Jun 15, 2026",
    time:   "10:00 AM",
    status: "confirmed",
  },
  {
    id:     "2",
    doctor: "Dr. Marcus Oliveira",
    type:   "Blood Test Results",
    date:   "Jun 18, 2026",
    time:   "2:30 PM",
    status: "pending",
  },
  {
    id:     "3",
    doctor: "Dr. Sofia Chen",
    type:   "Dermatology Review",
    date:   "May 30, 2026",
    time:   "11:15 AM",
    status: "completed",
  },
];

const statusStyle: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function PatientAppointmentsPage() {
  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Appointments</h1>
            <p className="text-sm text-muted-foreground">Your upcoming and past visits.</p>
          </div>
          <Button
            size="sm"
            className="bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white"
          >
            <Plus size={14} data-icon="inline-start" aria-hidden="true" />
            Book
          </Button>
        </div>

        <ul role="list" className="flex flex-col gap-3">
          {appointments.map((appt) => (
            <li key={appt.id}>
              <Card className="shadow-none border-border/60">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]"
                      aria-hidden="true"
                    >
                      <CalendarCheck size={18} strokeWidth={1.8} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{appt.doctor}</p>
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-xs capitalize ${statusStyle[appt.status]}`}
                        >
                          {appt.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{appt.type}</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarCheck size={11} aria-hidden="true" />
                          {appt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} aria-hidden="true" />
                          {appt.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
