"use client";

import { Star, ExternalLink, Navigation, Phone } from "lucide-react";

interface ClientGBPViewProps {
  clinicName: string;
  address: string;
  slug?: string;
}

export function ClientGBPView({ clinicName, address, slug }: ClientGBPViewProps) {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-background h-full">
      {/* Business name */}
      <h4 className="text-sm font-semibold text-foreground leading-tight">
        {clinicName || "Your Clinic Name"}
      </h4>

      {/* Rating */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-foreground">4.8</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < 5 ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">(543)</span>
      </div>

      {/* Category & address */}
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">
          Medical Clinic · {address || "Clinic address"}
        </span>
        <span className="text-xs text-muted-foreground">
          Closed · Opens 8:30 AM
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <a
          href={slug ? `/clinic/${slug}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          aria-label={`View public site for ${clinicName || "clinic"}`}
        >
          <ExternalLink size={12} aria-hidden="true" />
          Website
        </a>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Navigation size={12} aria-hidden="true" />
          Directions
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Phone size={12} aria-hidden="true" />
          Call
        </button>
      </div>

      {/* Review snippet */}
      <div className="border-t border-border pt-2">
        <p className="text-xs text-muted-foreground italic leading-relaxed">
          &ldquo;Excellent care and very professional staff. Highly recommend for anyone looking for quality healthcare.&rdquo;
        </p>
      </div>
    </div>
  );
}
