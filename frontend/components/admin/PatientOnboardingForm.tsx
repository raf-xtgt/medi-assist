"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ClipboardList,
  Eye,
  Pencil,
  Save,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PLACEHOLDER_NOTES = `## Chief Complaint
Patient presents with recurring episodes of **dizziness and fatigue** over the past 3 months.

## Medical History
- **Hypertension** – diagnosed 2019, managed with Lisinopril 10 mg
- **Type 2 Diabetes** – controlled, HbA1c: 6.8% (March 2025)
- **Appendectomy** – 2011, no complications

## Allergies
| Substance | Reaction | Severity |
|-----------|----------|----------|
| Penicillin | Rash, hives | Moderate |
| Sulfa drugs | Anaphylaxis | Severe |

## Current Medications
1. Lisinopril 10 mg – once daily
2. Metformin 500 mg – twice daily
3. Atorvastatin 20 mg – once nightly

## Family History
- Father: Coronary artery disease
- Mother: Type 2 Diabetes, Hypothyroidism

## Notes
> Patient reports high stress at work. Recommend **lifestyle counselling** referral and repeat CBC in 4 weeks.
`;

interface FormState {
  firstName:   string;
  lastName:    string;
  age:         string;
  dob:         string;
  email:       string;
  phone:       string;
  address:     string;
  city:        string;
  state:       string;
  zip:         string;
  assignedDoc: string;
}

const INITIAL_FORM: FormState = {
  firstName: "", lastName: "", age: "", dob: "",
  email: "", phone: "", address: "", city: "", state: "", zip: "",
  assignedDoc: "",
};

const DOCTORS = ["Dr. Marcus Tan", "Dr. Priya Nair", "Dr. Aisha Kamara", "Dr. David Wu"];

