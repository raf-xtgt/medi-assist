"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Stethoscope,
  Users2,
  BadgeCheck,
  Award,
  MailIcon,
  PhoneIcon,
  ChevronsUpDown,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ── Data ────────────────────────────────────────────────────
interface Provider {
  id:          string;
  name:        string;
  specialty:   string;
  credentials: string[];
  email:       string;
  phone:       string;
  bio:         string;
  patients:    number;
  status:      "active" | "on-leave" | "inactive";
  avatarSeed:  string;
}

interface Patient {
  id:         string;
  name:       string;
  age:        number;
  email:      string;
  phone:      string;
  doctorId:   string;
  condition:  string;
  lastVisit:  string;
  status:     "active" | "pending" | "discharged";
}

const PROVIDERS: Provider[] = [
  {
    id: "D001", name: "Dr. Marcus Tan",   specialty: "General Practice",
    credentials: ["MBBS", "FRACGP", "FACP"],
    email: "m.tan@mediassist.com", phone: "+1 (555) 201-0011",
    bio: "Dr. Tan has 14 years of experience in general practice with a special interest in chronic disease management and preventive care.",
    patients: 284, status: "active", avatarSeed: "marcus",
  },
  {
    id: "D002", name: "Dr. Priya Nair",   specialty: "Cardiology",
    credentials: ["MBBS", "MD", "FACC", "FESC"],
    email: "p.nair@mediassist.com", phone: "+1 (555) 201-0022",
    bio: "Board-certified cardiologist specialising in interventional cardiology and heart failure management with over 11 years of clinical practice.",
    patients: 178, status: "active", avatarSeed: "priya",
  },
  {
    id: "D003", name: "Dr. Aisha Kamara", specialty: "Dermatology",
    credentials: ["MBBS", "FAAD"],
    email: "a.kamara@mediassist.com", phone: "+1 (555) 201-0033",
    bio: "Expert in medical and cosmetic dermatology including skin cancer screening, acne, eczema, and psoriasis treatment.",
    patients: 142, status: "on-leave", avatarSeed: "aisha",
  },
  {
    id: "D004", name: "Dr. David Wu",     specialty: "Endocrinology",
    credentials: ["MBBS", "PhD", "FACE"],
    email: "d.wu@mediassist.com", phone: "+1 (555) 201-0044",
    bio: "Specialises in diabetes, thyroid disorders, and metabolic diseases. Active researcher in type 2 diabetes remission protocols.",
    patients: 117, status: "active", avatarSeed: "david",
  },
  {
    id: "D005", name: "Dr. Sarah Okafor", specialty: "Paediatrics",
    credentials: ["MBBS", "FRACP"],
    email: "s.okafor@mediassist.com", phone: "+1 (555) 201-0055",
    bio: "Dedicated paediatrician with 9 years of experience in newborn care, developmental assessments, and childhood immunisation programs.",
    patients: 203, status: "active", avatarSeed: "sarah",
  },
];

