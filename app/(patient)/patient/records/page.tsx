import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Health Records" };

const records = [
  { id: "1", type: "Lab Results",    date: "May 28, 2026", label: "Blood Panel",        status: "normal" },
  { id: "2", type: "Prescription",   date: "May 15, 2026", label: "Metformin 500mg",    status: "active" },
  { id: "3", type: "Imaging",        date: "Apr 3, 2026",  label: "Chest X-Ray",        status: "reviewed" },
  { id: "4", type: "Consultation",   date: "Mar 20, 2026", label: "Cardiology Note",    status: "signed" },
];

const statusStyle: Record<string, string> = {
  normal:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  active:   "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)] border-[var(--color-brand-teal)]/20",
  reviewed: "bg-slate-100 text-slate-600 border-slate-200",
  signed:   "bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)] border-[var(--color-brand-blue)]/20",
};

export default function PatientRecordsPage() {
  return (
    <div className="px-4 py-6">
      <div className="mx-auto max-w-md">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Health Records</h1>
          <p className="text-sm text-muted-foreground">Your personal medical history.</p>
        </div>
        <ul role="list" className="flex flex-col gap-3">
          {records.map((rec) => (
            <li key={rec.id}>
              <Card className="shadow-none border-border/60">
                <CardContent className="flex items-center gap-4 p-4">
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)]"
                    aria-hidden="true"
                  >
                    <FileText size={18} strokeWidth={1.8} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{rec.label}</p>
                    <p className="text-xs text-muted-foreground">{rec.type} · {rec.date}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs capitalize ${statusStyle[rec.status]}`}
                  >
                    {rec.status}
                  </Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
