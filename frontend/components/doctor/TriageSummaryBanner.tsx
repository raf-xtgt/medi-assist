"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

interface TriageSummaryBannerProps {
  triageSummary?: string | null;
  /** Collapse the banner when the session goes live */
  collapsed?: boolean;
}

const PREVIEW_LENGTH = 120;

/**
 * Collapsible pre-visit triage banner.
 * Renders nothing if `triageSummary` is absent or empty.
 * Designed to sit above "Chief Complaint" inside AmbientSessionPanel.
 */
export function TriageSummaryBanner({
  triageSummary,
  collapsed = false,
}: TriageSummaryBannerProps) {
  const [expanded, setExpanded] = useState(false);

  // Auto-collapse when the session goes live (or caller requests it)
  useEffect(() => {
    if (collapsed) setExpanded(false);
  }, [collapsed]);

  if (!triageSummary || triageSummary.trim() === "") return null;

  const isLong = triageSummary.length > PREVIEW_LENGTH;
  const displayText =
    !isLong || expanded
      ? triageSummary
      : `${triageSummary.slice(0, PREVIEW_LENGTH).trimEnd()}…`;

  return (
    <div
      className={cn(
        "rounded-lg border border-[var(--color-brand-teal)]/25",
        "bg-[var(--color-brand-teal-light)] px-3 py-2.5",
        "transition-all duration-200"
      )}
      role="note"
      aria-label="Pre-visit triage summary"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Stethoscope size={14} className="text-[var(--color-brand-teal)] shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-brand-teal)]">
            Pre-visit Triage
          </span>
          <span className="text-xs text-[var(--color-brand-teal)]/60 font-normal">
            · AI-generated
          </span>
        </div>

        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "flex items-center gap-1 text-xs font-medium shrink-0",
              "text-[var(--color-brand-teal)] hover:text-[var(--color-brand-teal-dark)]",
              "transition-colors"
            )}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse triage summary" : "Expand triage summary"}
          >
            {expanded ? (
              <>
                Hide <ChevronUp size={13} />
              </>
            ) : (
              <>
                Expand <ChevronDown size={13} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Summary text */}
      <p className="text-sm text-foreground/80 leading-relaxed">
        {displayText}
      </p>
    </div>
  );
}