function FieldGroup({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}

export function PatientOnboardingForm() {
  const [form,    setForm]    = useState<FormState>(INITIAL_FORM);
  const [notes,   setNotes]   = useState(PLACEHOLDER_NOTES);
  const [saved,   setSaved]   = useState(false);
  const [errors,  setErrors]  = useState<Partial<FormState>>({});

  function update(field: keyof FormState, val: string) {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    setSaved(false);
  }

  function validate() {
    const errs: Partial<FormState> = {};
    if (!form.firstName.trim()) errs.firstName = "Required";
    if (!form.lastName.trim())  errs.lastName  = "Required";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Valid email required";
    if (!form.phone.trim())     errs.phone     = "Required";
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaved(true);
  }

  function handleReset() {
    setForm(INITIAL_FORM);
    setNotes(PLACEHOLDER_NOTES);
    setErrors({});
    setSaved(false);
  }

  const inputCls = (field: keyof FormState) =>
    cn("h-8 text-sm", errors[field] && "border-destructive ring-1 ring-destructive/30 focus-visible:ring-destructive");

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Patient Onboarding</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Legacy patient intake — complete both panels before saving.</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border text-xs font-medium">
              Record saved
            </Badge>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleReset}>
            <RotateCcw size={12} aria-hidden="true" />Reset
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5" onClick={handleSave}>
            <Save size={12} aria-hidden="true" />Save Patient
          </Button>
        </div>
      </div>

      {/* Split pane */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* LEFT — form fields */}
        <Card className="shadow-none border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User size={14} className="text-[var(--color-brand-blue)]" aria-hidden="true" />
              Patient Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="First Name" required>
                <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Eleanor" className={inputCls("firstName")} />
                {errors.firstName && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle size={10} />{errors.firstName}</p>}
              </FieldGroup>
              <FieldGroup label="Last Name" required>
                <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Voss" className={inputCls("lastName")} />
                {errors.lastName && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle size={10} />{errors.lastName}</p>}
              </FieldGroup>
            </div>

            {/* Age / DOB */}
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Age">
                <Input
                  type="number" min={0} max={130}
                  value={form.age} onChange={(e) => update("age", e.target.value)}
                  placeholder="42"
                  className={cn("h-8 text-sm", inputCls("age"))}
                />
              </FieldGroup>
              <FieldGroup label="Date of Birth">
                <div className="relative">
                  <CalendarDays size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => update("dob", e.target.value)}
                    className="h-8 text-sm pl-8"
                  />
                </div>
              </FieldGroup>
            </div>

            <div className="border-t border-border/40 pt-3 flex flex-col gap-3">
              <FieldGroup label="Email" required>
                <div className="relative">
                  <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    type="email" value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="eleanor@example.com"
                    className={cn("pl-8", inputCls("email"))}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle size={10} />{errors.email}</p>}
              </FieldGroup>

              <FieldGroup label="Phone" required>
                <div className="relative">
                  <Phone size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    type="tel" value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className={cn("pl-8", inputCls("phone"))}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-destructive flex items-center gap-1"><AlertCircle size={10} />{errors.phone}</p>}
              </FieldGroup>
            </div>

            <div className="border-t border-border/40 pt-3 flex flex-col gap-3">
              <FieldGroup label="Street Address">
                <div className="relative">
                  <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                  <Input
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="123 Oak Street"
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </FieldGroup>
              <div className="grid grid-cols-3 gap-2">
                <FieldGroup label="City">
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Springfield" className="h-8 text-sm" />
                </FieldGroup>
                <FieldGroup label="State">
                  <Input value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="IL" className="h-8 text-sm" />
                </FieldGroup>
                <FieldGroup label="ZIP">
                  <Input value={form.zip} onChange={(e) => update("zip", e.target.value)} placeholder="62701" className="h-8 text-sm" />
                </FieldGroup>
              </div>
            </div>

            <div className="border-t border-border/40 pt-3">
              <FieldGroup label="Assigned Provider">
                <select
                  value={form.assignedDoc}
                  onChange={(e) => update("assignedDoc", e.target.value)}
                  className="h-8 w-full rounded-md border border-input bg-background text-sm px-2 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">— Select provider —</option>
                  {DOCTORS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT — markdown notes */}
        <Card className="shadow-none border-border/60 flex flex-col">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ClipboardList size={14} className="text-[var(--color-brand-teal)]" aria-hidden="true" />
                Legacy Medical History
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-3">
            <Tabs defaultValue="edit" className="flex-1 flex flex-col">
              <TabsList className="h-8 w-fit mb-2">
                <TabsTrigger value="edit" className="text-xs gap-1.5 px-3">
                  <Pencil size={11} aria-hidden="true" />Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs gap-1.5 px-3">
                  <Eye size={11} aria-hidden="true" />Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="flex-1 flex flex-col mt-0">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="flex-1 min-h-[420px] font-mono text-xs resize-none leading-relaxed"
                  placeholder="Write legacy medical history in Markdown…"
                  aria-label="Medical history notes"
                />
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Supports Markdown: **bold**, *italic*, `code`, tables, lists, headings
                </p>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 mt-0">
                <div
                  className={cn(
                    "min-h-[420px] rounded-md border border-border/60 bg-muted/20 px-4 py-3 overflow-y-auto text-sm",
                    "prose prose-sm max-w-none",
                    "[&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2:first-child]:mt-0",
                    "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-1.5 [&_h3]:mt-3",
                    "[&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-2",
                    "[&_ul]:list-disc [&_ul]:ml-4 [&_ul]:text-muted-foreground [&_ul]:mb-2 [&_li]:mb-0.5",
                    "[&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:text-muted-foreground [&_ol]:mb-2",
                    "[&_strong]:text-foreground [&_strong]:font-semibold",
                    "[&_blockquote]:border-l-4 [&_blockquote]:border-[var(--color-brand-blue)] [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic [&_blockquote]:my-2",
                    "[&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_table]:mb-3",
                    "[&_th]:bg-muted [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold [&_th]:border [&_th]:border-border",
                    "[&_td]:px-2 [&_td]:py-1 [&_td]:border [&_td]:border-border",
                    "[&_code]:bg-muted [&_code]:px-1 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
                  )}
                >
                  <ReactMarkdown>{notes}</ReactMarkdown>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
