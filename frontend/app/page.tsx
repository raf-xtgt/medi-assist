import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";

export const metadata: Metadata = {
  title: "medi-assist — Digital Health Platform",
};

const portals = [
  {
    role:        "admin",
    label:       "Admin Portal",
    href:        "/api/auth/quick-login?role=admin",
    icon:        LayoutDashboard,
    description: "Manage clinics, users, and system-wide configuration from a powerful operational dashboard.",
    accent:      "blue" as const,
    accentClass: "bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)]",
    btnClass:    "bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-dark)] text-white",
  },
  {
    role:        "doctor",
    label:       "Doctor Portal",
    href:        "/api/auth/quick-login?role=doctor",
    icon:        Stethoscope,
    description: "Review patient queues, access clinical notes, manage your schedule, and surface AI-assisted insights.",
    accent:      "teal" as const,
    accentClass: "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]",
    btnClass:    "bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white",
  },
  // {
  //   role:        "patient",
  //   label:       "Patient Portal",
  //   href:        "/patient/landing",
  //   icon:        Heart,
  //   description: "Book appointments, view your health records, and stay connected with your care team — no login required.",
  //   accent:      "teal" as const,
  //   accentClass: "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]",
  //   btnClass:    "bg-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-dark)] text-white",
  // },
];

const features = [
  { icon: CalendarCheck, label: "Smart Scheduling",     desc: "AI-optimised appointment slots that reduce no-shows." },
  { icon: ClipboardList, label: "Clinical Notes",       desc: "Structured AI-assisted SOAP notes, synced instantly." },
  { icon: Users,         label: "Multi-tenant Clinics", desc: "Isolate data and branding per clinic in one platform." },
  { icon: Activity,      label: "Real-time Vitals",     desc: "Live patient queue metrics visible from every device." },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Logo size="md" />
          <nav className="flex items-center gap-3" aria-label="Primary navigation">
            {/* <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" className="bg-[var(--primary)] hover:bg-[var(--color-brand-blue-dark)] text-white" asChild>
              <Link href="/login">
                Get started
                <ArrowRight size={14} data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button> */}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-4 text-center md:px-8">
            <Badge className="mb-6 bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)] border-0 px-3 py-1 text-xs font-medium">
              Digital Health Platform
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Healthcare that works
              <br />
              <span className="text-[var(--color-brand-blue)]">for everyone</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              medi-assist unifies Admins, Doctors, and Patients on a single
              platform — purpose-built for the speed and trust that modern
              healthcare demands.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {/* <Button
                size="lg"
                className="min-w-40 bg-[var(--primary)] hover:bg-[var(--color-brand-blue-dark)] text-white"
                asChild
              >
                <Link href="/login">Get started</Link>
              </Button> */}
              <Button variant="outline" size="lg" className="min-w-40" asChild>
                <Link href="#portals">View portals</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Portals */}
        <section id="portals" className="bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Two portals, one platform
              </h2>
              <p className="mt-3 text-muted-foreground">
                Each role gets an interface built around their exact workflow.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              {portals.map((portal) => {
                const Icon = portal.icon;
                return (
                  <Card
                    key={portal.role}
                    className="group shadow-none border-border/60 transition-shadow hover:shadow-md"
                  >
                    <CardContent className="flex flex-col gap-5 p-6">
                      <span
                        className={`flex size-11 items-center justify-center rounded-xl ${portal.accentClass}`}
                        aria-hidden="true"
                      >
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground">{portal.label}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {portal.description}
                        </p>
                      </div>
                      <Button
                        className={`mt-auto w-full ${portal.btnClass}`}
                        asChild
                      >
                        <Link href={portal.href}>
                          Enter portal
                          <ArrowRight size={14} data-icon="inline-end" aria-hidden="true" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-4 md:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Built for clinical scale
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className="flex flex-col gap-3">
                    <span
                      className="flex size-10 items-center justify-center rounded-lg bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)]"
                      aria-hidden="true"
                    >
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">{f.label}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row md:px-8">
          <Logo size="sm" />
          <p>&copy; {new Date().getFullYear()} medi-assist. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
