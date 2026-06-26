"use client";

import { useState, useEffect } from "react";
import { Plus, Building2, Globe, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { clinicHdrService } from "@/lib/api/services/clinic-hdr-service";
import { useSession } from "@/hooks/useSession";
import { TESTING_CLINIC_USER_GUID } from "@/lib/api/model/testing-guid.model";
import type { ClinicHdrResponse } from "@/lib/api/model/clinic-hdr.model";
import { ClinicView } from "./ClinicView";

export function ClinicListing() {
  const { user } = useSession();
  const [clinics, setClinics] = useState<ClinicHdrResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<ClinicHdrResponse | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const userGuid = TESTING_CLINIC_USER_GUID;
      const data = await clinicHdrService.getByCriteria({ user_guid: userGuid });
      setClinics(data);
    } catch {
      try {
        const data = await clinicHdrService.getAll();
        setClinics(data);
      } catch {
        setClinics([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleAddNew = () => {
    setSelectedClinic(null);
    setPanelOpen(true);
  };

  const handleClinicClick = (clinic: ClinicHdrResponse) => {
    setSelectedClinic(clinic);
    setPanelOpen(true);
  };

  const handleSaved = () => {
    setPanelOpen(false);
    fetchClinics();
  };

  const handleClose = () => {
    setPanelOpen(false);
  };

  return (
    <div className="flex gap-6 min-h-0">
      {/* Left — Clinic listing (shrinks when panel is open) */}
      <div className={`flex flex-col gap-4 transition-all duration-300 ${panelOpen ? "w-[320px] min-w-[320px]" : "flex-1"}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Clinic Management</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure and monitor all tenant clinics.
            </p>
          </div>
          <Button
            onClick={handleAddNew}
            size="icon"
            className="h-10 w-10 rounded-full"
            aria-label="Add new clinic"
          >
            <Plus size={18} aria-hidden="true" />
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <div className={`grid gap-3 ${panelOpen ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="shadow-none border-border/60">
                <CardContent className="p-4 flex flex-col gap-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : clinics.length === 0 ? (
          <Card className="shadow-none border-border/60">
            <CardContent className="p-8 flex flex-col items-center justify-center gap-2 text-center">
              <Building2 size={32} className="text-muted-foreground/50" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No clinics found.</p>
              <p className="text-xs text-muted-foreground">Click the + button to create your first clinic.</p>
            </CardContent>
          </Card>
        ) : (
          <div className={`grid gap-3 ${panelOpen ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
            {clinics.map((clinic) => (
              <Card
                key={clinic.guid}
                className={`shadow-none border-border/60 cursor-pointer hover:border-[var(--color-brand-blue)]/40 hover:bg-muted/30 transition-colors ${
                  selectedClinic?.guid === clinic.guid && panelOpen
                    ? "border-[var(--color-brand-blue)] bg-[var(--color-brand-blue-light)]"
                    : ""
                }`}
                onClick={() => handleClinicClick(clinic)}
                role="button"
                tabIndex={0}
                aria-label={`View clinic ${clinic.name || "Unnamed"}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClinicClick(clinic);
                  }
                }}
              >
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {clinic.name || "Unnamed Clinic"}
                    </span>
                    {clinic.status && !panelOpen && (
                      <Badge
                        variant="outline"
                        className="text-[10px] capitalize bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {clinic.status}
                      </Badge>
                    )}
                  </div>
                  {/* clinic slug */}
                  {clinic.slug && (
                    // redirect to site preview from the slug
                    <a
                      href={`/clinic/${clinic.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`View public site for ${clinic.name || "clinic"}`}
                    >
                      <Globe size={12} aria-hidden="true" />
                      <span className="truncate">/clinic/{clinic.slug}</span>
                    </a>
                  )}
                  {clinic.address && !panelOpen && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin size={12} aria-hidden="true" />
                      <span className="truncate">{clinic.address}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Right — Clinic detail/form panel (inline, no overlay) */}
      {panelOpen && (
        <div className="flex-1 min-w-0 border-l border-border pl-6">
          <ClinicView
            clinic={selectedClinic}
            onSaved={handleSaved}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
}
