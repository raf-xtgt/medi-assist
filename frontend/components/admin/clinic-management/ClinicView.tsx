"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Save, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clinicHdrService } from "@/lib/api/services/clinic-hdr-service";
import type { ClinicHdrResponse } from "@/lib/api/model/clinic-hdr.model";
import templateConfigs from "./ClinicTemplate.json";

const TEMPLATES = [
  { id: "clinical_professional", label: "Clinical Professional", image: "/clinic-site-templates/clinical-professional-template.png" },
  { id: "holistic_wellness", label: "Holistic Wellness", image: "/clinic-site-templates/holistic-wellness-template.png" },
  { id: "modern_minimalist", label: "Modern Minimalist", image: "/clinic-site-templates/modern-minimalist-template.png" },
] as const;

interface ClinicViewProps {
  clinic: ClinicHdrResponse | null;
  onSaved: () => void;
  onClose: () => void;
}

export function ClinicView({ clinic, onSaved, onClose }: ClinicViewProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [saving, setSaving] = useState(false);

  const isEditing = !!clinic;

  useEffect(() => {
    if (clinic) {
      setName(clinic.name ?? "");
      setAddress(clinic.address ?? "");
      setWebsiteName(clinic.slug ?? "");
      const meta = clinic.site_metadata as { template_id?: string } | undefined;
      setTemplateId(meta?.template_id ?? "");
    } else {
      setName("");
      setAddress("");
      setWebsiteName("");
      setTemplateId("");
    }
  }, [clinic]);

  const handleWebsiteNameChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setWebsiteName(sanitized);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Clinic name is required.");
      return;
    }
    if (!websiteName.trim()) {
      toast.error("Website name is required.");
      return;
    }

    setSaving(true);
    try {
      const selectedTemplateConfig = templateConfigs.find(
        (t) => t.template_id === templateId
      );

      const payload = {
        name: name.trim(),
        address: address.trim() || undefined,
        slug: websiteName.trim(),
        site_metadata: selectedTemplateConfig ?? undefined,
        status: "active",
      };

      if (isEditing && clinic) {
        await clinicHdrService.update(clinic.guid, payload);
        toast.success("Clinic updated successfully.");
      } else {
        await clinicHdrService.create(payload);
        toast.success("Clinic created successfully.");
      }

      onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save clinic.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const selectedTemplate = TEMPLATES.find((t) => t.id === templateId);

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {isEditing ? "Edit Clinic" : "New Clinic"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEditing
              ? "Update clinic details and template configuration."
              : "Create a new clinic with a public landing page."}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X size={16} aria-hidden="true" />
        </Button>
      </div>

      {/* Form fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clinic-name">Clinic Name</Label>
          <Input
            id="clinic-name"
            placeholder="e.g. Good Health Clinic"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clinic-address">Address</Label>
          <Textarea
            id="clinic-address"
            placeholder="Enter full clinic address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clinic-website-name">Website Name</Label>
          <Input
            id="clinic-website-name"
            placeholder="e.g. good-health-clinic"
            value={websiteName}
            onChange={(e) => handleWebsiteNameChange(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">
            Lowercase letters, numbers, and hyphens only. URL: <span className="font-mono">/clinic/{websiteName || "..."}</span>
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="clinic-template">Template</Label>
          <Select value={templateId} onValueChange={setTemplateId}>
            <SelectTrigger id="clinic-template" className="bg-background">
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Template preview */}
      {selectedTemplate ? (
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Preview
          </span>
          <div className="relative w-full flex-1 min-h-[420px] rounded-lg border border-border/60 overflow-hidden bg-muted/20">
            <Image
              src={selectedTemplate.image}
              alt={`${selectedTemplate.label} template preview`}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-[200px] rounded-lg border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
          Select a template to see a preview
        </div>
      )}

      {/* Save button */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full"
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" aria-hidden="true" />
            Saving…
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
