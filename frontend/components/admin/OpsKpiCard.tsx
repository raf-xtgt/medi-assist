import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface OpsKpiCardProps {
  label:      string;
  value:      number | string;
  sublabel?:  string;
  icon:       LucideIcon;
  accent:     "blue" | "teal" | "success" | "warning" | "danger" | "neutral";
  delta?:     { value: number; label: string };
  className?: string;
}

const accentConfig = {
  blue:    { icon: "bg-[var(--color-brand-blue-light)] text-[var(--color-brand-blue)]",    value: "text-[var(--color-brand-blue)]",  border: "border-l-[var(--color-brand-blue)]"    },
  teal:    { icon: "bg-[var(--color-brand-teal-light)] text-[var(--color-brand-teal)]",    value: "text-[var(--color-brand-teal)]",  border: "border-l-[var(--color-brand-teal)]"    },
  success: { icon: "bg-emerald-50 text-emerald-600",  value: "text-emerald-700", border: "border-l-emerald-500" },
  warning: { icon: "bg-amber-50 text-amber-600",      value: "text-amber-700",   border: "border-l-amber-500"   },
  danger:  { icon: "bg-red-50 text-red-600",          value: "text-red-700",     border: "border-l-red-500"     },
  neutral: { icon: "bg-slate-100 text-slate-600",     value: "text-slate-700",   border: "border-l-slate-400"   },
};

export function OpsKpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent,
  delta,
  className,
}: OpsKpiCardProps) {
  const cfg = accentConfig[accent];

  return (
    <div
      className={cn(
        "relative flex flex-col gap-3 rounded-lg border border-border/60 bg-card p-5 border-l-4 shadow-none",
        cfg.border,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground leading-tight">
          {label}
        </p>
        <span className={cn("flex shrink-0 items-center justify-center rounded-md p-2", cfg.icon)} aria-hidden="true">
          <Icon size={16} strokeWidth={2} />
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className={cn("text-3xl font-bold tabular-nums leading-none tracking-tight", cfg.value)}>
          {value}
        </p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
        )}
        {delta && (
          <p className={cn("mt-1 text-[11px] font-medium", delta.value >= 0 ? "text-emerald-600" : "text-red-500")}>
            {delta.value >= 0 ? "+" : ""}{delta.value}% {delta.label}
          </p>
        )}
      </div>
    </div>
  );
}
