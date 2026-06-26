"use client";

import { useState } from "react";
import { ArrowLeft, Save, Loader2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { doctorService } from "@/lib/api/services/doctor-service";
import type { DoctorResponse } from "@/lib/api/model/doctor.model";
import { DoctorAvailabilityEditor } from "./DoctorAvailabilityEditor";

type SaveStep = "idle" | "creating" | "ingesting" | "updating" | "done";

interface ClinicDoctorViewProps {
  clinicGuid: string;
  doctor: DoctorResponse | null;
  onSaved: () => void;
  onClose: () => void;
}

export function ClinicDoctorView({ clinicGuid, doctor, onSaved, onClose }: ClinicDoctorViewProps) {
  const isEditing = !!doctor;

  const [name, setName] = useState(doctor?.name ?? "");
  const [email, setEmail] = useState(doctor?.email ?? "");
  const [phone, setPhone] = useState(doctor?.phone ?? "");
  const [about, setAbout] = useState(doctor?.about ?? "");
  const [specialty, setSpecialty] = useState(doctor?.specialty ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saveStep, setSaveStep] = useState<SaveStep>("idle");

  const stepMessages: Record<SaveStep, string> = {
    idle: "",
    creating: "Creating doctor record…",
    ingesting: "Extracting info from doctor CV…",
    updating: "Updating doctor info with extracted data…",
    done: "Done!",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== "application/pdf") {
      toast.error("Only PDF files are accepted.");
      return;
    }
    setFile(selected);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Doctor name is required.");
      return;
    }

    try {
      if (isEditing && doctor) {
        // Update existing doctor
        setSaveStep("updating");
        await doctorService.update(doctor.guid, {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          about: about.trim() || undefined,
          specialty: specialty.trim() || undefined,
        });
        toast.success("Doctor updated successfully.");
      } else {
        // Create new doctor
        setSaveStep("creating");
        const created = await doctorService.create({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          clinic_hdr_guid: clinicGuid,
          status: "active",
        });

        // If a CV file was uploaded, trigger ingestion
        if (file) {
          setSaveStep("ingesting");
          const extraction = await doctorService.triggerFileIngestion(created.guid, file);

          // Update the doctor record with extracted data
          setSaveStep("updating");
          await doctorService.update(created.guid, {
            about: extraction.about,
            specialty: extraction.specialty,
          });
        }

        toast.success("Doctor created successfully.");
      }

      setSaveStep("done");
      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save doctor.";
      toast.error(message);
      setSaveStep("idle");
    }
  };

  const isSaving = saveStep !== "idle" && saveStep !== "done";

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
          aria-label="Back to doctor list"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </Button>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {isEditing ? "Edit Doctor" : "Add Doctor"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isEditing ? "Update doctor information." : "Add a new doctor to this clinic."}
          </p>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="doctor-name">Name</Label>
          <Input
            id="doctor-name"
            placeholder="e.g. Dr. Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="doctor-email">Email</Label>
          <Input
            id="doctor-email"
            type="email"
            placeholder="e.g. jane@clinic.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSaving}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="doctor-phone">Phone</Label>
          <Input
            id="doctor-phone"
            type="tel"
            placeholder="e.g. +1 555-0123"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Show file upload only when creating (not editing) */}
        {!isEditing && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doctor-cv">Doctor CV (PDF)</Label>
            <label
              htmlFor="doctor-cv"
              className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border cursor-pointer hover:bg-muted/30 transition-colors"
            >
              {file ? (
                <>
                  <FileText size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="text-sm text-foreground truncate">{file.name}</span>
                </>
              ) : (
                <>
                  <Upload size={18} className="text-muted-foreground shrink-0" aria-hidden="true" />
                  <span className="text-sm text-muted-foreground">Click to upload PDF</span>
                </>
              )}
            </label>
            <input
              id="doctor-cv"
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={handleFileChange}
              disabled={isSaving}
            />
            <p className="text-[11px] text-muted-foreground">
              Upload the doctor&apos;s CV to auto-extract specialty and about info.
            </p>
          </div>
        )}

        {/* Show about and specialty fields when editing */}
        {isEditing && (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doctor-specialty">Specialty</Label>
              <Input
                id="doctor-specialty"
                placeholder="e.g. Cardiology, Internal Medicine"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                disabled={isSaving}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doctor-about">About</Label>
              <Textarea
                id="doctor-about"
                placeholder="Doctor bio / background"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={4}
                disabled={isSaving}
              />
            </div>
          </>
        )}

        {/* Weekly schedule — edit mode only */}
        {isEditing && doctor && (
          <div className="border-t border-border pt-4 mt-2">
            <DoctorAvailabilityEditor
              doctorGuid={doctor.guid}
              disabled={isSaving}
            />
          </div>
        )}
      </div>

      {/* Progress message */}
      {isSaving && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border">
          <Loader2 size={14} className="animate-spin text-muted-foreground" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">{stepMessages[saveStep]}</span>
        </div>
      )}

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
            {stepMessages[saveStep]}
          </>
        ) : (
          <>
            <Save size={16} className="mr-2" aria-hidden="true" />
            Save
          </>
        )}
      </Button>
    </div>
  );
}
