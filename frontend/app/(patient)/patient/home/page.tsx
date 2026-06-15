import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarCheck,
  FileText,
  Heart,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = { title: "Home" };

const quickActions = [
  {
    label:      "Book Appointment",
    icon:       CalendarCheck,
    href:       "/patient/appointments",
    accentBg:   "bg-[var(--color-brand-teal-light)]",
    accentText: "text-[var(--color-brand-teal)]",
  },
  {
    label:      "My Records",
    icon:       FileText,
    href:       "/patient/records",
    accentBg:   "bg-[var(--color-brand-blue-light)]",
    accentText: "text-[var(--color-brand-blue)]",
  },
  {
    label:      "Message Doctor",
    icon:       MessageCircle,
    href:       "/patient/appointments",
    accentBg:   "bg-emerald-50",
    accentText: "text-emerald-600",
  },
  {
    label:      "Emergency",
    icon:       Phone,
    href:       "tel:911",
    accentBg:   "bg-red-50",
    accentText: "text-red-600",
  },
];

const upcomingAppointments = [
  {
    id:      "1",
    doctor:  "Dr. Priya Nair",
    type:    "General Check-up",
    date:    "Tomorrow",
    time:    "10:00 AM",
    status:  "confirmed",
  },
  {
    id:      "2",
    doctor:  "Dr. Marcus Oliveira",
    type:    "Blood Test Results",
    date:    "Mon, Jul 7",
    time:    "2:30 PM",
    status:  "pending",
  },
];

export default function PatientHomePage() {
  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        {/* Greeting */}
        <div className="mb-6 flex items-start gap-3">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-teal-light)]"
            aria-hidden="true"
          >
            <Heart size={22} className="text-[var(--color-brand-teal)]" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Hello, there</h1>
            <p className="text-sm text-muted-foreground">How are you feeling today?</p>
          </div>
        </div>

        {/* Health summary card */}
        <Card className="mb-6 shadow-none border-0 bg-[var(--color-brand-teal)] text-white overflow-hidden">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-white/80">Next appointment</p>
            <p className="mt-1 text-xl font-bold">Tomorrow, 10:00 AM</p>
            <p className="mt-0.5 text-sm text-white/80">Dr. Priya Nair · General Check-up</p>
            <Button
              className="mt-4 h-10 w-full bg-white text-[var(--color-brand-teal)] hover:bg-white/90 font-medium"
              asChild
            >
              <Link href="/patient/appointments">
                View details
                <ArrowRight size={14} data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <section aria-labelledby="quick-actions-heading" className="mb-6">
          <h2
            id="quick-actions-heading"
            className="mb-3 text-sm font-semibold text-foreground"
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl ${action.accentBg} ${action.accentText} text-xs font-medium transition-opacity hover:opacity-80`}
                >
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Upcoming appointments */}
        <section aria-labelledby="appointments-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="appointments-heading"
              className="text-sm font-semibold text-foreground"
            >
              Upcoming
            </h2>
            <Link
              href="/patient/appointments"
              className="text-xs font-medium text-[var(--color-brand-teal)] hover:underline"
            >
              See all
            </Link>
          </div>
          <ul role="list" className="flex flex-col gap-3">
            {upcomingAppointments.map((appt) => (
              <li key={appt.id}>
                <Card className="shadow-none border-border/60">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div
                      className="flex shrink-0 size-10 items-center justify-center rounded-lg bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]"
                      aria-hidden="true"
                    >
                      <CalendarCheck size={18} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{appt.doctor}</p>
                      <p className="text-xs text-muted-foreground">{appt.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {appt.date} · {appt.time}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 text-xs capitalize ${
                        appt.status === "confirmed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {appt.status}
                    </Badge>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