const PATIENTS: Patient[] = [
  { id: "P001", name: "Eleanor Voss",    age: 58, email: "e.voss@email.com",    phone: "+1 555-1001", doctorId: "D001", condition: "Hypertension, T2D",    lastVisit: "2025-06-10", status: "active"     },
  { id: "P002", name: "James O'Brien",   age: 71, email: "j.obrien@email.com",  phone: "+1 555-1002", doctorId: "D002", condition: "Atrial Fibrillation",   lastVisit: "2025-06-09", status: "active"     },
  { id: "P003", name: "Sofia Ramirez",   age: 34, email: "s.ramirez@email.com", phone: "+1 555-1003", doctorId: "D001", condition: "Asthma",                 lastVisit: "2025-06-08", status: "active"     },
  { id: "P004", name: "Liam Chen",       age: 22, email: "l.chen@email.com",    phone: "+1 555-1004", doctorId: "D003", condition: "Eczema",                 lastVisit: "2025-05-30", status: "pending"    },
  { id: "P005", name: "Amara Okafor",    age: 45, email: "a.okafor@email.com",  phone: "+1 555-1005", doctorId: "D004", condition: "Hypothyroidism",         lastVisit: "2025-06-01", status: "active"     },
  { id: "P006", name: "Victor Petrov",   age: 63, email: "v.petrov@email.com",  phone: "+1 555-1006", doctorId: "D002", condition: "Heart Failure Stage II", lastVisit: "2025-06-12", status: "active"     },
  { id: "P007", name: "Hannah Schmidt",  age: 29, email: "h.schmidt@email.com", phone: "+1 555-1007", doctorId: "D001", condition: "Migraine",               lastVisit: "2025-05-28", status: "active"     },
  { id: "P008", name: "Carlos Mendez",   age: 51, email: "c.mendez@email.com",  phone: "+1 555-1008", doctorId: "D003", condition: "Psoriasis",              lastVisit: "2025-04-15", status: "discharged" },
  { id: "P009", name: "Yuki Tanaka",     age: 38, email: "y.tanaka@email.com",  phone: "+1 555-1009", doctorId: "D004", condition: "Type 2 Diabetes",        lastVisit: "2025-06-11", status: "active"     },
  { id: "P010", name: "Nadia Al-Farsi",  age: 47, email: "n.alfarsi@email.com", phone: "+1 555-1010", doctorId: "D002", condition: "Coronary Artery Disease",lastVisit: "2025-06-07", status: "active"     },
  { id: "P011", name: "Thomas Wren",     age: 67, email: "t.wren@email.com",    phone: "+1 555-1011", doctorId: "D005", condition: "Developmental Delay",    lastVisit: "2025-05-22", status: "active"     },
  { id: "P012", name: "Isabella Park",   age: 4,  email: "i.park@email.com",    phone: "+1 555-1012", doctorId: "D005", condition: "Routine Checkup",        lastVisit: "2025-06-03", status: "active"     },
];

const providerStatus: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  "on-leave":"bg-amber-50 text-amber-700 border-amber-200",
  inactive:  "bg-slate-100 text-slate-600 border-slate-200",
};
const patientStatus: Record<string, string> = {
  active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:   "bg-blue-50 text-blue-700 border-blue-200",
  discharged:"bg-slate-100 text-slate-600 border-slate-200",
};

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const PAGE_SIZE = 6;

type SortDir = "asc" | "desc" | null;

