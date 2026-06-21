"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Search, MessageCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { doctorService } from "@/lib/api/services/doctor-service";
import type { DoctorSearchResultItem } from "@/lib/api/model/doctor.model";
import { BookingFlow } from "@/components/patient/BookingFlow";
import { TriageChat } from "@/components/patient/TriageChat";

/**
 * Unified view states:
 * - "idle"       → search bar + quick actions visible
 * - "searching"  → loading state while API call runs
 * - "booking"    → doctor found, show BookingFlow with that doctor
 * - "triage"     → no doctor found OR user clicked triage CTA, show TriageChat
 * - "directory"  → user clicked "Browse All Doctors", show full BookingFlow directory
 */
type UnifiedView = "idle" | "searching" | "booking" | "triage" | "directory";

interface UnifiedBookingTriageProps {
  onBack?: () => void;
}

export function UnifiedBookingTriage({ onBack }: UnifiedBookingTriageProps) {
  const [view, setView] = useState<UnifiedView>("idle");
  const [searchValue, setSearchValue] = useState("");
  const [foundDoctor, setFoundDoctor] = useState<DoctorSearchResultItem | null>(null);
  const [initialTriageMessage, setInitialTriageMessage] = useState<string | undefined>(undefined);

  const handleSearch = useCallback(async () => {
    const query = searchValue.trim();
    if (!query) return;

    setView("searching");

    try {
      const result = await doctorService.search({ search_string: query });

      if (result.found_doctor && result.doctor_results.length > 0) {
        // Doctor found — show booking calendar
        setFoundDoctor(result.doctor_results[0]);
        setView("booking");
      } else {
        // No doctor found — treat as symptom/triage query
        setInitialTriageMessage(query);
        setView("triage");
      }
    } catch {
      // On error, fall back to triage
      setInitialTriageMessage(query);
      setView("triage");
    }
  }, [searchValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleTriageClick = () => {
    setInitialTriageMessage(undefined);
    setView("triage");
  };

  const handleBrowseClick = () => {
    setView("directory");
  };

  const handleBackToIdle = () => {
    setView("idle");
    setFoundDoctor(null);
    setInitialTriageMessage(undefined);
    setSearchValue("");
  };

  /* ── Searching state ─────────────────────────────────────── */
  if (view === "searching") {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-12">
            <span className="absolute inset-0 rounded-full border-4 border-[var(--color-brand-teal)]/20" />
            <span
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-brand-teal)]"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Finding the best match for &quot;{searchValue}&quot;…
          </p>
        </div>
      </div>
    );
  }

  /* ── Booking view (doctor found from search) ─────────────── */
  if (view === "booking" && foundDoctor) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
        {/* Back button + context banner */}
        <div className="px-4 pt-4">
          <div className="mx-auto max-w-md">
            <button
              onClick={handleBackToIdle}
              className="mb-3 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to search"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to search
            </button>
            <div className="flex items-center gap-3 rounded-xl bg-[var(--color-brand-teal-light)] border border-[var(--color-brand-teal)]/20 px-4 py-3 mb-1">
              <div className="flex size-10 items-center justify-center rounded-full bg-[var(--color-brand-teal)] shrink-0">
                <Users size={16} className="text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--color-brand-teal)] flex items-center gap-1.5">
                  <Search size={11} aria-hidden="true" />
                  Search result
                </p>
                <p className="text-sm font-semibold text-foreground truncate">{foundDoctor.name}</p>
                {foundDoctor.specialty && (
                  <p className="text-xs text-muted-foreground">{foundDoctor.specialty}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <BookingFlow
          preselectedDoctorId={foundDoctor.guid}
          onConfirmed={handleBackToIdle}
        />
      </div>
    );
  }

  /* ── Triage view ─────────────────────────────────────────── */
  if (view === "triage") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-400 h-full">
        <TriageChat
          initialMessage={initialTriageMessage}
          onBack={handleBackToIdle}
        />
      </div>
    );
  }

  /* ── Directory view (Browse All Doctors) ─────────────────── */
  if (view === "directory") {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
        <BookingFlow onBack={handleBackToIdle} />
      </div>
    );
  }

  /* ── Idle view (search bar + quick actions) ──────────────── */
  return (
    <div className="flex flex-col items-center px-5 pt-8 pb-6">
      <div className="w-full max-w-md">
        {/* Search input */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search symptoms, treatments, or type a doctor's name..."
            className={cn(
              "w-full h-13 pl-11 pr-4 rounded-2xl border border-border bg-card",
              "text-sm text-foreground placeholder:text-muted-foreground/70",
              "shadow-sm transition-all",
              "focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-teal)]/40 focus:border-[var(--color-brand-teal)]"
            )}
            aria-label="Search symptoms, treatments, or doctor name"
          />
          {searchValue.trim() && (
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-xl bg-[var(--color-brand-teal)] text-white hover:bg-[var(--color-brand-teal-dark)] transition-colors"
              aria-label="Search"
            >
              <Search size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleTriageClick}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-[var(--color-brand-blue)] text-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-light)] font-semibold gap-2"
          >
            <MessageCircle size={16} aria-hidden="true" />
            Need Triage / Chat
          </Button>
          <Button
            onClick={handleBrowseClick}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-[var(--color-brand-teal)] text-[var(--color-brand-teal)] hover:bg-[var(--color-brand-teal-light)] font-semibold gap-2"
          >
            <Users size={16} aria-hidden="true" />
            Browse All Doctors
          </Button>
        </div>
      </div>
    </div>
  );
}