// ── Provider DataTable ───────────────────────────────────────
function ProviderTable({ filter }: { filter: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page,       setPage]       = useState(1);
  const [sortDir,    setSortDir]    = useState<SortDir>(null);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    const list = PROVIDERS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.specialty.toLowerCase().includes(q)
    );
    if (sortDir === "asc")  return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortDir === "desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [filter, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort() {
    setSortDir((d) => d === null ? "asc" : d === "asc" ? "desc" : null);
  }

  return (
    <div className="flex flex-col gap-0">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-2.5 text-left">
              <button onClick={toggleSort} className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Provider
                {sortDir === "asc"  ? <ChevronUp size={11}   aria-hidden="true" /> :
                 sortDir === "desc" ? <ChevronDown size={11}  aria-hidden="true" /> :
                                     <ChevronsUpDown size={11} aria-hidden="true" />}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground hidden md:table-cell">Specialty</th>
            <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground hidden lg:table-cell">Credentials</th>
            <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Patients</th>
            <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-2.5 w-8" />
          </tr>
        </thead>
        <tbody>
          {paged.map((doc) => (
            <>
              <tr
                key={doc.id}
                className={cn(
                  "border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer",
                  expandedId === doc.id && "bg-muted/20"
                )}
                onClick={() => setExpandedId((id) => id === doc.id ? null : doc.id)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7 shrink-0">
                      <AvatarFallback className="text-[10px] bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)] font-semibold">
                        {getInitials(doc.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{doc.name}</p>
                      <p className="text-muted-foreground text-[10px]">{doc.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{doc.specialty}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {doc.credentials.map((c) => (
                      <Badge key={c} variant="outline" className="text-[9px] px-1 py-0 font-medium border-border/60">
                        {c}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">{doc.patients}</td>
                <td className="px-4 py-3 text-right">
                  <Badge variant="outline" className={cn("text-[10px] capitalize", providerStatus[doc.status])}>
                    {doc.status.replace("-", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {expandedId === doc.id
                    ? <ChevronUp size={13} className="text-muted-foreground ml-auto" aria-hidden="true" />
                    : <ChevronDown size={13} className="text-muted-foreground ml-auto" aria-hidden="true" />}
                </td>
              </tr>

              {/* Expanded row — Provider profile */}
              {expandedId === doc.id && (
                <tr key={`${doc.id}-exp`} className="border-b border-border/30 bg-muted/10">
                  <td colSpan={6} className="px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Headshot placeholder */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[var(--color-brand-blue-light)] to-[var(--color-brand-teal-light)] flex items-center justify-center border border-border/60">
                          <span className="text-2xl font-bold text-[var(--color-brand-blue)]">{getInitials(doc.name)}</span>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] capitalize", providerStatus[doc.status])}>
                          {doc.status.replace("-", " ")}
                        </Badge>
                      </div>

                      {/* Bio & Details */}
                      <div className="flex flex-col gap-3 flex-1">
                        <div>
                          <p className="text-sm font-bold text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{doc.bio}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <MailIcon size={11} aria-hidden="true" className="text-[var(--color-brand-blue)]" />{doc.email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <PhoneIcon size={11} aria-hidden="true" className="text-[var(--color-brand-teal)]" />{doc.phone}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users2 size={11} aria-hidden="true" className="text-muted-foreground" />{doc.patients} patients
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Award size={11} className="text-amber-500 shrink-0" aria-hidden="true" />
                          {doc.credentials.map((c) => (
                            <Badge key={c} variant="outline" className="text-[10px] px-1.5 border-amber-200 text-amber-700 bg-amber-50">{c}</Badge>
                          ))}
                        </div>
                      </div>

                      {/* Cross-referenced patients */}
                      <div className="shrink-0 w-full md:w-56">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assigned Patients</p>
                        <div className="flex flex-col gap-1">
                          {PATIENTS.filter((p) => p.doctorId === doc.id).slice(0, 5).map((pt) => (
                            <div key={pt.id} className="flex items-center justify-between text-xs bg-background border border-border/50 rounded px-2 py-1.5">
                              <span className="font-medium text-foreground">{pt.name}</span>
                              <Badge variant="outline" className={cn("text-[9px] px-1", patientStatus[pt.status])}>
                                {pt.status}
                              </Badge>
                            </div>
                          ))}
                          {PATIENTS.filter((p) => p.doctorId === doc.id).length > 5 && (
                            <p className="text-[10px] text-muted-foreground px-1">
                              +{PATIENTS.filter((p) => p.doctorId === doc.id).length - 5} more
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length} providers · page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="size-7" onClick={() => setPage((p) => p - 1)} disabled={page === 1} aria-label="Previous page">
              <ChevronLeft size={12} />
            </Button>
            <Button variant="outline" size="icon" className="size-7" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} aria-label="Next page">
              <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Patient DataTable ────────────────────────────────────────
function PatientTable({ filter }: { filter: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page,       setPage]       = useState(1);
  const [sortDir,    setSortDir]    = useState<SortDir>(null);

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    const list = PATIENTS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.condition.toLowerCase().includes(q)
    );
    if (sortDir === "asc")  return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortDir === "desc") return [...list].sort((a, b) => b.name.localeCompare(a.name));
    return list;
  }, [filter, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort() {
    setSortDir((d) => d === null ? "asc" : d === "asc" ? "desc" : null);
  }

  return (
    <div className="flex flex-col gap-0">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-2.5 text-left">
              <button onClick={toggleSort} className="flex items-center gap-1 font-semibold text-muted-foreground hover:text-foreground transition-colors">
                Patient
                {sortDir === "asc"  ? <ChevronUp size={11}   aria-hidden="true" /> :
                 sortDir === "desc" ? <ChevronDown size={11}  aria-hidden="true" /> :
                                     <ChevronsUpDown size={11} aria-hidden="true" />}
              </button>
            </th>
            <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground hidden sm:table-cell">Age</th>
            <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground hidden md:table-cell">Condition</th>
            <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground hidden lg:table-cell">Provider</th>
            <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground hidden lg:table-cell">Last Visit</th>
            <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-2.5 w-8" />
          </tr>
        </thead>
        <tbody>
          {paged.map((pt) => {
            const doctor = PROVIDERS.find((d) => d.id === pt.doctorId);
            return (
              <>
                <tr
                  key={pt.id}
                  className={cn(
                    "border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer",
                    expandedId === pt.id && "bg-muted/20"
                  )}
                  onClick={() => setExpandedId((id) => id === pt.id ? null : pt.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 shrink-0">
                        <AvatarFallback className="text-[10px] bg-muted text-muted-foreground font-semibold">
                          {getInitials(pt.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{pt.name}</p>
                        <p className="text-muted-foreground text-[10px]">{pt.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{pt.age}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{pt.condition}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{doctor?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">{pt.lastVisit}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="outline" className={cn("text-[10px] capitalize", patientStatus[pt.status])}>
                      {pt.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {expandedId === pt.id
                      ? <ChevronUp size={13} className="text-muted-foreground ml-auto" aria-hidden="true" />
                      : <ChevronDown size={13} className="text-muted-foreground ml-auto" aria-hidden="true" />}
                  </td>
                </tr>

                {/* Expanded row — Patient panel */}
                {expandedId === pt.id && (
                  <tr key={`${pt.id}-exp`} className="border-b border-border/30 bg-muted/10">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col gap-3 flex-1">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10">
                              <AvatarFallback className="text-sm bg-muted font-semibold">{getInitials(pt.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-foreground">{pt.name}</p>
                              <p className="text-xs text-muted-foreground">Age {pt.age} · {pt.id}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <MailIcon size={11} aria-hidden="true" className="text-[var(--color-brand-blue)]" />{pt.email}
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <PhoneIcon size={11} aria-hidden="true" className="text-[var(--color-brand-teal)]" />{pt.phone}
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <FileText size={11} aria-hidden="true" className="text-muted-foreground" />
                              <span>Condition: <strong className="text-foreground">{pt.condition}</strong></span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <CalendarDays size={11} aria-hidden="true" className="text-muted-foreground" />
                              Last visit: <strong className="text-foreground">{pt.lastVisit}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Cross-referenced doctor */}
                        {doctor && (
                          <div className="shrink-0 w-full md:w-56 flex flex-col gap-2">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Assigned Provider</p>
                            <div className="flex items-center gap-2.5 bg-background border border-border/50 rounded px-3 py-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-blue-light)] flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-[var(--color-brand-blue)]">{getInitials(doctor.name)}</span>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-foreground">{doctor.name}</p>
                                <p className="text-[10px] text-muted-foreground">{doctor.specialty}</p>
                              </div>
                              <BadgeCheck size={14} className="ml-auto text-emerald-500 shrink-0" aria-hidden="true" />
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
          <p className="text-[11px] text-muted-foreground">
            {filtered.length} patients · page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="size-7" onClick={() => setPage((p) => p - 1)} disabled={page === 1} aria-label="Previous page">
              <ChevronLeft size={12} />
            </Button>
            <Button variant="outline" size="icon" className="size-7" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages} aria-label="Next page">
              <ChevronRight size={12} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Missing import used in patient expanded row
function CalendarDays(props: React.ComponentProps<typeof ChevronDown>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden="true">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8"  x2="8"  y1="2" y2="6"/>
      <line x1="3"  x2="21" y1="10" y2="10"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
    </svg>
  );
}

// ── Main Directory ───────────────────────────────────────────
export function RelationalDirectory() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Relational Directory</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Searchable, paginated provider and patient records with cross-references.</p>
        </div>
        <div className="relative w-72">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or condition…"
            className="pl-8 h-8 text-sm"
            aria-label="Search directory"
          />
        </div>
      </div>

      <Card className="shadow-none border-border/60">
        <CardContent className="p-0">
          <Tabs defaultValue="providers">
            <div className="px-4 pt-4 border-b border-border/40">
              <TabsList className="h-9">
                <TabsTrigger value="providers" className="text-xs gap-1.5 px-3">
                  <Stethoscope size={12} aria-hidden="true" />
                  Providers <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{PROVIDERS.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="patients" className="text-xs gap-1.5 px-3">
                  <Users2 size={12} aria-hidden="true" />
                  Patients <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{PATIENTS.length}</Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="providers" className="mt-0">
              <ProviderTable filter={search} />
            </TabsContent>
            <TabsContent value="patients" className="mt-0">
              <PatientTable filter={search} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
